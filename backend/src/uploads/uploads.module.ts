import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { UploadsController } from './uploads.controller';
import { BunnyService } from './bunny.service';
import { R2Service } from './r2.service';

@Module({
    imports: [
        MulterModule.register({
            storage: multer.memoryStorage(),
        }),
    ],
    controllers: [UploadsController],
    providers: [BunnyService, R2Service],
    exports: [BunnyService, R2Service],
})
export class UploadsModule { }
