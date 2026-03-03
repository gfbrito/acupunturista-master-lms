import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async getProfile(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                badges: { include: { badge: true } },
                pointHistory: { orderBy: { createdAt: 'desc' }, take: 5 },
                enrollments: { include: { course: true }, orderBy: { createdAt: 'desc' } },
            },
        });

        if (!user) return null;

        const { passwordHash, ...result } = user;
        return result;
    }
    async updateProfile(id: string, data: any) {
        const user = await this.prisma.user.update({
            where: { id },
            data,
        });
        const { passwordHash, ...result } = user;
        return result;
    }

    async create(data: {
        email: string;
        name: string;
        passwordHash: string;
        subscriptionEndsAt?: Date;
    }) {
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                passwordHash: data.passwordHash,
                subscriptionEndsAt: data.subscriptionEndsAt,
                role: 'USER',
            },
        });
        const { passwordHash, ...result } = user;
        return result;
    }

    async changePassword(id: string, currentPass: string, newPass: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new Error('User not found');

        const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
        if (!isMatch) {
            return false;
        }

        const hashedPassword = await bcrypt.hash(newPass, 10);
        await this.prisma.user.update({
            where: { id },
            data: { passwordHash: hashedPassword },
        });

        return true;
    }
    async resetPassword(id: string, newPass: string) {
        const hashedPassword = await bcrypt.hash(newPass, 10);
        await this.prisma.user.update({
            where: { id },
            data: { passwordHash: hashedPassword },
        });
        return true;
    }
}
