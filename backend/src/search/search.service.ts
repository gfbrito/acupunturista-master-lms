import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
    constructor(private prisma: PrismaService) { }

    async search(query: string) {
        if (!query || query.trim().length === 0) {
            return { spaces: [], courses: [], pages: [] };
        }

        const searchTerm = query.trim();

        const [spaces, courses, pages] = await Promise.all([
            this.prisma.space.findMany({
                where: {
                    OR: [
                        { title: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    type: true,
                },
                take: 5,
            }),
            this.prisma.course.findMany({
                where: {
                    OR: [
                        { title: { contains: searchTerm, mode: 'insensitive' } },
                        { description: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    thumbnail: true,
                },
                take: 5,
            }),
            this.prisma.customPage.findMany({
                where: {
                    isVisible: true,
                    OR: [
                        { title: { contains: searchTerm, mode: 'insensitive' } },
                        { content: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                },
                take: 5,
            }),
        ]);

        return { spaces, courses, pages };
    }
}
