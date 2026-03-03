import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    async getUpcomingEvents() {
        return this.prisma.event.findMany({
            where: {
                startAt: {
                    gte: new Date(),
                },
            },
            orderBy: {
                startAt: 'asc',
            },
            take: 10,
        });
    }

    async createEvent(data: { title: string; description?: string; startAt: Date; endAt: Date; link?: string; visibility: string }) {
        return this.prisma.event.create({
            data,
        });
    }
}
