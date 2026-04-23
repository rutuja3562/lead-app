import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OtpService } from './otp.service';
import { SendOtpDto, VerifyOtpDto } from './otp.dto';

@ApiTags('OTP')
@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to mobile number' })
  async sendOtp(@Body() dto: SendOtpDto) {
    const result = await this.otpService.sendOtp(dto.countryCode, dto.number);
    return { success: result.success, message: result.message };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const result = await this.otpService.verifyOtp(
      dto.countryCode,
      dto.number,
      dto.otp,
    );
    return { success: true, data: result };
  }

  @Post('resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP' })
  async resendOtp(@Body() dto: SendOtpDto) {
    await this.otpService.resendOtp(dto.countryCode, dto.number);
    return { success: true, message: 'OTP resent successfully' };
  }
}
