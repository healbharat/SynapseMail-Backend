import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { GridFsService } from './gridfs.service';

@Module({
    controllers: [AttachmentController],
    providers: [GridFsService],
    exports: [GridFsService],
})
export class AttachmentModule { }
