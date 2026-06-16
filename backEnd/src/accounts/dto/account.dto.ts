import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class FilterCriteriaDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  maritalStatuses?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  religiousStreams?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hobbies?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  personalityTraits?: string[];
}

export class FilterSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  minAge?: number;

  @ApiPropertyOptional()
  @IsOptional()
  maxAge?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cities?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  maxDistanceKm?: number;

  @ApiPropertyOptional({ type: FilterCriteriaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterCriteriaDto)
  mustHave?: FilterCriteriaDto;

  @ApiPropertyOptional({ type: FilterCriteriaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterCriteriaDto)
  mustNotHave?: FilterCriteriaDto;

  @ApiPropertyOptional()
  @IsOptional()
  minHeightCm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  maxHeightCm?: number;
}

export class DisplayPreferencesDto {
  @ApiProperty({ type: [String], example: ['firstName', 'hobbies'] })
  @IsArray()
  @IsString({ each: true })
  visibleFields: string[];

  @ApiProperty({ type: [String], example: ['city'] })
  @IsArray()
  @IsString({ each: true })
  hiddenFields: string[];

  @ApiProperty({ type: [String], example: ['firstName', 'heightCm'] })
  @IsArray()
  @IsString({ each: true })
  fieldOrder: string[];

  @ApiProperty({ type: [String], example: ['hobbies'] })
  @IsArray()
  @IsString({ each: true })
  rankableFields: string[];
}

export class AccountSettingsDto {
  @ApiPropertyOptional({ type: FilterSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterSettingsDto)
  filters?: FilterSettingsDto;

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
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ enum: ['person', 'shadchan'], example: 'person' })
  @IsIn(['person', 'shadchan'])
  role: 'person' | 'shadchan';

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  profileId?: string | null;

  @ApiPropertyOptional({ type: AccountSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AccountSettingsDto)
  settings?: AccountSettingsDto;
}

export class UpdateAccountDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;

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
  @ApiPropertyOptional({ type: FilterSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterSettingsDto)
  filters?: FilterSettingsDto;

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
  email: string;

  @ApiProperty({ enum: ['person', 'shadchan'] })
  role: 'person' | 'shadchan';

  @ApiProperty({ nullable: true })
  profileId: string | null;

  @ApiProperty({ type: AccountSettingsDto })
  settings: AccountSettingsDto;
}
