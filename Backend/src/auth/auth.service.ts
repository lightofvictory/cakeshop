import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Otp, OtpDocument } from './schemas/otp.schema';

// In-memory rate limiting map for OTP cooldown (60 seconds per phone number)
const otpRateLimitMap = new Map<string, number>();

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
  ) {}

  private createTokens(id: string) {
    const secret = process.env.JWT_SECRET_KEY || 'random#secrectkey';
    const accessToken = jwt.sign({ id }, secret, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ id, type: 'refresh' }, secret, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: UserDocument) {
    return {
      id: user._id.toString(),
      name: user.name,
      phone: user.phone || '',
      email: user.email || '',
      phone_verified: Boolean(user.phone_verified || user.phoneVerified),
      status: 'ACTIVE',
      role: user.role || 'user',
      preferredFulfillment: user.preferredFulfillment || 'delivery',
      orderUpdateChannel: user.orderUpdateChannel || 'WHATSAPP_SMS',
      receiptChannel: user.receiptChannel || 'GMAIL_EMAIL',
      receiveReceiptType: user.receiptChannel || user.receiveReceiptType || 'GMAIL_EMAIL',
      isPreferenceConfigured: Boolean(user.isPreferenceConfigured),
    };
  }

  // Format Indian Mobile to 91XXXXXXXXXX
  private formatMsg91Mobile(mobile: string): string {
    let clean = (mobile || '').replace(/[^0-9]/g, '');
    if (clean.length === 10) {
      clean = '91' + clean;
    }
    return clean;
  }

  // Mobile Number Validator (Supports 10-digit Indian Mobile & International E.164)
  private validateMobile(mobile: string): string {
    const cleanDigits = (mobile || '').replace(/[^0-9]/g, '');
    if (cleanDigits.length < 10) {
      throw new BadRequestException('Please enter a valid 10-digit mobile number');
    }
    return cleanDigits.slice(-10);
  }

  // Check 60-Second Cooldown Rate Limiter
  private checkRateLimit(identifier: string) {
    const lastSent = otpRateLimitMap.get(identifier);
    const now = Date.now();
    if (lastSent && now - lastSent < 60000) {
      const waitSeconds = Math.ceil((60000 - (now - lastSent)) / 1000);
      throw new BadRequestException(`Please wait ${waitSeconds} seconds before requesting a new OTP.`);
    }
    otpRateLimitMap.set(identifier, now);
  }

  // 1. Unified Send OTP Endpoint (Supports MSG91 SMS & DB Fallback)
  async sendOtp(dto: { phone?: string; mobile?: string; email?: string; name?: string }) {
    try {
      const rawContact = (dto.phone || dto.mobile || dto.email || '').trim();
      if (!rawContact) {
        throw new BadRequestException('Mobile number or Email address is required');
      }

    const isEmail = rawContact.includes('@');
    let cleanPhone = '';
    let msg91Mobile = '';

    if (!isEmail) {
      cleanPhone = this.validateMobile(rawContact);
      msg91Mobile = this.formatMsg91Mobile(cleanPhone);
      
      const bypassMobile = (process.env.TEST_BYPASS_MOBILE || '9087654321').replace(/[^0-9]/g, '');
      if (!cleanPhone.endsWith(bypassMobile.slice(-10))) {
        this.checkRateLimit(cleanPhone);
      }
    } else {
      this.checkRateLimit(rawContact);
    }

    const rawAuthKey = process.env.MSG91_AUTH_KEY || '';
    const authKey = rawAuthKey.replace(/['"]/g, '').trim();
    const templateId = (process.env.MSG91_OTP_TEMPLATE_ID || '').replace(/['"]/g, '').trim();

    // If MSG91 Authkey is configured and contact is a mobile number, send via MSG91 REST API
    if (authKey && !isEmail) {
      try {
        const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${msg91Mobile}&authkey=${authKey}`;

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            authkey: authKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        const data = await res.json();
        console.log(`📲 [MSG91 SMS GATEWAY RESPONSE] Mobile: +${msg91Mobile} | Data:`, data);
      } catch (err) {
        console.warn('[MSG91 Send OTP Warning]:', err?.message || err);
      }
    }

    // Always create fallback DB OTP Record
    const rawOtp = (Math.floor(100000 + Math.random() * 900000)).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(rawOtp, salt);

    const contactKey = isEmail ? rawContact : cleanPhone;

    // Delete any existing active OTP for this contact
    await this.otpModel.deleteMany({ phone: contactKey });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.otpModel.create({
      phone: contactKey,
      email: isEmail ? rawContact : (dto.email || ''),
      otp_hash: otpHash,
      purpose: 'AUTH',
      expires_at: expiresAt,
      attempts: 0,
      is_used: false,
    });

    console.log(`[AUTH OTP DISPATCH] Contact: ${contactKey} | Code: ${rawOtp}`);

    return {
      success: true,
      message: `Verification code sent successfully to ${isEmail ? rawContact : `+91 ${cleanPhone}`}`,
      expiresIn: 300,
    };
    } catch (error) {
      console.error('🔥 [ERROR IN sendOtp]:', error);
      throw error;
    }
  }

  async resendOtp(dto: { phone?: string; mobile?: string; email?: string; purpose?: string }) {
    return this.sendOtp(dto);
  }

  async sendRegisterOtp(dto: { name: string; phone: string; email?: string }) {
    return this.sendOtp(dto);
  }

  async sendLoginOtp(dto: { phone?: string; email?: string }) {
    return this.sendOtp(dto);
  }

  async verifyRegisterOtp(dto: { phone: string; otp: string; name?: string; email?: string; password?: string }) {
    return this.verifyOtp(dto);
  }

  async verifyLoginOtp(dto: { phone?: string; email?: string; otp: string }) {
    return this.verifyOtp(dto);
  }

  async logout() {
    return { success: true, message: 'Logged out successfully' };
  }

  // 2. Unified Verify OTP Endpoint (Supports Dedicated Test OTP Bypass Mobile & Code)
  async verifyOtp(dto: { phone?: string; mobile?: string; email?: string; otp: string; name?: string; password?: string }) {
    const rawContact = (dto.phone || dto.mobile || dto.email || '').trim();
    const cleanOtp = (dto.otp || '').trim();

    if (!rawContact || !cleanOtp) {
      throw new BadRequestException('Mobile/Email contact and OTP verification code are required');
    }

    const isEmail = rawContact.includes('@');
    let cleanPhone = isEmail ? '' : this.validateMobile(rawContact);
    let msg91Mobile = isEmail ? '' : this.formatMsg91Mobile(cleanPhone);

    let isVerified = false;

    // Dedicated Test Mobile & Universal 6-Digit Test OTP Bypass Check
    const bypassMobile = (process.env.TEST_BYPASS_MOBILE || '9087654321').replace(/[^0-9]/g, '');
    const bypassOtp = (process.env.TEST_BYPASS_OTP || '908765').trim();
    const testBypassCodes = [bypassOtp, '908765', '123456', '111111', '654321', '000000', '908700', '9087'];

    if (testBypassCodes.includes(cleanOtp) || (!isEmail && cleanPhone.endsWith(bypassMobile.slice(-10)))) {
      if (testBypassCodes.includes(cleanOtp) || cleanPhone.endsWith(bypassMobile.slice(-10))) {
        console.log(`✅ [TEST OTP BYPASS MATCHED] Contact: ${rawContact} | Code: ${cleanOtp}`);
        isVerified = true;
      }
    }

    // Check MSG91 verification first if configured
    const rawAuthKey = process.env.MSG91_AUTH_KEY || '';
    const authKey = rawAuthKey.replace(/['"]/g, '').trim();

    if (!isVerified && authKey && !isEmail) {
      try {
        const url = `https://control.msg91.com/api/v5/otp/verify?otp=${cleanOtp}&mobile=${msg91Mobile}&authkey=${authKey}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: { authkey: authKey },
        });
        const data = await res.json();
        console.log(`[MSG91 OTP VERIFY] Mobile: +${msg91Mobile} | Status:`, data?.message || data?.type);

        if (data.type === 'success' || data.message === 'OTP verified success' || data.message === 'Mobile no. already verified') {
          isVerified = true;
        }
      } catch (err) {
        console.warn('[MSG91 Verify Warning]:', err?.message || err);
      }
    }

    // DB OTP verification fallback
    if (!isVerified) {
      const contactKey = isEmail ? rawContact : cleanPhone;
      const otpRecord = await this.otpModel
        .findOne({ phone: contactKey, is_used: false })
        .sort({ createdAt: -1 });

      if (!otpRecord) {
        throw new BadRequestException('Verification code has expired or does not exist. Please click Resend OTP.');
      }

      if (new Date() > otpRecord.expires_at) {
        otpRecord.is_used = true;
        await otpRecord.save();
        throw new BadRequestException('Verification code has expired. Please click Resend OTP.');
      }

      if (otpRecord.attempts >= 5) {
        otpRecord.is_used = true;
        await otpRecord.save();
        throw new BadRequestException('Too many incorrect attempts. Please request a new verification code.');
      }

      const isOtpValid = await bcrypt.compare(cleanOtp, otpRecord.otp_hash);
      if (!isOtpValid) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new BadRequestException('Invalid OTP code. Please check and try again.');
      }

      otpRecord.is_used = true;
      await otpRecord.save();
      isVerified = true;
    }

    if (!isVerified) {
      throw new BadRequestException('OTP verification failed.');
    }

    // Auto find or create customer account
    const formattedPhone = isEmail ? '' : `+91${cleanPhone}`;
    let user: UserDocument = null;

    if (!isEmail) {
      user = await this.userModel.findOne({
        $or: [{ phone: formattedPhone }, { phone: cleanPhone }, { phoneNumber: formattedPhone }, { phoneNumber: cleanPhone }],
      });
    } else {
      user = await this.userModel.findOne({ email: rawContact });
    }

    if (!user) {
      user = await this.userModel.create({
        name: dto.name || (isEmail ? rawContact.split('@')[0] : `Customer ${cleanPhone.slice(-4)}`),
        phone: formattedPhone || undefined,
        phoneNumber: formattedPhone || undefined,
        email: isEmail ? rawContact : (dto.email || undefined),
        phone_verified: true,
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
        role: 'user',
        status: 'ACTIVE',
      });
    } else {
      user.phone_verified = true;
      user.phoneVerified = true;
      user.phoneVerifiedAt = new Date();
      await user.save();
    }

    const { accessToken, refreshToken } = this.createTokens(user._id.toString());
    const sanitized = this.sanitizeUser(user);

    return {
      success: true,
      message: 'OTP verified successfully! Welcome back.',
      user: sanitized,
      token: accessToken,
      accessToken,
      refreshToken,
    };
  }

  async googleLogin(dto: { email: string; name?: string; avatar?: string; googleId?: string }) {
    const rawEmail = (dto.email || '').trim().toLowerCase();
    if (!rawEmail || !rawEmail.includes('@')) {
      throw new BadRequestException('Valid Google email address is required');
    }

    let user = await this.userModel.findOne({ email: rawEmail }).exec();

    if (!user) {
      user = await this.userModel.create({
        name: dto.name || rawEmail.split('@')[0],
        email: rawEmail,
        phone: '',
        phoneNumber: '',
        phone_verified: true,
        phoneVerified: true,
        role: 'user',
        status: 'ACTIVE',
      });
    } else {
      user.phone_verified = true;
      user.phoneVerified = true;
      if (dto.name && (!user.name || user.name.startsWith('Customer'))) user.name = dto.name;
      await user.save();
    }

    const { accessToken, refreshToken } = this.createTokens(user._id.toString());
    const sanitized = this.sanitizeUser(user);

    return {
      success: true,
      message: 'Google login successful!',
      user: sanitized,
      token: accessToken,
      accessToken,
      refreshToken,
    };
  }
}
