import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Create a new course (Admin only)' })
    @Post()
    async create(@Body() data: { title: string; description?: string; slug: string; thumbnail?: string; bannerUrl?: string; defaultAccessDays?: number; hasCertificate?: boolean; totalHours?: number }) {
        return this.coursesService.create(data);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all courses' })
    @Get()
    async findAll() {
        return this.coursesService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all courses with learning progress' })
    @Get('with-progress')
    async findAllWithProgress(@Request() req) {
        return this.coursesService.findAllWithProgress(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get course updates/latest lessons' })
    @Get('updates')
    async getCourseUpdates() {
        return this.coursesService.getLatestLessons();
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get a specific course by ID' })
    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string) {
        const course = await this.coursesService.findOne(id);
        if (req.user && req.user.userId) {
            const progress = await this.coursesService.getUserCourseProgress(req.user.userId, id);
            return { ...course, ...progress };
        }
        return course;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update a specific course (Admin only)' })
    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: { title?: string; description?: string; slug?: string; thumbnail?: string; bannerUrl?: string; defaultAccessDays?: number; hasCertificate?: boolean; totalHours?: number; certificateSettings?: any }) {
        return this.coursesService.update(id, data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Remove a specific course (Admin only)' })
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.coursesService.remove(id);
    }

    // Module Endpoints
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Create a module in a course (Admin only)' })
    @Post(':courseId/modules')
    async createModule(@Param('courseId') courseId: string, @Body() data: { title: string; description?: string; order: number }) {
        return this.coursesService.createModule(courseId, data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update a module (Admin only)' })
    @Patch('modules/:id')
    async updateModule(@Param('id') id: string, @Body() data: { title?: string; description?: string; order?: number }) {
        return this.coursesService.updateModule(id, data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Remove a module (Admin only)' })
    @Delete('modules/:id')
    async removeModule(@Param('id') id: string) {
        return this.coursesService.removeModule(id);
    }

    // Lesson Endpoints
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Create a lesson in a module (Admin only)' })
    @Post('modules/:moduleId/lessons')
    async createLesson(@Param('moduleId') moduleId: string, @Body() data: { title: string; content?: string; videoUrl?: string; videoType?: 'BUNNY' | 'VIMEO' | 'YOUTUBE'; durationSeconds?: number; order: number; isPublished?: boolean; materials?: { title: string; type: string; url: string }[] }) {
        return this.coursesService.createLesson(moduleId, data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update a lesson (Admin only)' })
    @Patch('lessons/:id')
    async updateLesson(@Param('id') id: string, @Body() data: { title?: string; content?: string; videoUrl?: string; videoType?: 'BUNNY' | 'VIMEO' | 'YOUTUBE'; durationSeconds?: number; order?: number; isPublished?: boolean; materials?: { title: string; type: string; url: string }[] }) {
        return this.coursesService.updateLesson(id, data);
    }

    // Progress Endpoints
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update progress of a lesson for current user' })
    @Post('lessons/:id/progress')
    async updateProgress(@Request() req, @Param('id') lessonId: string, @Body() data: { isCompleted: boolean }) {
        return this.coursesService.toggleLessonProgress(req.user.userId, lessonId, data.isCompleted);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get course progress for current user' })
    @Get(':id/progress')
    async getCourseProgress(@Request() req, @Param('id') courseId: string) {
        return this.coursesService.getUserCourseProgress(req.user.userId, courseId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Remove a lesson (Admin only)' })
    @Delete('lessons/:id')
    async removeLesson(@Param('id') id: string) {
        return this.coursesService.removeLesson(id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get a specific lesson by ID' })
    @Get('lessons/:id')
    async getLesson(@Param('id') id: string) {
        return this.coursesService.getLesson(id);
    }
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get comments of a specific lesson' })
    @Get('lessons/:id/comments')
    async getLessonComments(@Param('id') id: string) {
        return this.coursesService.getLessonComments(id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a comment on a lesson' })
    @Post('lessons/:id/comments')
    async createLessonComment(@Request() req, @Param('id') id: string, @Body() data: { content: string; parentId?: string }) {
        return this.coursesService.createLessonComment(req.user.userId, id, data.content, data.parentId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Like a specific lesson comment' })
    @Post('lessons/comments/:commentId/like')
    async likeComment(@Param('commentId') commentId: string) {
        return this.coursesService.likeComment(commentId);
    }

    // Lesson Ratings
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Rate a specific lesson' })
    @Post('lessons/:id/rate')
    async rateLesson(@Request() req, @Param('id') id: string, @Body() data: { rating: number }) {
        return this.coursesService.rateLesson(req.user.userId, id, data.rating);
    }

    @ApiOperation({ summary: 'Get the rating of a specific lesson' })
    @Get('lessons/:id/rating')
    async getLessonRating(@Param('id') id: string) {
        return this.coursesService.getLessonRating(id);
    }

    // Course Reviews
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Review a specific course' })
    @Post(':id/review')
    async reviewCourse(@Request() req, @Param('id') id: string, @Body() data: { rating: number; comment?: string }) {
        return this.coursesService.reviewCourse(req.user.userId, id, data.rating, data.comment);
    }

    @ApiOperation({ summary: 'Get all reviews of a course' })
    @Get(':id/reviews')
    async getCourseReviews(@Param('id') id: string) {
        return this.coursesService.getCourseReviews(id);
    }

    @ApiOperation({ summary: 'Get overall rating of a course' })
    @Get(':id/rating')
    async getCourseRating(@Param('id') id: string) {
        return this.coursesService.getCourseRating(id);
    }
}
