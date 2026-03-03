import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Gamification')
@ApiBearerAuth()
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) { }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user points' })
  @Get('points')
  async getPoints(@Request() req) {
    return this.gamificationService.getPoints(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user point history' })
  @Get('history')
  async getHistory(@Request() req) {
    return this.gamificationService.getHistory(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user badges' })
  @Get('badges')
  async getBadges(@Request() req) {
    return this.gamificationService.getBadges(req.user.userId);
  }

  @ApiOperation({ summary: 'Get the global leaderboard' })
  @Get('leaderboard')
  async getLeaderboard() {
    return this.gamificationService.getLeaderboard();
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get gamification settings' })
  @Get('settings')
  async getSettings(@Request() req) {
    // TODO: Add Admin Check
    return this.gamificationService.getSettings();
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update gamification settings' })
  @Put('settings')
  async updateSettings(@Body() body: Record<string, string>, @Request() req) {
    // TODO: Add Admin Check
    return this.gamificationService.updateSettings(body);
  }
}
