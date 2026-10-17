import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Mobile & Email OTP Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Send MSG91 Mobile / Email OTP (Primary Authentication Endpoint)' })
  @Post('send-otp')
  async sendOtp(@Body() body: { phone?: string; mobile?: string; email?: string; name?: string }) {
    return this.authService.sendOtp(body);
  }

  @ApiOperation({ summary: 'Verify OTP, Check User & Login or Register Account' })
  @Post('verify-otp')
  async verifyOtp(@Body() body: { phone?: string; mobile?: string; email?: string; otp: string; name?: string; password?: string }) {
    return this.authService.verifyOtp(body);
  }

  @ApiOperation({ summary: 'Resend OTP with 60-Second Cooldown Protection' })
  @Post('resend-otp')
  async resendOtp(@Body() body: { phone?: string; mobile?: string; email?: string; purpose?: string }) {
    return this.authService.resendOtp(body);
  }

  @ApiOperation({ summary: 'Send Registration OTP (Legacy Endpoint)' })
  @Post('register/send-otp')
  async sendRegisterOtp(@Body() body: { name: string; phone: string; email?: string }) {
    return this.authService.sendRegisterOtp(body);
  }

  @ApiOperation({ summary: 'Verify Registration OTP & Create User (Legacy Endpoint)' })
  @Post('register/verify-otp')
  async verifyRegisterOtp(@Body() body: { phone: string; otp: string; name?: string; email?: string; password?: string }) {
    return this.authService.verifyRegisterOtp(body);
  }

  @ApiOperation({ summary: 'Send Login OTP (Legacy Endpoint)' })
  @Post('login/send-otp')
  async sendLoginOtp(@Body() body: { phone?: string; email?: string }) {
    return this.authService.sendLoginOtp(body);
  }

  @ApiOperation({ summary: 'Verify Login OTP (Legacy Endpoint)' })
  @Post('login/verify-otp')
  async verifyLoginOtp(@Body() body: { phone?: string; email?: string; otp: string }) {
    return this.authService.verifyLoginOtp(body);
  }

  @ApiOperation({ summary: 'Logout User' })
  @Post('logout')
  async logout() {
    return this.authService.logout();
  }

  @ApiOperation({ summary: 'Google Account Authentication' })
  @Post('google')
  async googleLogin(@Body() body: { email: string; name?: string; avatar?: string; googleId?: string }) {
    return this.authService.googleLogin(body);
  }
}
