import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [MailModule],
    controllers: [SearchController],
})
export class SearchModule { }
