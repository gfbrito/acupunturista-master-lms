import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SpacesService } from './spaces.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SpaceType, AccessLevel } from '@prisma/client';

@ApiTags('Spaces')
@ApiBearerAuth()
@Controller()
export class SpacesController {
    constructor(private readonly spacesService: SpacesService) { }

    // --- Space Groups ---

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a new space group' })
    @Post('space-groups')
    createGroup(@Body() data: { title: string; slug: string; order?: number; isVisible?: boolean }) {
        return this.spacesService.createSpaceGroup(data);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all space groups' })
    @Get('space-groups')
    findAllGroups() {
        return this.spacesService.findAllSpaceGroups();
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update a space group' })
    @Patch('space-groups/:id')
    updateGroup(@Param('id') id: string, @Body() data: { title?: string; slug?: string; order?: number; isVisible?: boolean }) {
        return this.spacesService.updateSpaceGroup(id, data);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Remove a space group' })
    @Delete('space-groups/:id')
    removeGroup(@Param('id') id: string) {
        return this.spacesService.removeSpaceGroup(id);
    }

    // --- Spaces ---

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a new space' })
    @Post('spaces')
    createSpace(@Body() data: {
        spaceGroupId: string;
        title: string;
        slug: string;
        icon?: string;
        coverUrl?: string;
        isDynamicCover?: boolean;
        type?: SpaceType;
        accessLevel?: AccessLevel;
        order?: number;
        courseId?: string;
        autoJoinRule?: any;
    }) {
        return this.spacesService.createSpace(data);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all spaces' })
    @Get('spaces')
    findAllSpaces() {
        return this.spacesService.findAllSpaces();
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get a space by slug' })
    @Get('spaces/:slug')
    findSpace(@Param('slug') slug: string) {
        return this.spacesService.findSpaceBySlug(slug);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update a space' })
    @Patch('spaces/:id')
    updateSpace(@Param('id') id: string, @Body() data: {
        title?: string;
        slug?: string;
        icon?: string;
        coverUrl?: string;
        isDynamicCover?: boolean;
        type?: SpaceType;
        accessLevel?: AccessLevel;
        order?: number;
        courseId?: string;
        autoJoinRule?: any;
        spaceGroupId?: string;
    }) {
        return this.spacesService.updateSpace(id, data);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Remove a space' })
    @Delete('spaces/:id')
    removeSpace(@Param('id') id: string) {
        return this.spacesService.removeSpace(id);
    }

    // --- Membership ---

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Join a specific space' })
    @Post('spaces/:id/join')
    joinSpace(@Request() req, @Param('id') id: string) {
        return this.spacesService.joinSpace(req.user.userId, id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Leave a specific space' })
    @Delete('spaces/:id/leave')
    leaveSpace(@Request() req, @Param('id') id: string) {
        return this.spacesService.leaveSpace(req.user.userId, id);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get members of a specific space' })
    @Get('spaces/:id/members')
    getMembers(@Param('id') id: string) {
        return this.spacesService.getSpaceMembers(id);
    }
}
