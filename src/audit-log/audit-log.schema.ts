import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ required: true })
    action: string; // 'login', 'mail_send', 'mail_delete', 'user_create'

    @Prop({ type: Object })
    details: any;

    @Prop()
    ipAddress?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
