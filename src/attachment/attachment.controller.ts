import {
    Controller,
    Post,
    Get,
    Param,
    Res,
    UploadedFile,
    UseInterceptors,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GridFsService } from './gridfs.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Readable } from 'stream';
import { ObjectId } from 'mongodb';

@Controller('attachment')
@UseGuards(JwtAuthGuard)
export class AttachmentController {
    constructor(private readonly gridFsService: GridFsService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: any) {
        const bucket = this.gridFsService.getBucket();
        const uploadStream = bucket.openUploadStream(file.originalname, {
            contentType: file.mimetype,
        });

        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);

        return new Promise((resolve, reject) => {
            readableStream
                .pipe(uploadStream)
                .on('error', (error) => reject(error))
                .on('finish', () => {
                    resolve({
                        id: uploadStream.id,
                        filename: file.originalname,
                        size: file.size,
                    });
                });
        });
    }

    @Get(':id')
    async getFile(@Param('id') id: string, @Res() res: Response) {
        const bucket = this.gridFsService.getBucket();
        const downloadStream = bucket.openDownloadStream(new ObjectId(id));

        downloadStream.on('data', (chunk) => res.write(chunk));
        downloadStream.on('error', () => res.status(HttpStatus.NOT_FOUND).send());
        downloadStream.on('end', () => res.end());
    }
}
