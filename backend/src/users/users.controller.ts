import { Controller, Get, Param, UseGuards, Request, Patch, Body, Post, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateProfileDto, ChangePasswordDto, CreateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import * as bcrypt from 'bcrypt';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Find all users (Admin only)' })
    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Create a new user (Admin only)' })
    @Post()
    async create(@Body() data: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.usersService.create({
            email: data.email,
            name: data.name,
            passwordHash: hashedPassword,
            subscriptionEndsAt: data.subscriptionEndsAt ? new Date(data.subscriptionEndsAt) : undefined,
        });
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current logged in user profile' })
    @Get('me')
    async getProfile(@Request() req) {
        return this.usersService.getProfile(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get a specific user by ID' })
    @Get(':id')
    async getUser(@Param('id') id: string) {
        return this.usersService.getProfile(id);
    }
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update current user profile' })
    @Patch('me')
    async updateProfile(@Request() req, @Body() data: UpdateProfileDto) {
        return this.usersService.updateProfile(req.user.userId, data);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Change current user password' })
    @Post('me/password')
    async changePassword(@Request() req, @Body() data: ChangePasswordDto) {
        const result = await this.usersService.changePassword(
            req.user.userId,
            data.currentPassword,
            data.newPassword,
        );
        if (!result) {
            throw new BadRequestException('Current password does not match');
        }
        return { message: 'Password updated successfully' };
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Reset a user password to default (Admin only)' })
    @Post(':id/reset-password')
    async resetPassword(@Param('id') id: string) {
        // Default password hardcoded as requested
        const defaultPassword = 'estudando123';
        await this.usersService.resetPassword(id, defaultPassword);
        return { message: `Password reset to ${defaultPassword}` };
    }
}
