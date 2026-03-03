import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Enrollments')
@ApiBearerAuth()
@Controller('enrollments')
export class EnrollmentsController {
    constructor(private readonly enrollmentsService: EnrollmentsService) { }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create or update an enrollment (Admin only)' })
    @Post()
    async create(@Body() data: { userId: string; courseId: string; durationDays: number }) {
        return this.enrollmentsService.createOrUpdateEnrollment(
            data.userId,
            data.courseId,
            data.durationDays || 365,
            'MANUAL',
            'ADMIN_PANEL'
        );
    }
}
