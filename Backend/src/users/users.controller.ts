import { Controller, Post, Get, Put, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('User & Admin Auth')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'User Login' })
  @Post('login')
  async login(@Body() loginDto: any) {
    return this.usersService.login(loginDto);
  }

  @ApiOperation({ summary: 'User Registration' })
  @Post('register')
  async register(@Body() registerDto: any) {
    return this.usersService.register(registerDto);
  }

  @ApiOperation({ summary: 'Send Email Security OTP' })
  @Post('send-email-otp')
  async sendEmailOtp(@Body() body: { email: string }) {
    return this.usersService.sendEmailOtp(body.email);
  }

  @ApiOperation({ summary: 'Admin Login' })
  @Post('admin/login')
  async adminLogin(@Body() loginDto: any) {
    return this.usersService.adminLogin(loginDto);
  }

  @ApiOperation({ summary: 'Admin Registration' })
  @Post('admin/register')
  async adminRegister(@Body() registerDto: any) {
    return this.usersService.adminRegister(registerDto);
  }

  private extractUserId(headers: Record<string, string>): string {
    const authHeader = headers.authorization || headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header missing or invalid');
    }
    const token = authHeader.split(' ')[1];
    return this.usersService.verifyToken(token);
  }

  @ApiOperation({ summary: 'Get User / Admin Profile' })
  @Get('profile')
  async getProfile(@Headers() headers: Record<string, string>) {
    const userId = this.extractUserId(headers);
    return this.usersService.getProfile(userId);
  }

  @ApiOperation({ summary: 'Update User / Admin Profile' })
  @Put('profile')
  async updateProfile(@Headers() headers: Record<string, string>, @Body() updateDto: any) {
    const userId = this.extractUserId(headers);
    return this.usersService.updateProfile(userId, updateDto);
  }

  @ApiOperation({ summary: 'Send MSG91 SMS OTP' })
  @Post('send-otp')
  async sendOtp(@Body() body: { mobile: string }) {
    return this.usersService.sendMsg91Otp(body.mobile);
  }

  @ApiOperation({ summary: 'Verify MSG91 SMS OTP & Update Customer Profile' })
  @Post('verify-otp')
  async verifyOtp(@Headers() headers: Record<string, string>, @Body() body: any) {
    let userId: string | undefined;
    try {
      userId = this.extractUserId(headers);
    } catch (e) {
      // Optional header parsing
    }
    return this.usersService.verifyMsg91Otp(body, userId);
  }

  @ApiOperation({ summary: 'Resend MSG91 SMS OTP' })
  @Post('resend-otp')
  async resendOtp(@Body() body: { mobile: string }) {
    return this.usersService.resendMsg91Otp(body.mobile);
  }
}
