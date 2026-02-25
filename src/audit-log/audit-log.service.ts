import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit-log.schema';

@Injectable()
export class AuditLogService {
    constructor(@InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>) { }

    async log(userId: string, action: string, details: any, ipAddress?: string): Promise<void> {
        const log = new this.auditLogModel({
            userId,
            action,
            details,
            ipAddress,
        });
        await log.save();
    }

    async findRecent(limit = 100): Promise<AuditLogDocument[]> {
        return this.auditLogModel.find().sort({ createdAt: -1 }).limit(limit).populate('userId', 'email').exec();
    }
}
