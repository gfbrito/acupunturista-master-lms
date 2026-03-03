import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pages')
export class PagesController {
    constructor(private readonly pagesService: PagesService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() data: { title: string; slug: string; content: string; isVisible?: boolean }) {
        return this.pagesService.create(data);
    }

    @Get()
    findAll(@Query('visible') visible?: string) {
        const onlyVisible = visible === 'true';
        return this.pagesService.findAll(onlyVisible);
    }

    @Get(':slug')
    findOne(@Param('slug') slug: string) {
        return this.pagesService.findOne(slug);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id') // Using POST for update
    update(@Param('id') id: string, @Body() data: { title?: string; slug?: string; content?: string; isVisible?: boolean }) {
        return this.pagesService.update(id, data);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.pagesService.remove(id);
    }
}
