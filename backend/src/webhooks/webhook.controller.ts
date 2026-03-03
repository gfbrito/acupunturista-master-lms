import { Controller, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
    constructor(private readonly webhookService: WebhookService) { }

    @ApiOperation({ summary: 'Handle incoming webhooks from external providers (e.g. Hotmart)' })
    @Post(':provider')
    @HttpCode(HttpStatus.OK)
    async handleWebhook(@Param('provider') provider: string, @Body() payload: any) {
        return this.webhookService.processWebhook(provider, payload);
    }
}
