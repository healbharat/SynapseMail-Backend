import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
    imports: [UserModule, MailModule, AuditLogModule],
    controllers: [AdminController],
})
export class AdminModule { }
