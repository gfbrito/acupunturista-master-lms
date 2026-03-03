
import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);

    constructor(
        private settingsService: SettingsService,
        private httpService: HttpService
    ) { }

    private async getConfig() {
        const baseUrl = await this.settingsService.getSetting('EVOLUTION_API_URL');
        const apiKey = await this.settingsService.getSetting('EVOLUTION_API_KEY');
        const instance = await this.settingsService.getSetting('EVOLUTION_INSTANCE_NAME');

        if (!baseUrl || !apiKey || !instance) {
            this.logger.warn('Whatsapp configuration missing');
            return null;
        }

        return { baseUrl, apiKey, instance };
    }

    async sendText(to: string, message: string) {
        const config = await this.getConfig();
        if (!config) return false;

        // Ensure clean number (only digits)
        const cleanNumber = to.replace(/\D/g, '');

        // Evolution API URL structure: {baseUrl}/message/sendText/{instance}
        const url = `${config.baseUrl}/message/sendText/${config.instance}`;

        try {
            const payload = {
                number: cleanNumber,
                text: message, // Some versions use 'text' or 'textMessage'
                options: {
                    delay: 1200,
                    presence: 'composing',
                    linkPreview: true
                }
            };

            await firstValueFrom(
                this.httpService.post(url, payload, {
                    headers: {
                        'apikey': config.apiKey,
                        'Content-Type': 'application/json'
                    }
                })
            );

            this.logger.log(`WhatsApp message sent to ${cleanNumber}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send WhatsApp message to ${cleanNumber}`, error.response?.data || error.message);
            return false;
        }
    }
}
