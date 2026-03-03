import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get upcoming events' })
    @Get()
    async getUpcomingEvents() {
        return this.eventsService.getUpcomingEvents();
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a new event' })
    @Post()
    async createEvent(@Body() data: { title: string; description?: string; startAt: string; endAt: string; link?: string; visibility: string }) {
        return this.eventsService.createEvent({
            ...data,
            startAt: new Date(data.startAt),
            endAt: new Date(data.endAt),
        });
    }
}
