import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { Mail, MailSchema } from './mail.schema';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { NotificationModule } from '../notification/notification.module';
import { SmtpService } from './smtp.service';
import { AttachmentModule } from '../attachment/attachment.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Mail.name, schema: MailSchema }]),
        AuditLogModule,
        NotificationModule,
        AttachmentModule,
    ],
    providers: [MailService, SmtpService],
    controllers: [MailController],
    exports: [MailService],
})
export class MailModule { }
