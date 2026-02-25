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
        try {
            const user = await this.userService.findByEmail(email);
            if (user && await bcrypt.compare(pass, user.password)) {
                const { password, ...result } = user.toObject();
                return result;
            }
            return null;
        } catch (err) {
            console.error('validateUser error:', err);
            throw err;
        }
    }

    async login(user: any, ipAddress?: string) {
        try {
            const payload = { email: user.email, sub: user._id.toString(), role: user.role };

            // Log success
            try {
                await this.auditLogService.log(user._id.toString(), 'login', { status: 'success' }, ipAddress);
            } catch (auditErr) {
                console.error('Audit logging failed, but proceeding:', auditErr);
            }

            return {
                token: this.jwtService.sign(payload),
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            };
        } catch (err) {
            console.error('Login method error:', err);
            throw err;
        }
    }
}
