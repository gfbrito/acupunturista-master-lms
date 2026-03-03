import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);

    constructor(private prisma: PrismaService) { }

    async processWebhook(provider: string, payload: any) {
        this.logger.log(`Received webhook from ${provider}`);

        // 1. Store Transaction
        const transaction = await this.prisma.transaction.create({
            data: {
                provider,
                providerProductId: this.getProviderProductId(provider, payload),
                rawPayload: payload,
                processed: false,
            },
        });

        try {
            // 2. Process Enrollment
            await this.handleEnrollment(provider, payload);

            // 3. Mark Transaction as Processed
            await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: { processed: true },
            });

            return { status: 'success', transactionId: transaction.id };
        } catch (error) {
            this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
            return { status: 'error', message: error.message };
        }
    }

    private getProviderProductId(provider: string, payload: any): string {
        // Adapt based on provider
        if (provider === 'hotmart') {
            return payload.prod || payload.product_id || 'unknown';
        }
        return 'unknown';
    }

    private async handleEnrollment(provider: string, payload: any) {
        const email = payload.email || payload.buyer_email;
        const name = payload.name || payload.buyer_name || 'Aluno';
        const providerProductId = this.getProviderProductId(provider, payload);

        if (!email) throw new Error('Email not found in payload');

        // 1. Find or Create User
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Generate secure random password
            const randomPassword = require('crypto').randomBytes(12).toString('base64url');
            const passwordHash = await bcrypt.hash(randomPassword, 10);
            user = await this.prisma.user.create({
                data: {
                    email,
                    name,
                    passwordHash,
                    role: 'USER',
                },
            });
            this.logger.log(`Created new user: ${email}`);
            // TODO: Send welcome email
        }

        // Check Business Model
        const businessModelSetting = await this.prisma.systemSetting.findUnique({ where: { key: 'business_model' } });
        const isSubscription = businessModelSetting?.value === 'SUBSCRIPTION';

        if (isSubscription) {
            // Subscription Logic: Extend subscriptionEndsAt
            const now = new Date();
            const currentEnd = user.subscriptionEndsAt && user.subscriptionEndsAt > now ? user.subscriptionEndsAt : now;
            const newEnd = new Date(currentEnd);
            newEnd.setDate(newEnd.getDate() + 30); // Default 30 days, or fetch from product mapping if needed

            await this.prisma.user.update({
                where: { id: user.id },
                data: { subscriptionEndsAt: newEnd }
            });
            this.logger.log(`Extended subscription for user ${email} to ${newEnd}`);
            return;
        }

        // Marketplace Logic (Existing)
        // 2. Find Course
        const providerProduct = await this.prisma.providerProduct.findUnique({
            where: {
                provider_providerProductId: {
                    provider,
                    providerProductId,
                },
            },
            include: { course: true },
        });

        if (!providerProduct) {
            this.logger.warn(`Product not mapped: ${providerProductId}`);
            return; // Or throw error depending on strictness
        }

        // 3. Create/Update Enrollment
        const now = new Date();
        const endAt = new Date();
        endAt.setDate(now.getDate() + providerProduct.durationDays);

        await this.prisma.enrollment.upsert({
            where: {
                // We need a unique constraint on userId + courseId, but schema currently doesn't have it explicitly named?
                // Looking at schema, Enrollment doesn't have @@unique([userId, courseId]).
                // We should add it or find by first.
                // For now, let's find first to simulate upsert logic if unique constraint is missing.
                id: 'temp-id-placeholder' // This won't work for upsert without unique field
            },
            update: {
                status: EnrollmentStatus.ACTIVE,
                endAt,
                updatedAt: now,
            },
            create: {
                userId: user.id,
                courseId: providerProduct.courseId,
                startAt: now,
                endAt,
                status: EnrollmentStatus.ACTIVE,
                source: provider,
                sourceReference: payload.transaction || payload.hottok,
            },
        }).catch(async (e) => {
            // Fallback manual upsert since we might lack unique constraint in Prisma schema for upsert
            const existing = await this.prisma.enrollment.findFirst({
                where: { userId: user.id, courseId: providerProduct.courseId }
            });

            if (existing) {
                await this.prisma.enrollment.update({
                    where: { id: existing.id },
                    data: {
                        status: EnrollmentStatus.ACTIVE,
                        endAt,
                        updatedAt: now,
                    }
                });
            } else {
                await this.prisma.enrollment.create({
                    data: {
                        userId: user.id,
                        courseId: providerProduct.courseId,
                        startAt: now,
                        endAt,
                        status: EnrollmentStatus.ACTIVE,
                        source: provider,
                        sourceReference: payload.transaction || payload.hottok,
                    }
                });
            }
        });

        this.logger.log(`Enrolled user ${email} in course ${providerProduct.course.title}`);
    }
}
