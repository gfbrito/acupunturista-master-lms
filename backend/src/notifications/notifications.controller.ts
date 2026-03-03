import { Controller, Get, Patch, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @ApiOperation({ summary: 'Get all notifications for current user' })
    @Get()
    async findAll(@Request() req) {
        const notifications = await this.notificationsService.findAll(req.user.userId);
        const unreadCount = await this.notificationsService.getUnreadCount(req.user.userId);
        return { notifications, unreadCount };
    }

    @ApiOperation({ summary: 'Mark all notifications as read for current user' })
    @Patch('read-all')
    async markAllAsRead(@Request() req) {
        return this.notificationsService.markAllAsRead(req.user.userId);
    }

    @ApiOperation({ summary: 'Mark a specific notification as read' })
    @Patch(':id/read')
    async markAsRead(@Param('id') id: string, @Request() req) {
        return this.notificationsService.markAsRead(id, req.user.userId);
    }

    @ApiOperation({ summary: 'Send a new notification (Admin/System)' })
    @Post('send')
    async sendNotification(@Body() data: {
        userId?: string;
        title: string;
        message: string;
        link?: string;
        type?: string;
        sendToAll?: boolean
    }) {
        if (data.sendToAll) {
            return this.notificationsService.sendToAll(data.title, data.message, data.link, data.type);
        } else if (data.userId) {
            return this.notificationsService.create(data.userId, data.type || 'SYSTEM', data.title, data.message, data.link);
        } else {
            throw new Error('Either userId or sendToAll must be provided');
        }
    }
}
