import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SpaceType, AccessLevel, SpaceRole } from '@prisma/client';

@Injectable()
export class SpacesService {
    constructor(private prisma: PrismaService) { }

    // --- Space Groups ---

    async createSpaceGroup(data: { title: string; slug: string; order?: number; isVisible?: boolean }) {
        return this.prisma.spaceGroup.create({
            data: {
                ...data,
                order: data.order || 0,
                isVisible: data.isVisible ?? true,
            },
        });
    }

    async findAllSpaceGroups() {
        return this.prisma.spaceGroup.findMany({
            include: {
                spaces: {
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { order: 'asc' },
        });
    }

    async updateSpaceGroup(id: string, data: { title?: string; slug?: string; order?: number; isVisible?: boolean }) {
        return this.prisma.spaceGroup.update({
            where: { id },
            data,
        });
    }

    async removeSpaceGroup(id: string) {
        return this.prisma.spaceGroup.delete({
            where: { id },
        });
    }

    // --- Spaces ---

    async createSpace(data: {
        spaceGroupId: string;
        title: string;
        slug: string;
        icon?: string;
        coverUrl?: string;
        isDynamicCover?: boolean;
        type?: SpaceType;
        accessLevel?: AccessLevel;
        order?: number;
        courseId?: string;
        autoJoinRule?: any;
    }) {
        return this.prisma.space.create({
            data: {
                ...data,
                type: data.type || 'DISCUSSION',
                accessLevel: data.accessLevel || 'PUBLIC',
                order: data.order || 0,
                isDynamicCover: data.isDynamicCover || false,
            },
        });
    }

    async findAllSpaces() {
        return this.prisma.space.findMany({
            include: {
                spaceGroup: true,
            },
            orderBy: { order: 'asc' },
        });
    }

    async findSpaceBySlug(slug: string) {
        const space = await this.prisma.space.findUnique({
            where: { slug },
            include: {
                spaceGroup: true,
                course: true,
            },
        });
        if (!space) throw new NotFoundException('Space not found');
        return space;
    }

    async updateSpace(id: string, data: {
        title?: string;
        slug?: string;
        icon?: string;
        coverUrl?: string;
        isDynamicCover?: boolean;
        type?: SpaceType;
        accessLevel?: AccessLevel;
        order?: number;
        courseId?: string;
        autoJoinRule?: any;
        spaceGroupId?: string;
    }) {
        return this.prisma.space.update({
            where: { id },
            data,
        });
    }

    async removeSpace(id: string) {
        return this.prisma.space.delete({
            where: { id },
        });
    }

    // --- Membership ---

    async joinSpace(userId: string, spaceId: string) {
        const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
        if (!space) throw new NotFoundException('Space not found');

        // Access Control Logic
        if (space.accessLevel !== 'PUBLIC') {
            // For Private/Secret spaces, users cannot simply "join" via API without an invite or auto-join rule.
            // However, for MVP, we might want to allow it if we don't have an invite system yet.
            // But strictly speaking, if it's PRIVATE, they shouldn't be able to join freely.
            // Let's restrict it to PUBLIC only for direct user action.
            // Auto-join (via EnrollmentsService) will bypass this method or use a different one.
            // Actually, EnrollmentsService calls this method. We need a flag or a separate method.
            // Let's add an optional 'isAdminOrSystem' flag or just separate the logic.
            // For simplicity, let's allow it if it's called internally, but we can't easily distinguish here without context.
            // Better approach: create a separate method 'addMember' for system use, and keep 'joinSpace' for user action.
            throw new BadRequestException('Cannot join private or secret space directly. You must be invited or enrolled in a linked course.');
        }

        return this.addMember(userId, spaceId);
    }

    async addMember(userId: string, spaceId: string, role: SpaceRole = 'MEMBER') {
        return this.prisma.spaceMember.create({
            data: {
                userId,
                spaceId,
                role,
            },
        });
    }

    async leaveSpace(userId: string, spaceId: string) {
        return this.prisma.spaceMember.delete({
            where: {
                spaceId_userId: {
                    spaceId,
                    userId,
                },
            },
        });
    }

    async getSpaceMembers(spaceId: string) {
        return this.prisma.spaceMember.findMany({
            where: { spaceId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
    }
}
