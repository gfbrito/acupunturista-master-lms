import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
    constructor(private prisma: PrismaService) { }

    async create(data: { title: string; slug: string; content: string; isVisible?: boolean }) {
        return this.prisma.customPage.create({
            data,
        });
    }

    async findAll(onlyVisible: boolean = false) {
        const where = onlyVisible ? { isVisible: true } : {};
        return this.prisma.customPage.findMany({
            where,
            orderBy: { title: 'asc' },
        });
    }

    async findOne(slug: string) {
        const page = await this.prisma.customPage.findUnique({
            where: { slug },
        });
        if (!page) throw new NotFoundException('Page not found');
        return page;
    }

    async update(id: string, data: { title?: string; slug?: string; content?: string; isVisible?: boolean }) {
        return this.prisma.customPage.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.customPage.delete({
            where: { id },
        });
    }
}
