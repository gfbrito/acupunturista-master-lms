import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class R2Service {
    private s3Client: S3Client;
    private bucketName = process.env.R2_BUCKET_NAME;
    private accountId = process.env.R2_ACCOUNT_ID;
    private publicUrl = process.env.R2_PUBLIC_URL; // e.g., https://pub-xxx.r2.dev

    constructor() {
        if (this.accountId && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
            this.s3Client = new S3Client({
                region: 'auto',
                endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: process.env.R2_ACCESS_KEY_ID,
                    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
                },
            });
        }
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<string> {
        if (!this.s3Client || !this.bucketName) {
            console.warn('R2 credentials not configured');
            throw new InternalServerErrorException('Storage not configured');
        }

        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

        try {
            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
                // ACL: 'public-read', // R2 doesn't support ACLs the same way, usually bucket policy handles it
            }));

            // Return the public URL
            return `${this.publicUrl}/${fileName}`;
        } catch (error) {
            console.error('R2 Upload Error:', error);
            throw new InternalServerErrorException('Failed to upload file');
        }
    }

    async deleteFile(fileUrl: string) {
        if (!this.s3Client || !this.bucketName) return;

        try {
            // Extract key from URL
            // URL: https://pub-xxx.r2.dev/uploads/filename.jpg
            // Key: uploads/filename.jpg
            const key = fileUrl.replace(`${this.publicUrl}/`, '');

            await this.s3Client.send(new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            }));
        } catch (error) {
            console.error('R2 Delete Error:', error);
            // Don't throw, just log
        }
    }
}
