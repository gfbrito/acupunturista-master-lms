import { Controller, Post, Body } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) { }

    @Post('hotmart')
    async handleHotmart(@Body() payload: any) {
        await this.webhooksService.processHotmartWebhook(payload);
        return { status: 'received' };
    }
}
