import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';

@Module({
    imports: [PrismaModule, EnrollmentsModule],
    controllers: [CertificatesController],
    providers: [CertificatesService],
    exports: [CertificatesService],
})
export class CertificatesModule { }
