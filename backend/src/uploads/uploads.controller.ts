import { Controller, Post, UseInterceptors, UploadedFile, Body, UseGuards, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { BunnyService } from './bunny.service';
import { R2Service } from './r2.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
    constructor(
        private readonly bunnyService: BunnyService,
        private readonly r2Service: R2Service
    ) { }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Upload a video to Bunny.net' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, title: { type: 'string' } } } })
    @Post('bunny')
    @UseInterceptors(FileInterceptor('file'))
    async uploadVideo(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 500 * 1024 * 1024 }), // 500MB
                    // Removed basic FileTypeValidator in favor of magic bytes check below
                ],
            }),
        )
        file: Express.Multer.File,
        @Body('title') title: string
    ) {
        if (!title) throw new BadRequestException('Title is required');

        // Magic Bytes Validation
        const { fileTypeFromBuffer } = await import('file-type');
        const type = await fileTypeFromBuffer(file.buffer);
        const allowed = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

        if (!type || !allowed.includes(type.mime)) {
            throw new BadRequestException(`Invalid file type detected: ${type?.mime || 'unknown'}. Allowed: ${allowed.join(', ')}`);
        }

        return this.bunnyService.uploadVideo(file, title);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Initialize Bunny.net video upload' })
    @Post('bunny/init')
    async initBunnyUpload(@Body('title') title: string) {
        if (!title) throw new BadRequestException('Title is required');
        return this.bunnyService.initUpload(title);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Upload an image' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @Post('image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
                ],
            }),
        )
        file: Express.Multer.File
    ) {
        // Magic Bytes Validation
        const { fileTypeFromBuffer } = await import('file-type');
        const type = await fileTypeFromBuffer(file.buffer);
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (!type || !allowed.includes(type.mime)) {
            throw new BadRequestException(`Invalid image type: ${type?.mime || 'unknown'}`);
        }

        const url = await this.r2Service.uploadFile(file, 'images');
        return { url };
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Upload a generic file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @Post('file')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB max for files
                    new FileTypeValidator({ fileType: /(application\/pdf|text\/plain|application\/msword|application\/vnd\.openxmlformats)/ }),
                ],
            }),
        )
        file: Express.Multer.File
    ) {
        const url = await this.r2Service.uploadFile(file, 'files');
        return { url };
    }
}
