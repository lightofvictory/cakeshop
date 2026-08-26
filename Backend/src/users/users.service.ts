import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  private createToken(id: string): string {
    const secret = process.env.JWT_SECRET_KEY || 'random#secrectkey';
    return jwt.sign({ id }, secret);
  }

  async login(loginDto: any) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.createToken(user._id.toString());
    return { success: true, token, user: { name: user.name, email: user.email } };
  }

  async register(registerDto: any) {
    const { name, email, password } = registerDto;

    const exists = await this.userModel.findOne({ email });
    if (exists) {
      throw new BadRequestException('User already exists');
    }

    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      cartData: {},
    });

    const user = await newUser.save();
    const token = this.createToken(user._id.toString());
    return { success: true, token, user: { name: user.name, email: user.email } };
  }
}
