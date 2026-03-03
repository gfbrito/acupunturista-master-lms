import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class WebhooksService {
    constructor(
        private prisma: PrismaService,
        private enrollmentsService: EnrollmentsService,
    ) { }

    async processHotmartWebhook(payload: any) {
        // Basic Hotmart payload mapping (adjust based on actual payload structure)
        const { email, name } = payload.buyer;
        const { product_id } = payload.product;
        const transaction = payload.purchase.transaction;

        // 1. Find or create user
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            const tempPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(tempPassword, 10);
            user = await this.prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash: hashedPassword,
                    // TODO: Send email with temp password
                },
            });
        }

        // 2. Find course by provider product id
        const providerProduct = await this.prisma.providerProduct.findFirst({
            where: { provider: 'hotmart', providerProductId: String(product_id) },
        });

        if (!providerProduct) {
            console.warn(`Product not found for ID: ${product_id}`);
            return;
        }

        // 3. Create/Update Enrollment
        await this.enrollmentsService.createOrUpdateEnrollment(
            user.id,
            providerProduct.courseId,
            providerProduct.durationDays,
            'hotmart',
            transaction,
        );

        // 4. Log transaction
        await this.prisma.transaction.create({
            data: {
                provider: 'hotmart',
                providerProductId: String(product_id),
                rawPayload: payload,
                processed: true,
            },
        });
    }
}
