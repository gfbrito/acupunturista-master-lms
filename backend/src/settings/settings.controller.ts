import { Controller, Get, Post, Body, Param, UseGuards, ForbiddenException, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

// Keys that are sensitive and require admin access
const SENSITIVE_KEYS = ['evolution_api_key', 'evolution_api_url', 'evolution_instance', 'bunny_api_key', 'r2_secret'];

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @ApiOperation({ summary: 'Get a specific system setting by key' })
    @Get(':key')
    async getSetting(@Param('key') key: string) {
        // Block access to sensitive keys without authentication
        if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
            throw new ForbiddenException('Access denied to sensitive settings');
        }
        const value = await this.settingsService.getSetting(key);
        return { key, value };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create or update a system setting (Admin only)' })
    @Post()
    async upsertSetting(@Body() data: { key: string; value: string }) {
        return this.settingsService.upsertSetting(data.key, data.value);
    }
}
