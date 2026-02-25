import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { NotificationModule } from './notification/notification.module';
import { AttachmentModule } from './attachment/attachment.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { SearchModule } from './search/search.module';
import { UserService } from './user/user.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('MONGODB_URI'),
      }),
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    AuthModule,
    MailModule,
    UserModule,
    AdminModule,
    NotificationModule,
    AttachmentModule,
    AuditLogModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private userService: UserService) { }

  async onModuleInit() {
    // Seed super admin if it doesn't exist
    const admin = await this.userService.findByEmail('admin@synapse.com');
    if (!admin) {
      await this.userService.create({
        email: 'admin@synapse.com',
        password: 'adminPassword123!',
        name: 'Super Admin',
        role: 'super_admin',
        storageLimit: 10 * 1024 * 1024 * 1024, // 10GB
      });
      console.log('Super Admin created: admin@synapse.com');
    }
  }
}
