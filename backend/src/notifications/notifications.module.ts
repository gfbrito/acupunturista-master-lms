import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { SettingsModule } from '../settings/settings.module';
import { WhatsappService } from './whatsapp.service';

@Module({
    imports: [PrismaModule, HttpModule, SettingsModule],
    controllers: [NotificationsController],
    providers: [NotificationsService, WhatsappService],
    exports: [NotificationsService, WhatsappService],
})
export class NotificationsModule { }
