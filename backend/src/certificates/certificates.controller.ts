import { Controller, Get, Post, Body, Param, UseGuards, Res, BadRequestException, Header, Request, NotFoundException } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { Response } from 'express';

@Controller('certificates')
export class CertificatesController {
    constructor(private readonly certificatesService: CertificatesService) { }

    @UseGuards(JwtAuthGuard)
    @Post('issue')
    async issueCertificate(@Body() body: { courseId: string }, @Request() req) {
        // Warning: This assumes logic layer verification or we trust the call. 
        // Ideally, we check course progress = 100% here before issuing.
        // For now, let's assume the frontend only calls this when ready.
        // Or implement verifyCompletion in service.
        return this.certificatesService.issueCertificate(req.user.userId, body.courseId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-certificates')
    async getMyCertificates(@Request() req) {
        return this.certificatesService.getCertificates(req.user.userId);
    }

    @Get('validate/:code')
    async validate(@Param('code') code: string) {
        return this.certificatesService.validateCertificate(code);
    }

    @Get('download/:id')
    @Header('Content-Type', 'application/pdf')
    @Header('Content-Disposition', 'attachment; filename=certificate.pdf')
    async downloadCertificate(@Param('id') id: string, @Res() res: Response) {
        const stream = await this.certificatesService.generatePdfStream(id);
        stream.pipe(res);
    }

    @Get('generate/:courseId')
    @Header('Content-Type', 'application/pdf')
    @Header('Content-Disposition', 'attachment; filename=certificate.pdf')
    async generateAndDownload(
        @Param('courseId') courseId: string,
        @Request() req,
        @Res() res: Response,
        @Body() body?: any
    ) {
        // Support token from query param for direct link downloads
        const token = req.query?.token;
        let userId = req.user?.userId;

        if (!userId && token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'masterlms-secret-key-2024');
                userId = decoded.sub || decoded.userId;
            } catch (e) {
                throw new BadRequestException('Invalid token');
            }
        }

        if (!userId) {
            throw new BadRequestException('Authentication required');
        }

        // 1. Issue certificate (creates if not exists)
        const cert = await this.certificatesService.issueCertificate(userId, courseId);

        // 2. Generate PDF Stream
        const stream = await this.certificatesService.generatePdfStream(cert.id);

        // 3. Pipe to response
        stream.pipe(res);
    }
}
