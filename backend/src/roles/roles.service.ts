import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        name: string;
        description?: string;
        hasFullAccess: boolean;
        courseIds?: string[];
        spaceIds?: string[];
        pageIds?: string[];
    }) {
        const { courseIds, spaceIds, pageIds, ...roleData } = data;

        return this.prisma.customRole.create({
            data: {
                ...roleData,
                courses: courseIds ? { connect: courseIds.map(id => ({ id })) } : undefined,
                spaces: spaceIds ? { connect: spaceIds.map(id => ({ id })) } : undefined,
                pages: pageIds ? { connect: pageIds.map(id => ({ id })) } : undefined,
            },
            include: {
                courses: true,
                spaces: true,
                pages: true,
            }
        });
    }

    async findAll() {
        return this.prisma.customRole.findMany({
            include: {
                _count: {
                    select: { users: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    async findOne(id: string) {
        const role = await this.prisma.customRole.findUnique({
            where: { id },
            include: {
                courses: true,
                spaces: true,
                pages: true,
            }
        });
        if (!role) throw new NotFoundException('Role not found');
        return role;
    }

    async update(id: string, data: {
        name?: string;
        description?: string;
        hasFullAccess?: boolean;
        courseIds?: string[];
        spaceIds?: string[];
        pageIds?: string[];
    }) {
        const { courseIds, spaceIds, pageIds, ...roleData } = data;

        return this.prisma.customRole.update({
            where: { id },
            data: {
                ...roleData,
                courses: courseIds ? { set: courseIds.map(id => ({ id })) } : undefined,
                spaces: spaceIds ? { set: spaceIds.map(id => ({ id })) } : undefined,
                pages: pageIds ? { set: pageIds.map(id => ({ id })) } : undefined,
            },
            include: {
                courses: true,
                spaces: true,
                pages: true,
            }
        });
    }

    async remove(id: string) {
        return this.prisma.customRole.delete({
            where: { id }
        });
    }
}
