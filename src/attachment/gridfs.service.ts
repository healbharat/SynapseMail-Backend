import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

@Injectable()
export class GridFsService implements OnModuleInit {
    private bucket: GridFSBucket;

    constructor(@InjectConnection() private readonly connection: Connection) { }

    onModuleInit() {
        if (!this.connection.db) {
            throw new Error('Database connection not established');
        }
        this.bucket = new GridFSBucket(this.connection.db as any, {
            bucketName: 'attachments',
        });
    }

    async getFileContent(id: string): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
        const fileId = new ObjectId(id);
        const files = await (this.connection.db!.collection('attachments.files') as any).find({ _id: fileId }).toArray();

        if (files.length === 0) throw new Error('File not found');

        const downloadStream = this.bucket.openDownloadStream(fileId);
        const chunks: Buffer[] = [];

        return new Promise((resolve, reject) => {
            downloadStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            downloadStream.on('error', (err) => reject(err));
            downloadStream.on('end', () => {
                resolve({
                    buffer: Buffer.concat(chunks),
                    filename: files[0].filename,
                    contentType: files[0].contentType,
                });
            });
        });
    }
}
