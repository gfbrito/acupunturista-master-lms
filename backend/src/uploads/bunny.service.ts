import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class BunnyService {
    private readonly apiKey = process.env.BUNNY_API_KEY;
    private readonly libraryId = process.env.BUNNY_LIBRARY_ID;
    private readonly baseUrl = `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`;

    async uploadVideo(file: Express.Multer.File, title: string) {
        if (!this.apiKey || !this.libraryId) {
            throw new InternalServerErrorException('Bunny.net credentials not configured');
        }

        try {
            // 1. Create Video Entry
            const createRes = await axios.post(
                this.baseUrl,
                { title },
                { headers: { AccessKey: this.apiKey } }
            );
            const videoId = createRes.data.guid;

            // 2. Upload File Content
            await axios.put(
                `${this.baseUrl}/${videoId}`,
                file.buffer,
                {
                    headers: {
                        AccessKey: this.apiKey,
                        'Content-Type': 'application/octet-stream',
                    },
                }
            );

            return {
                videoId,
                videoProvider: 'BUNNY',
                status: 'UPLOADED', // Bunny processes async, but upload is done
            };
        } catch (error) {
            console.error('Bunny upload error:', error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to upload video to Bunny.net');
        }
    }

    async initUpload(title: string) {
        if (!this.apiKey || !this.libraryId) {
            throw new InternalServerErrorException('Bunny.net credentials not configured');
        }

        try {
            // 1. Create Video Entry
            const createRes = await axios.post(
                this.baseUrl,
                { title },
                { headers: { AccessKey: this.apiKey } }
            );
            const videoId = createRes.data.guid;

            // 2. Generate SHA256 Signature for TUS
            // Signature = hex(sha256(libraryId + apiKey + expirationTime + videoId))
            const expirationTime = Date.now() + 3600 * 1000; // 1 hour expiration
            const signatureString = `${this.libraryId}${this.apiKey}${expirationTime}${videoId}`;
            const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

            return {
                videoId,
                authorizationSignature: signature,
                authorizationExpire: expirationTime,
                libraryId: this.libraryId,
                uploadEndpoint: 'https://video.bunnycdn.com/tusupload',
                embedUrl: `https://iframe.mediadelivery.net/embed/${this.libraryId}/${videoId}`,
            };
        } catch (error) {
            console.error('Bunny init upload error:', error.response?.data || error.message);
            throw new InternalServerErrorException('Failed to initialize Bunny.net upload');
        }
    }
}
