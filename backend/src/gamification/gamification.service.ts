import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeCondition } from '@prisma/client';

@Injectable()
export class GamificationService {
    constructor(private prisma: PrismaService) { }

    async getSettings() {
        const settings = await this.prisma.systemSetting.findMany({
            where: {
                key: {
                    startsWith: 'gamification_'
                }
            }
        });

        const defaultSettings = {
            gamification_enabled: 'false',
            gamification_points_post: '10',
            gamification_points_comment: '5',
            gamification_points_lesson: '20',
            gamification_points_course: '100',
            gamification_points_like: '1'
        };

        const result = { ...defaultSettings };
        settings.forEach(s => {
            result[s.key] = s.value;
        });

        return result;
    }

    async updateSettings(settings: Record<string, string>) {
        const updates = Object.entries(settings).map(([key, value]) => {
            return this.prisma.systemSetting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) },
            });
        });

        await this.prisma.$transaction(updates);
        return this.getSettings();
    }

    async addPoints(userId: string, points: number, reason: string) {
        // Check if gamification is enabled
        const enabledSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'gamification_enabled' }
        });

        if (enabledSetting?.value !== 'true') {
            return null; // Gamification disabled
        }

        // 1. Add to history
        await this.prisma.pointHistory.create({
            data: {
                userId,
                points,
                reason,
            },
        });

        // 2. Update user total
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                points: { increment: points },
            },
        });

        return user;
    }

    async addPointsForAction(userId: string, action: 'post' | 'comment' | 'lesson' | 'course' | 'like') {
        const settings = await this.getSettings();

        if (settings.gamification_enabled !== 'true') return;

        const pointsKey = `gamification_points_${action}`;
        const points = parseInt(settings[pointsKey] || '0', 10);

        if (points > 0) {
            await this.addPoints(userId, points, `Action: ${action}`);
        }
    }

    async getPoints(userId: string) {
        const enabledSetting = await this.prisma.systemSetting.findUnique({
            where: { key: 'gamification_enabled' }
        });

        if (enabledSetting?.value !== 'true') {
            return 0;
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { points: true },
        });
        return user?.points || 0;
    }

    async getHistory(userId: string) {
        return this.prisma.pointHistory.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }

    async getBadges(userId: string) {
        return this.prisma.userBadge.findMany({
            where: { userId },
            include: { badge: true },
        });
    }

    async checkBadges(userId: string) {
        // Logic to check and award badges based on conditions
        // For MVP, we can implement a simple check for 'FIRST_LESSON'
        // This would typically be called after a relevant action (e.g., lesson completion)

        // Example: Check for First Lesson Badge
        const completedLessons = await this.prisma.lessonProgress.count({
            where: { userId, status: 'COMPLETED' },
        });

        if (completedLessons >= 1) {
            await this.awardBadge(userId, BadgeCondition.FIRST_LESSON);
        }

        // Add more conditions here
    }

    private async awardBadge(userId: string, condition: BadgeCondition) {
        const badge = await this.prisma.badge.findFirst({
            where: { condition },
        });

        if (!badge) return;

        const existing = await this.prisma.userBadge.findUnique({
            where: {
                userId_badgeId: {
                    userId,
                    badgeId: badge.id,
                },
            },
        });

        if (!existing) {
            await this.prisma.userBadge.create({
                data: {
                    userId,
                    badgeId: badge.id,
                },
            });
        }
    }

    async getLeaderboard() {
        return this.prisma.user.findMany({
            orderBy: { points: 'desc' },
            take: 10,
            select: {
                id: true,
                name: true,
                avatar: true,
                points: true,
            },
        });
    }
}
