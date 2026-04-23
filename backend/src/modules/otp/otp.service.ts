import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from '../../database/entities';

// ── Pure helpers ──────────────────────────────────────────────────────────────

const generateOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

const getExpiryTime = (minutes: number): Date => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  return d;
};

const isExpired = (expiresAt: Date): boolean => new Date() > expiresAt;

const isMaxAttemptsExceeded = (attempts: number, max = 3): boolean =>
  attempts >= max;

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectRepository(Otp)
    private readonly otpRepo: Repository<Otp>,
  ) {}

  async sendOtp(
    countryCode: string,
    number: number,
  ): Promise<{ success: boolean; message: string }> {
    const mobileNumber = String(number);

    await this.otpRepo.update(
      { mobileNumber, verified: false },
      { verified: true },
    );

    const otp = generateOtp();
    const expiresAt = getExpiryTime(10);

    await this.otpRepo.save(
      this.otpRepo.create({
        mobileNumber,
        countryCode,
        otp,
        verified: false,
        attempts: 0,
        expiresAt,
      }),
    );

    // TODO: Integrate SMS gateway (MSG91 / Fast2SMS / Twilio)
    this.logger.log(`[SMS MOCK] OTP ${otp} → ${countryCode}${mobileNumber}`);

    return { success: true, message: 'OTP sent successfully' };
  }

  async verifyOtp(
    countryCode: string,
    number: number,
    otp: number,
  ): Promise<{ verified: boolean; message: string }> {
    const mobileNumber = String(number);
    const otpStr = String(otp);

    const record = await this.otpRepo.findOne({
      where: { mobileNumber, countryCode, verified: false },
      order: { createdAt: 'DESC' },
    });

    if (!record)
      throw new BadRequestException('No active OTP. Please request a new one.');

    if (isExpired(record.expiresAt))
      throw new BadRequestException('OTP expired. Please request a new one.');

    if (isMaxAttemptsExceeded(record.attempts))
      throw new BadRequestException('Too many attempts. Please request a new OTP.');

    if (record.otp !== otpStr) {
      await this.otpRepo.update(record.id, { attempts: record.attempts + 1 });
      throw new BadRequestException('Invalid OTP');
    }

    await this.otpRepo.update(record.id, { verified: true });
    return { verified: true, message: 'OTP verified successfully' };
  }

  async resendOtp(
    countryCode: string,
    number: number,
  ): Promise<{ success: boolean }> {
    await this.sendOtp(countryCode, number);
    return { success: true };
  }
}
