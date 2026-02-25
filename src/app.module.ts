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
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGODB_URI');
        const jwtSecret = config.get<string>('JWT_SECRET');
        if (!uri) throw new Error('CRITICAL: MONGODB_URI is missing!');
        if (!jwtSecret) throw new Error('CRITICAL: JWT_SECRET is missing!');
        return { uri };
      },
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
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) { }

  async onModuleInit() {
    // Seed super admin if it doesn't exist
    const companyDomain = this.configService.get('COMPANY_DOMAIN') || 'synapse.com';
    const adminEmail = `admin@${companyDomain}`;

    const admin = await this.userService.findByEmail(adminEmail);
    if (!admin) {
      await this.userService.create({
        email: adminEmail,
        password: 'adminPassword123!',
        name: 'Super Admin',
        role: 'super_admin',
        storageLimit: 10 * 1024 * 1024 * 1024, // 10GB
      });
      console.log(`Super Admin created: ${adminEmail}`);
    }
  }
}
