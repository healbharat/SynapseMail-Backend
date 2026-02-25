import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('db-status')
  getDbStatus() {
    return {
      status: this.connection.readyState === 1 ? 'connected' : 'disconnected',
      readyState: this.connection.readyState,
      dbName: this.connection.name,
    };
  }
}
