import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
    constructor(private mailService: MailService) { }

    @Get()
    async globalSearch(@Query('q') query: string) {
        return this.mailService.search(query);
    }
}
