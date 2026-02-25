import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditLogService } from '../audit-log/audit-log.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
    constructor(
        private userService: UserService,
        private mailService: MailService,
        private auditLogService: AuditLogService,
    ) { }

    @Get('stats')
    async getStats(@Request() req) {
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            throw new Error('Forbidden');
        }

        const userCount = await this.userService.countAll();
        const mailCount = await this.mailService.countAll();

        // Calculate total storage (sum of storageUsed in User collection)
        const users = await this.userService.findAll();
        const totalStorage = users.reduce((acc, user) => acc + (user.storageUsed || 0), 0);

        return {
            userCount,
            mailCount,
            totalStorage,
            storageLimit: users.reduce((acc, user) => acc + (user.storageLimit || 0), 0),
        };
    }

    @Post('create-user')
    async createUser(@Request() req, @Body() body: any) {
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            throw new Error('Forbidden');
        }

        // Automatic email generation if not provided or to ensure company domain
        const emailPrefix = body.name.toLowerCase().replace(/\s+/g, '.');
        const companyDomain = process.env.COMPANY_DOMAIN || 'synapse.com';
        const generatedEmail = body.email || `${emailPrefix}@${companyDomain}`;

        const newUser = await this.userService.create({
            ...body,
            email: generatedEmail,
            status: 'active',
        });

        await this.auditLogService.log(req.user.userId, 'user_create', { targetUserId: newUser._id });

        return newUser;
    }

    @Get('users')
    async getUsers(@Request() req) {
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            throw new Error('Forbidden');
        }
        return this.userService.findAll();
    }

    @Get('logs')
    async getLogs(@Request() req) {
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            throw new Error('Forbidden');
        }
        return this.auditLogService.findRecent(200);
    }
}
