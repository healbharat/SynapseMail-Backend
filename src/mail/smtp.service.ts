import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            secure: this.configService.get<number>('SMTP_PORT') === 465,
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASS'),
            },
        });
    }

    async sendExternalMail(to: string, subject: string, content: string, attachments: any[] = []) {
        const from = this.configService.get<string>('SMTP_FROM');

        const mailOptions = {
            from: `"SynapseMail" <${from}>`,
            to,
            subject,
            html: content,
            attachments: attachments.map(att => ({
                filename: att.filename,
                content: att.content,
                contentType: att.mimetype,
            })),
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('SMTP Error:', error);
            return { success: false, error: error.message };
        }
    }
}
