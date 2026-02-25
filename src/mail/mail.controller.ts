import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { MailService } from './mail.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('mails')
@UseGuards(JwtAuthGuard)
export class MailController {
    constructor(private mailService: MailService) { }

    @Post()
    @Post('send')
    async send(@Request() req, @Body() body: any) {
        return this.mailService.sendMail(req.user.userId, body);
    }

    @Get()
    async getMails(@Request() req, @Query('folder') folder: string) {
        if (folder === 'sent') {
            return this.mailService.findSent(req.user.userId);
        }
        return this.mailService.findInbox(req.user.email);
    }

    @Get('inbox')
    async getInbox(@Request() req) {
        return this.mailService.findInbox(req.user.email);
    }

    @Post('draft')
    async saveDraft(@Request() req, @Body() body: any) {
        return this.mailService.createDraft(req.user.userId, body);
    }

    @Delete(':id')
    async delete(@Request() req, @Param('id') id: string) {
        return this.mailService.deleteMail(req.user.userId, id);
    }

    @Post('read/:id')
    async markRead(@Param('id') id: string) {
        return this.mailService.markAsRead(id);
    }

    @Get('search')
    async search(@Query('q') q: string) {
        return this.mailService.search(q);
    }
}
