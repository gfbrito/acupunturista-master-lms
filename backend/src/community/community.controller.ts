import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Community')
@ApiBearerAuth()
@Controller('community')
export class CommunityController {
    constructor(private readonly communityService: CommunityService) { }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get community posts with optional space filter' })
    @Get('posts')
    async getPosts(@Query('page') page: number = 1, @Query('spaceId') spaceId?: string) {
        return this.communityService.getPosts(Number(page), 10, spaceId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get the personalized feed for current user' })
    @Get('feed')
    async getFeed(@Request() req, @Query('page') page: number = 1) {
        return this.communityService.getFeed(req.user.userId, Number(page), 10);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get trending community posts' })
    @Get('posts/trending')
    async getTrendingPosts() {
        return this.communityService.getTrendingPosts();
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a new community post' })
    @Post('posts')
    async createPost(@Request() req, @Body() data: { content: string; title?: string; imageUrl?: string; spaceId?: string; poll?: { question: string, options: string[] } }) {
        return this.communityService.createPost(req.user.userId, data.content, data.spaceId, data.title, data.imageUrl, data.poll);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Like a specific community post' })
    @Post('posts/:id/like')
    async likePost(@Param('id') id: string, @Request() req) {
        return this.communityService.likePost(id, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Vote on a specific poll option' })
    @Post('polls/:id/vote')
    async votePoll(@Request() req, @Param('id') id: string, @Body() data: { optionId: string }) {
        return this.communityService.votePoll(req.user.userId, id, data.optionId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Add a comment to a specific post' })
    @Post('posts/:id/comments')
    async addComment(@Request() req, @Param('id') id: string, @Body() data: { content: string }) {
        return this.communityService.addComment(req.user.userId, id, data.content);
    }
}
