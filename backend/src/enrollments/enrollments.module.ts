import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { SpacesModule } from '../spaces/spaces.module';

@Module({
  imports: [PrismaModule, SpacesModule],
  providers: [EnrollmentsService],
  controllers: [EnrollmentsController],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule { }
