import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { DISPLAY_FIELDS } from '../../profiles/constants/profile-options';

export class RangeDto {
  @ApiProperty()
  @IsInt()
  min: number;

  @ApiProperty()
  @IsInt()
  max: number;
}

export class FilterConfigurationDto {
  @ApiProperty({ type: RangeDto })
  @ValidateNested()
  @Type(() => RangeDto)
  ageRange: RangeDto;

  @ApiProperty({ type: RangeDto })
  @ValidateNested()
  @Type(() => RangeDto)
  heightRange: RangeDto;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  cities: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  religiousStreams: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  genders: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  maritalStatuses: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  personalityTraits: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  hobbies: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  lookingFor: string[];
}

export class DisplayPreferencesDto {
  @ApiProperty({ type: Object, example: { city: true, hobbies: true } })
  visibleFields: Record<string, boolean>;

  @ApiProperty({ type: [String], enum: DISPLAY_FIELDS })
  @IsArray()
  @IsString({ each: true })
  fieldOrder: string[];
}

export class AccountSettingsDto {
  @ApiPropertyOptional({ type: FilterConfigurationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterConfigurationDto)
  filters?: FilterConfigurationDto;

  @ApiPropertyOptional({ type: DisplayPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DisplayPreferencesDto)
  displayPreferences?: DisplayPreferencesDto;
}

export class CreateAccountDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password: string;

  @ApiProperty({ enum: ['person', 'shadchan'], example: 'person' })
  @IsIn(['person', 'shadchan'])
  role: 'person' | 'shadchan';

  @ApiPropertyOptional({ example: 'ישראל' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'ישראלי' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  profileId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;

  @ApiPropertyOptional({ type: AccountSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AccountSettingsDto)
  settings?: AccountSettingsDto;
}

export class UpdateAccountDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;

  @ApiPropertyOptional({ enum: ['person', 'shadchan'] })
  @IsOptional()
  @IsIn(['person', 'shadchan'])
  role?: 'person' | 'shadchan';

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  profileId?: string | null;
}

export class UpdateAccountSettingsDto {
  @ApiPropertyOptional({ type: FilterConfigurationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterConfigurationDto)
  filters?: FilterConfigurationDto;

  @ApiPropertyOptional({ type: DisplayPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DisplayPreferencesDto)
  displayPreferences?: DisplayPreferencesDto;
}

export class AccountResponseDto {
  @ApiProperty()
  accountId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ['person', 'shadchan'] })
  role: 'person' | 'shadchan';

  @ApiProperty({ nullable: true })
  profileId: string | null;

  @ApiProperty({ nullable: true })
  phone: string | null;

  @ApiProperty({ type: AccountSettingsDto })
  settings: AccountSettingsDto;

  @ApiPropertyOptional({ type: [String], description: 'שדכנים מקושרים (משודך/ת בלבד)' })
  linkedShadchanIds?: string[];
}
