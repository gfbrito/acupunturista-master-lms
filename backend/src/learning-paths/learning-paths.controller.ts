import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { LearningPathsService } from './learning-paths.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('learning-paths')
export class LearningPathsController {
    constructor(private readonly learningPathsService: LearningPathsService) { }

    @Get()
    findAll() {
        return this.learningPathsService.findAll();
    }

    @Get(':slug')
    findOne(@Param('slug') slug: string) {
        return this.learningPathsService.findBySlug(slug);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createLearningPathDto: any) {
        return this.learningPathsService.create(createLearningPathDto);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(@Param('id') id: string, @Body() updateLearningPathDto: any) {
        return this.learningPathsService.update(id, updateLearningPathDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.learningPathsService.delete(id);
    }
}
