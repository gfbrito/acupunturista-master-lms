import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [EnrollmentsModule, PrismaModule],
  providers: [WebhooksService],
  controllers: [WebhooksController],
})
export class WebhooksModule { }
