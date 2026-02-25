import { Controller, Post, Body, Request, UseGuards, Ip, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body: any, @Ip() ip: string) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user, ip);
    }

    @Post('logout')
    async logout(@Request() req) {
        // Client-side logout handles token removal, but we can log it
        return { success: true };
    }
}
