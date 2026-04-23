import { IsString, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '+91' })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({ example: 9876543210 })
  @IsNumber()
  @Min(6000000000)
  @Max(9999999999)
  number: number;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+91' })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({ example: 9876543210 })
  @IsNumber()
  number: number;

  @ApiProperty({ example: 123456 })
  @IsNumber()
  @Min(100000)
  @Max(999999)
  otp: number;
}
