import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    async create(userData: Partial<User>): Promise<UserDocument> {
        if (!userData.password) {
            throw new Error('Password is required for user creation');
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new this.userModel({
            ...userData,
            password: hashedPassword,
        });
        return user.save();
    }

    async countAll(): Promise<number> {
        return this.userModel.countDocuments().exec();
    }

    async findAll(): Promise<UserDocument[]> {
        return this.userModel.find({}, { password: 0 }).exec();
    }

    async updateStorage(userId: string, size: number): Promise<void> {
        await this.userModel.findByIdAndUpdate(userId, { $inc: { storageUsed: size } });
    }
}
