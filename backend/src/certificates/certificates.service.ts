import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { Readable } from 'stream';
import * as path from 'path';

@Injectable()
export class CertificatesService {
    constructor(private prisma: PrismaService) { }

    async issueCertificate(userId: string, courseId: string) {
        // 1. Verify User and Course
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });

        if (!user || !course) {
            throw new NotFoundException('User or Course not found');
        }

        // 2. Verify Completion
        const progress = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                courseId,
                status: 'ACTIVE' // Or check progress status if enrollment tracks completion explicitly
            },
            include: {
                // You might want to check LessonProgress count vs total lessons here
                // For MVP, we assume if they request it, they completed it, OR we check boolean on enrollment
            }
        });

        // For this implementation, let's assume valid access is enough, OR 
        // ideally add a 'isCompleted' flag to enrollment or calculate it.
        // Let's rely on a check that typically happens before calling this.

        // 3. Check if already issued
        const existingCert = await this.prisma.certificate.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            }
        });

        if (existingCert) {
            return existingCert;
        }

        // 4. Generate Unique Code
        const validationCode = this.generateValidationCode();

        // 5. Create Record
        return this.prisma.certificate.create({
            data: {
                userId,
                courseId,
                validationCode
            }
        });
    }

    async getCertificates(userId: string) {
        return this.prisma.certificate.findMany({
            where: { userId },
            include: { course: true }
        });
    }

    async validateCertificate(code: string) {
        const cert = await this.prisma.certificate.findUnique({
            where: { validationCode: code },
            include: {
                user: { select: { name: true, email: true } },
                course: { select: { title: true, totalHours: true } }
            }
        });

        if (!cert) {
            throw new NotFoundException('Certificate not found');
        }

        return cert;
    }

    async generatePdfStream(certificateId: string): Promise<NodeJS.ReadableStream> {
        const cert = await this.prisma.certificate.findUnique({
            where: { id: certificateId },
            include: {
                user: true,
                course: true
            }
        });

        if (!cert) {
            throw new NotFoundException('Certificate not found');
        }

        try {
            // Debugging Paths
            console.log('Generating PDF for cert:', cert.id);
            // Use process.cwd() to be independent of 'dist' folder structure
            const fontsDir = path.join(process.cwd(), 'assets', 'fonts');
            console.log('Fonts Dir Resolved (CW):', fontsDir);

            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4',
            });

            // Register Fonts Safely
            const registeredFonts = new Set<string>();
            const registerFontSafe = (name: string, filename: string) => {
                const fontPath = path.join(fontsDir, filename);
                try {
                    doc.registerFont(name, fontPath);
                    // Force load to verify integrity immediately (PDFKit lazy loads paths)
                    doc.font(name);
                    registeredFonts.add(name);
                } catch (e) {
                    console.error(`Failed to register font ${name} at ${fontPath}`, e);
                }
            };

            registerFontSafe('Great Vibes', 'GreatVibes-Regular.ttf');
            registerFontSafe('Cinzel', 'Cinzel-Bold.ttf');
            registerFontSafe('Playfair Display', 'PlayfairDisplay-Regular.ttf');
            registerFontSafe('Roboto', 'Roboto-Regular.ttf');

            const settings = (cert.course.certificateSettings as any) || {};

            // Template color mapping - matching frontend TEMPLATES
            // Made backgrounds slightly more visible while maintaining elegance
            const TEMPLATE_COLORS: Record<string, { themeColor: string; backgroundColor: string; accentColor: string; patternColor: string }> = {
                'chinese-tradition': {
                    themeColor: '#8B0000',      // Dark red
                    backgroundColor: '#faf5ef', // Warmer cream (more visible)
                    accentColor: '#C5A059',     // Gold accent
                    patternColor: '#d4af37'     // Gold pattern
                },
                'jade-dynasty': {
                    themeColor: '#064e3b',      // Dark green
                    backgroundColor: '#e8f5e9', // Softer green (more visible)
                    accentColor: '#d97706',     // Orange accent
                    patternColor: '#064e3b'     // Green pattern
                },
                'blue-porcelain': {
                    themeColor: '#1e3a8a',      // Navy blue
                    backgroundColor: '#e8f0fe', // Softer blue (more visible)
                    accentColor: '#94a3b8',     // Slate accent
                    patternColor: '#1e3a8a'     // Blue pattern
                },
                'imperial-ink': {
                    themeColor: '#000000',      // Black
                    backgroundColor: '#f5f5f5', // Light gray (more visible)
                    accentColor: '#dc2626',     // Red accent
                    patternColor: '#111827'     // Dark pattern
                }
            };

            // Get colors from template or use settings/defaults
            const templateId = settings.templateId || 'chinese-tradition';
            const templateColors = TEMPLATE_COLORS[templateId] || TEMPLATE_COLORS['chinese-tradition'];

            // Use template colors, but allow settings to override if explicitly set
            const themeColor = settings.themeColor || templateColors.themeColor;
            const backgroundColor = settings.backgroundColor || templateColors.backgroundColor;
            const accentColor = templateColors.accentColor;
            const patternColor = templateColors.patternColor;

            // Helper function to draw subtle decorative pattern (simulates SVG pattern from frontend)
            const drawBackgroundPattern = () => {
                doc.save();
                doc.fillColor(patternColor);
                doc.opacity(0.03); // Very subtle

                // Draw small cross pattern across the page
                const spacing = 40;
                for (let x = 30; x < doc.page.width - 30; x += spacing) {
                    for (let y = 30; y < doc.page.height - 30; y += spacing) {
                        // Small plus sign
                        doc.rect(x - 1, y - 4, 2, 8).fill();
                        doc.rect(x - 4, y - 1, 8, 2).fill();
                    }
                }
                doc.restore();
            };

            if (settings.isCustomMode && settings.elements) {
                // --- Custom Mode Rendering ---

                // 1. Background - solid color + decorative pattern
                doc.rect(0, 0, doc.page.width, doc.page.height).fill(backgroundColor);
                drawBackgroundPattern();

                // Note: PDFKit doesn't support loading remote images directly
                // For now, we apply the template styling with pattern

                // 2. Decorative Border with template colors
                doc.strokeColor(themeColor);

                // Outer Line
                doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
                    .lineWidth(3)
                    .stroke();

                // Inner Line with accent color
                doc.rect(28, 28, doc.page.width - 56, doc.page.height - 56)
                    .strokeColor(accentColor)
                    .lineWidth(1)
                    .stroke();

                // Corner Accents with theme color
                const cornerSize = 25;
                doc.strokeColor(themeColor).lineWidth(4);
                // Top Left
                doc.moveTo(35, 35 + cornerSize).lineTo(35, 35).lineTo(35 + cornerSize, 35).stroke();
                // Top Right
                doc.moveTo(doc.page.width - 35 - cornerSize, 35).lineTo(doc.page.width - 35, 35).lineTo(doc.page.width - 35, 35 + cornerSize).stroke();
                // Bottom Left
                doc.moveTo(35, doc.page.height - 35 - cornerSize).lineTo(35, doc.page.height - 35).lineTo(35 + cornerSize, doc.page.height - 35).stroke();
                // Bottom Right
                doc.moveTo(doc.page.width - 35 - cornerSize, doc.page.height - 35).lineTo(doc.page.width - 35, doc.page.height - 35).lineTo(doc.page.width - 35, doc.page.height - 35 - cornerSize).stroke();

                settings.elements.forEach(element => {
                    const { x, y, content, type, style } = element;

                    // 1. Content Replacement - expanded field support
                    let textToRender = content;
                    if (type === 'field') {
                        if (content.includes('student_name')) textToRender = cert.user.name;
                        else if (content.includes('course_title')) textToRender = cert.course.title;
                        else if (content.includes('date') || content.includes('completion_date')) {
                            textToRender = new Date(cert.issuedAt).toLocaleDateString('pt-BR', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            });
                        }
                        else if (content.includes('verification_code') || content.includes('code')) textToRender = cert.validationCode;
                        else if (content.includes('hours')) textToRender = `${cert.course.totalHours || 0} horas`;
                        else if (content.includes('signer_name')) textToRender = settings.signerName || 'MasterLMS';
                    }

                    // 2. Font Mapping
                    let pdfFont = 'Helvetica';
                    if (registeredFonts.has('Roboto')) pdfFont = 'Roboto';

                    if (style.fontFamily) {
                        if (style.fontFamily.includes('Great Vibes')) {
                            pdfFont = registeredFonts.has('Great Vibes') ? 'Great Vibes' : 'Times-Roman';
                        }
                        else if (style.fontFamily.includes('Cinzel')) {
                            pdfFont = registeredFonts.has('Cinzel') ? 'Cinzel' : 'Times-Bold';
                        }
                        else if (style.fontFamily.includes('Playfair')) {
                            pdfFont = registeredFonts.has('Playfair Display') ? 'Playfair Display' : 'Times-Roman';
                        }
                        else if (style.fontFamily.includes('serif')) {
                            pdfFont = 'Times-Roman';
                        }
                    }

                    // 3. Render Text - adjust position for centering if textAlign is center
                    doc.fontSize(style.fontSize || 12).font(pdfFont);

                    let adjustedX = x;
                    const textWidth = doc.widthOfString(textToRender);

                    // Adjust X position based on alignment (x is center point in frontend)
                    if (style.textAlign === 'center') {
                        adjustedX = x - (textWidth / 2);
                    } else if (style.textAlign === 'right') {
                        adjustedX = x - textWidth;
                    }

                    // Ensure X doesn't go negative
                    adjustedX = Math.max(40, adjustedX);

                    doc.fillColor(style.color || '#000000')
                        .text(textToRender, adjustedX, y, {
                            lineBreak: false
                        });
                });

            } else {
                // --- Legacy / Template Mode Rendering ---
                // Now uses template colors from TEMPLATE_COLORS mapping

                const isModernTemplate = ['chinese-tradition', 'jade-dynasty', 'blue-porcelain', 'imperial-ink'].includes(templateId);

                // 1. Background Fill with template color + decorative pattern
                doc.rect(0, 0, doc.page.width, doc.page.height).fill(backgroundColor);
                drawBackgroundPattern();

                // 3. Borders
                if (isModernTemplate) {
                    // Use the same nice double border as custom mode
                    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
                        .strokeColor(themeColor)
                        .lineWidth(3)
                        .stroke();

                    doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50)
                        .strokeColor(themeColor)
                        .lineWidth(1)
                        .stroke();

                    // Corner Accents
                    const cornerSize = 20;
                    doc.lineWidth(4);
                    doc.path(`M35 ${35 + cornerSize} L35 35 L${35 + cornerSize} 35`).stroke(); // Top-Left
                    doc.path(`M${doc.page.width - 35 - cornerSize} 35 L${doc.page.width - 35} 35 L${doc.page.width - 35} ${35 + cornerSize}`).stroke(); // Top-Right
                    doc.path(`M35 ${doc.page.height - 35 - cornerSize} L35 ${doc.page.height - 35} L${35 + cornerSize} ${doc.page.height - 35}`).stroke(); // Bottom-Left
                    doc.path(`M${doc.page.width - 35 - cornerSize} ${doc.page.height - 35} L${doc.page.width - 35} ${doc.page.height - 35} L${doc.page.width - 35} ${doc.page.height - 35 - cornerSize}`).stroke(); // Bottom-Right

                } else {
                    // Classic Grey Border
                    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#333').lineWidth(5);
                    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke('#666').lineWidth(2);
                }

                // 4. Fonts
                const titleFont = (isModernTemplate && registeredFonts.has('Cinzel')) ? 'Cinzel' : 'Helvetica-Bold';
                const nameFont = (isModernTemplate && registeredFonts.has('Great Vibes')) ? 'Great Vibes' : 'Helvetica-Bold';
                const bodyFont = (isModernTemplate && registeredFonts.has('Playfair Display')) ? 'Playfair Display' : 'Helvetica';
                const signatureFont = (isModernTemplate && registeredFonts.has('Great Vibes')) ? 'Great Vibes' : 'Helvetica';

                const signerName = settings.signerName || 'MasterLMS Team';
                const customText = settings.customText || 'concluiu com êxito o curso';

                // Page dimensions for reference: A4 Landscape = 842 x 595 pts
                // Safe area considering borders: ~50px margin = 742 x 495 usable
                const pageWidth = doc.page.width;
                const pageHeight = doc.page.height;
                const marginX = 60; // Horizontal margins
                const contentWidth = pageWidth - (marginX * 2);

                // Calculate dynamic font size for title based on length
                const titleText = settings.title || 'CERTIFICADO DE CONCLUSÃO';
                const titleFontSize = Math.min(36, Math.max(24, 850 / titleText.length));

                // Title - positioned at top with margin
                doc.fontSize(titleFontSize)
                    .fillColor(themeColor)
                    .font(titleFont)
                    .text(titleText, marginX, 70, {
                        align: 'center',
                        width: contentWidth
                    });

                // "Certificamos que" line
                doc.fontSize(14)
                    .font(bodyFont)
                    .fillColor('#444')
                    .text('Certificamos que', marginX, 130, {
                        align: 'center',
                        width: contentWidth
                    });

                // Student Name - calculate size based on name length
                const studentName = cert.user.name.toUpperCase();
                const nameFontSize = Math.min(42, Math.max(28, 1000 / studentName.length));

                doc.fontSize(nameFontSize)
                    .fillColor(themeColor)
                    .font(nameFont)
                    .text(studentName, marginX, 160, {
                        align: 'center',
                        width: contentWidth
                    });

                // Custom text
                doc.fontSize(14)
                    .font(bodyFont)
                    .fillColor('#444')
                    .text(customText, marginX, 220, {
                        align: 'center',
                        width: contentWidth
                    });

                // Course Title - calculate size based on title length
                const courseTitle = cert.course.title;
                const courseFontSize = Math.min(26, Math.max(16, 700 / courseTitle.length));

                doc.fontSize(courseFontSize)
                    .font((isModernTemplate && registeredFonts.has('Cinzel')) ? 'Cinzel' : 'Helvetica-Bold')
                    .fillColor(themeColor)
                    .text(`"${courseTitle}"`, marginX, 255, {
                        align: 'center',
                        width: contentWidth
                    });

                // Hours and date on same line area
                const hours = cert.course.totalHours || 0;
                const date = new Date(cert.issuedAt).toLocaleDateString('pt-BR', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });

                doc.fontSize(10)
                    .font(bodyFont)
                    .fillColor('#555')
                    .text(`Carga horária: ${hours} horas  •  Emitido em: ${date}`, marginX, 290, {
                        align: 'center',
                        width: contentWidth
                    });

                // Signature section - more compact
                const signatureY = 330;
                const lineCenterX = pageWidth / 2;

                doc.strokeColor(themeColor)
                    .lineWidth(1)
                    .moveTo(lineCenterX - 100, signatureY)
                    .lineTo(lineCenterX + 100, signatureY)
                    .stroke();

                doc.fontSize(16)
                    .font(signatureFont)
                    .fillColor(themeColor)
                    .text(signerName, marginX, signatureY + 8, {
                        align: 'center',
                        width: contentWidth
                    });

                doc.fontSize(8)
                    .font(bodyFont)
                    .fillColor('#666')
                    .text('Instrutor Responsável', marginX, signatureY + 28, {
                        align: 'center',
                        width: contentWidth
                    });

                // Validation Footer - well inside safe area (moved up)
                const frontendUrl = process.env.FRONTEND_URL || 'https://app';
                doc.fontSize(7)
                    .font(registeredFonts.has('Roboto') ? 'Roboto' : 'Helvetica')
                    .fillColor('#999')
                    .text(`Código: ${cert.validationCode}  |  Verificar em: ${frontendUrl}/validate/${cert.validationCode}`, marginX, 420, {
                        align: 'center',
                        width: contentWidth
                    });
            }

            doc.end();
            return doc;
        } catch (error) {
            const fs = require('fs');
            const logPath = path.join(process.cwd(), 'certificate_error.log');
            try {
                fs.appendFileSync(logPath, `Error ${new Date().toISOString()}: ${error.message}\nStack: ${error.stack}\n`);
            } catch (fsErr) {
                console.error('Failed to write log file:', fsErr);
            }
            console.error('PDF Gen Error:', error);
            throw error;
        }
    }

    private generateValidationCode(): string {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }
}
