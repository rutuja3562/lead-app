import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsEmail,
  Matches,
  MinLength,
  MaxLength,
  ArrayMinSize,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomerType, LeadStatus, Gender } from '../../database/entities';

export class CreateQuickLeadDto {
  @ApiProperty() @IsString() @IsNotEmpty() mobileNumber: string;
  @ApiProperty() @IsString() @IsNotEmpty() countryCode: string;
  @ApiProperty({ enum: CustomerType }) @IsEnum(CustomerType) customerType: CustomerType;
  @ApiProperty() @IsString() @IsNotEmpty() @MinLength(2) firstName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() middleName?: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MinLength(2) lastName: string;
  @ApiProperty({ enum: Gender }) @IsEnum(Gender) gender: Gender;
  @ApiProperty() @IsString() @IsNotEmpty() addressLine1: string;
  @ApiPropertyOptional() @IsOptional() @IsString() addressLine2?: string;
  @ApiProperty() @IsString() @IsNotEmpty() city: string;
  @ApiProperty() @IsString() @IsNotEmpty() state: string;
  @ApiProperty() @Matches(/^[1-9][0-9]{5}$/, { message: 'Invalid pincode' }) pincode: string;
  @ApiProperty() @IsString() @IsNotEmpty() loanType: string;
  @ApiProperty() @IsString() @IsNotEmpty() schemeType: string;
  @ApiProperty() @IsNumber() loanAmount: number;
  @ApiProperty() @IsString() @IsNotEmpty() propertyType: string;
  @ApiProperty() @IsString() @IsNotEmpty() propertyLocation: string;
  @ApiPropertyOptional() @IsOptional() @IsString() businessType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() businessGSTIN?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() businessName?: string;
  @ApiProperty() @IsString() @IsNotEmpty() leadSource: string;
  @ApiProperty({ enum: LeadStatus }) @IsEnum(LeadStatus) leadStatus: LeadStatus;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isDraft?: boolean;
}

export class SaveBasicInfoDto {
  @ApiProperty() @IsString() @IsNotEmpty() salutation: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MinLength(2) firstName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() middleName?: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MinLength(2) lastName: string;
  @ApiProperty() @IsString() @IsNotEmpty() dob: string;
  @ApiProperty({ enum: Gender }) @IsEnum(Gender) gender: Gender;
  @ApiProperty() @IsString() @IsNotEmpty() maritalStatus: string;
  @ApiProperty() @IsString() @IsNotEmpty() fatherName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() motherName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() spouseName?: string;
  @ApiProperty() @IsString() @IsNotEmpty() nationality: string;
  @ApiPropertyOptional() @IsOptional() @IsString() religion?: string;
  @ApiProperty() @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Invalid PAN' }) panNumber: string;
  @ApiProperty() @Matches(/^\d{12}$/, { message: 'Aadhar must be 12 digits' }) aadharNumber: string;
  @ApiProperty() @IsEmail({}, { message: 'Invalid email' }) email: string;
  @ApiPropertyOptional() @IsOptional() @Matches(/^[6-9]\d{9}$/) alternateMobile?: string;
}

export class SavePropertyInfoDto {
  @ApiProperty() @IsString() @IsNotEmpty() propertyType: string;
  @ApiProperty() @IsString() @IsNotEmpty() propertyLocation: string;
  @ApiProperty() @IsNumber() propertyArea: number;
  @ApiProperty() @IsString() @IsNotEmpty() areaUnit: string;
  @ApiPropertyOptional() @IsOptional() @IsString() propertyAge?: string;
  @ApiProperty() @IsNumber() marketValue: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() distressValue?: number;
  @ApiProperty() @IsString() @IsNotEmpty() ownerName: string;
  @ApiProperty() @Matches(/^[6-9]\d{9}$/, { message: 'Invalid contact' }) ownerContact: string;
  @ApiPropertyOptional() @IsOptional() @IsString() propertyDescription?: string;
}

export class SaveIncomeInfoDto {
  @ApiProperty() @IsString() @IsNotEmpty() employmentType: string;
  @ApiProperty() @IsString() @IsNotEmpty() companyName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() designation?: string;
  @ApiProperty() @IsNumber() monthlyIncome: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() otherIncome?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() totalExperience?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() currentJobExperience?: string;
  @ApiProperty() @IsString() @IsNotEmpty() bankName: string;
  @ApiProperty() @IsString() @MinLength(9) @MaxLength(18) accountNumber: string;
  @ApiProperty() @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Invalid IFSC' }) ifscCode: string;
}

export class ReferenceDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty() @IsString() @IsNotEmpty() relation: string;
  @ApiProperty() @Matches(/^[6-9]\d{9}$/, { message: 'Invalid mobile' }) mobileNumber: string;
  @ApiProperty() @IsString() @IsNotEmpty() address: string;
}

export class SaveReferencesDto {
  @ApiProperty({ type: [ReferenceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(2, { message: 'Minimum 2 references required' })
  @Type(() => ReferenceDto)
  references: ReferenceDto[];
}
