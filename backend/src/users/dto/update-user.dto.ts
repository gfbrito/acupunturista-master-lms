import { IsString, MinLength, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    surname?: string;

    @IsOptional()
    @IsString()
    whatsapp?: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsBoolean()
    notifyByWhatsapp?: boolean;

    @IsOptional()
    @IsBoolean()
    notifyByEmail?: boolean;
}

export class ChangePasswordDto {
    @IsString()
    @MinLength(6)
    currentPassword: string;

    @IsString()
    @MinLength(8, { message: 'New password must be at least 8 characters' })
    newPassword: string;
}

export class CreateUserDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    whatsapp?: string;

    @IsOptional()
    @IsString()
    subscriptionEndsAt?: string;
}
