import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { GamificationModule } from './gamification/gamification.module';
import { CommunityModule } from './community/community.module';
import { EventsModule } from './events/events.module';

import { WebhookModule } from './webhooks/webhook.module';

import { UploadsModule } from './uploads/uploads.module';
import { SpacesModule } from './spaces/spaces.module';
import { ConfigModule } from '@nestjs/config';
import { PagesModule } from './pages/pages.module';
import { SettingsModule } from './settings/settings.module';
import { SearchModule } from './search/search.module';
import { RolesModule } from './roles/roles.module';

import { NotificationsModule } from './notifications/notifications.module';
import { LearningPathsModule } from './learning-paths/learning-paths.module';
import { CertificatesModule } from './certificates/certificates.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    UploadsModule,
    EnrollmentsModule,
    WebhookModule, // Changed from WebhooksModule to WebhookModule to match original import
    EventsModule,
    CommunityModule,
    SpacesModule,
    RolesModule,
    PagesModule,
    SearchModule,
    SettingsModule,
    GamificationModule,
    NotificationsModule,
    NotificationsModule,
    LearningPathsModule,
    CertificatesModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
