import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Mail, MailDocument } from './mail.schema';
import { AuditLogService } from '../audit-log/audit-log.service';
import { NotificationGateway } from '../notification/notification.gateway';
import { SmtpService } from './smtp.service';
import { ConfigService } from '@nestjs/config';
import { GridFsService } from '../attachment/gridfs.service';

@Injectable()
export class MailService implements OnModuleInit {
    constructor(
        @InjectModel(Mail.name) private mailModel: Model<MailDocument>,
        private auditLogService: AuditLogService,
        private notificationGateway: NotificationGateway,
        private configService: ConfigService,
        private smtpService: SmtpService,
        private gridFsService: GridFsService,
    ) { }

    async sendMail(senderId: string, data: any): Promise<MailDocument> {
        const { to, ...rest } = data;
        const companyDomain = this.configService.get<string>('COMPANY_DOMAIN');
        const isExternal = !to.endsWith(`@${companyDomain}`);

        const mail = new this.mailModel({
            ...rest,
            recipientEmail: to,
            sender: new Types.ObjectId(senderId),
            sentAt: new Date(),
            isExternal,
            deliveryStatus: isExternal ? 'pending' : 'delivered',
        });

        const savedMail = await mail.save();

        if (isExternal) {
            // Fetch attachments if any
            const externalAttachments: any[] = [];
            if (data.attachments && data.attachments.length > 0) {
                for (const attId of data.attachments) {
                    try {
                        const file = await this.gridFsService.getFileContent(attId);
                        externalAttachments.push({
                            filename: file.filename,
                            content: file.buffer,
                            mimetype: file.contentType,
                        });
                    } catch (e) {
                        console.error(`Failed to attach file ${attId}`, e);
                    }
                }
            }

            // Send via SMTP
            const smtpRes = await this.smtpService.sendExternalMail(
                to,
                data.subject,
                data.content,
                externalAttachments
            );

            if (smtpRes.success) {
                savedMail.deliveryStatus = 'sent';
            } else {
                savedMail.deliveryStatus = 'failed';
                // Logic for retry queue could be added here
            }
            await savedMail.save();
            await this.auditLogService.log(senderId, 'external_delivery', { mailId: savedMail._id, status: savedMail.deliveryStatus });
        } else {
            // Internal delivery
            this.notificationGateway.notifyNewMail(to, {
                id: savedMail._id,
                subject: savedMail.subject,
                from: data.senderEmail,
            });
            await this.auditLogService.log(senderId, 'mail_send', { mailId: savedMail._id, to });
        }

        return savedMail;
    }

    async findInbox(email: string): Promise<any[]> {
        const mails = await this.mailModel
            .find({ recipientEmail: email, folder: 'inbox' })
            .populate('sender', 'name')
            .sort({ createdAt: -1 })
            .exec();

        return mails.map(m => ({
            ...m.toJSON(),
            sender_name: (m.sender as any)?.name || 'Unknown'
        }));
    }

    async findSent(senderId: string): Promise<any[]> {
        const mails = await this.mailModel
            .find({ sender: new Types.ObjectId(senderId) })
            .populate('sender', 'name')
            .sort({ createdAt: -1 })
            .exec();

        return mails.map(m => ({
            ...m.toJSON(),
            sender_name: (m.sender as any)?.name || 'Unknown'
        }));
    }

    async markAsRead(id: string): Promise<void> {
        await this.mailModel.findByIdAndUpdate(id, { isRead: true });
    }

    async deleteMail(senderId: string, id: string): Promise<void> {
        await this.mailModel.findByIdAndDelete(id);
        await this.auditLogService.log(senderId, 'mail_delete', { mailId: id });
    }

    async search(query: string): Promise<MailDocument[]> {
        return this.mailModel.find({ $text: { $search: query } }).exec();
    }

    async createDraft(senderId: string, data: any): Promise<MailDocument> {
        const { to, ...rest } = data;
        const mail = new this.mailModel({
            ...rest,
            recipientEmail: to || '',
            sender: new Types.ObjectId(senderId),
            folder: 'drafts',
        });
        return mail.save();
    }

    async countAll(): Promise<number> {
        return this.mailModel.countDocuments().exec();
    }

    // Basic Retry Queue for failed external mails
    async retryFailedMails() {
        const failedMails = await this.mailModel.find({
            isExternal: true,
            deliveryStatus: 'failed',
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
        }).limit(10);

        for (const mail of failedMails) {
            console.log(`Retrying external mail ${mail._id} to ${mail.recipientEmail}`);
            // Logic to resend... (omitted for brevity, would call sendMail logic again without creating new record)
            const smtpRes = await this.smtpService.sendExternalMail(
                mail.recipientEmail,
                mail.subject,
                mail.content,
                [] // In a full implementation, would re-fetch attachments
            );

            if (smtpRes.success) {
                mail.deliveryStatus = 'sent';
            }
            await mail.save();
        }
    }

    onModuleInit() {
        setInterval(() => this.retryFailedMails(), 15 * 60 * 1000); // Every 15 mins
    }
}
