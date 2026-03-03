import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, type: string, title: string, message: string, link?: string) {
        return this.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                link,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50, // Limit to last 50 notifications
        });
    }

    async getUnreadCount(userId: string) {
        return this.prisma.notification.count({
            where: {
                userId,
                read: false,
            },
        });
    }

    async markAsRead(id: string, userId: string) {
        // Ensure notification belongs to user
        const notification = await this.prisma.notification.findFirst({
            where: { id, userId },
        });

        if (!notification) return null;

        return this.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }

    async sendToAll(title: string, message: string, link?: string, type: string = 'SYSTEM') {
        const users = await this.prisma.user.findMany({ select: { id: true } });

        // Create notifications in batch
        // Prisma createMany is supported in recent versions
        return this.prisma.notification.createMany({
            data: users.map(user => ({
                userId: user.id,
                title,
                message,
                link,
                type,
                read: false
            }))
        });
    }
}
