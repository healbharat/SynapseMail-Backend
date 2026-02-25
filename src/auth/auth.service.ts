import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private auditLogService: AuditLogService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async login(user: any, ipAddress?: string) {
        const payload = { email: user.email, sub: user._id, role: user.role };

        // Log success
        await this.auditLogService.log(user._id, 'login', { status: 'success' }, ipAddress);

        return {
            token: this.jwtService.sign(payload),
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }
}
