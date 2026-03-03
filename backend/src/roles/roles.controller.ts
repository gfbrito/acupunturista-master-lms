import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post()
    create(@Body() data: {
        name: string;
        description?: string;
        hasFullAccess: boolean;
        courseIds?: string[];
        spaceIds?: string[];
        pageIds?: string[];
    }) {
        return this.rolesService.create(data);
    }

    @Get()
    findAll() {
        return this.rolesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: {
        name?: string;
        description?: string;
        hasFullAccess?: boolean;
        courseIds?: string[];
        spaceIds?: string[];
        pageIds?: string[];
    }) {
        return this.rolesService.update(id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.rolesService.remove(id);
    }
}
