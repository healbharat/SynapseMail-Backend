import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
    timestamps: true,
    toJSON: {
        transform: (doc: any, ret: any) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    }
})
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    name: string;

    @Prop({ default: 'employee' })
    role: string; // 'super_admin', 'admin', 'employee'

    @Prop({ default: 'active' })
    status: string; // 'active', 'inactive', 'suspended'

    @Prop({ default: 524288000 }) // 500MB default limit in bytes
    storageLimit: number;

    @Prop({ default: 0 })
    storageUsed: number;

    @Prop()
    avatar?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
