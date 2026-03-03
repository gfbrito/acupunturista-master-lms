import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CertificatesModule } from '../certificates/certificates.module';

@Module({
  imports: [PrismaModule, AuthModule, CertificatesModule],
  providers: [CoursesService],
  controllers: [CoursesController]
})
export class CoursesModule { }
