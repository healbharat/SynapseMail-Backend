import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MailDocument = Mail & Document;

@Schema({
    timestamps: true,
    toJSON: {
        transform: (doc: any, ret: any) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        },
    },
})
export class Mail {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    sender: Types.ObjectId;

    @Prop({ required: true })
    recipientEmail: string;

    @Prop({ required: true })
    subject: string;

    @Prop({ required: true })
    content: string; // Changed from 'body' to 'content' to match frontend

    @Prop({ default: 'inbox' })
    folder: string; // 'inbox', 'sent', 'drafts', 'trash'

    @Prop({ default: false })
    isRead: boolean;

    @Prop({ default: false })
    isStarred: boolean;

    @Prop({ type: [{ type: String }] }) // GridFS File IDs
    attachments: string[];

    @Prop({ default: false })
    isExternal: boolean;

    @Prop({ default: 'pending' })
    deliveryStatus: string; // 'pending', 'sent', 'failed', 'delivered'

    @Prop({ type: Date, default: Date.now })
    sentAt: Date;
}

export const MailSchema = SchemaFactory.createForClass(Mail);

// Full text search indices
MailSchema.index({ subject: 'text', content: 'text', recipientEmail: 'text' });
