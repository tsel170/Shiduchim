import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  GENDERS,
  HOBBIES,
  LOOKING_FOR_TRAITS,
  MARITAL_STATUSES,
  MIN_PROFILE_AGE,
  PERSONALITY_TRAITS,
  RELIGIOUS_STREAMS,
} from '../constants/profile-options';
import { ReferenceContactDto } from './reference-contact.dto';

function emptyToUndefined({ value }: { value: unknown }) {
  if (value === '' || value === null) return undefined;
  return value;
}

function emptyNumberToUndefined({ value }: { value: unknown }) {
  if (value === '' || value === null || value === undefined) return undefined;
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return undefined;
  return num;
}

/** מינימום ליצירת פרופיל על ידי שדכן — רק שם פרטי, גיל, מין ומצב משפחתי חובה. */
export class CreateShadchanProfileDto {
  @ApiProperty({ example: 'שרה' })
  @IsString({ message: 'נא להזין שם פרטי' })
  @MaxLength(255, { message: 'שם פרטי: ארוך מדי' })
  firstName: string;

  @ApiProperty({ example: 22 })
  @IsInt({ message: 'נא להזין גיל' })
  @Min(MIN_PROFILE_AGE, { message: `גיל מינימלי הוא ${MIN_PROFILE_AGE}` })
  @Max(120, { message: 'גיל: ערך לא תקין' })
  age: number;

  @ApiProperty({ example: 'female', enum: GENDERS })
  @IsIn(GENDERS, { message: 'נא לבחור מין' })
  gender: (typeof GENDERS)[number];

  @ApiProperty({ example: 'single', enum: MARITAL_STATUSES })
  @IsIn(MARITAL_STATUSES, { message: 'נא לבחור מצב משפחתי' })
  maritalStatus: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  addedByShadchanId?: string | null;

  @ApiPropertyOptional({ example: 'כהן' })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString({ message: 'שם משפחה: ערך לא תקין' })
  @MaxLength(255, { message: 'שם משפחה: ארוך מדי' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'jerusalem' })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString({ message: 'עיר: ערך לא תקין' })
  @MaxLength(120, { message: 'עיר: ארוך מדי' })
  city?: string;

  @ApiPropertyOptional({ example: 165 })
  @IsOptional()
  @Transform(emptyNumberToUndefined)
  @ValidateIf((_, value) => value !== undefined)
  @IsInt({ message: 'גובה: חייב להיות מספר שלם' })
  @Min(100, { message: 'גובה חייב להיות לפחות 100 ס"מ' })
  @Max(250, { message: 'גובה: ערך לא תקין' })
  heightCm?: number;

  @ApiPropertyOptional({ example: 'haredi', enum: RELIGIOUS_STREAMS })
  @IsOptional()
  @Transform(emptyToUndefined)
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(RELIGIOUS_STREAMS, { message: 'זרם דתי: ערך לא תקין' })
  religiousStream?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(PERSONALITY_TRAITS, { each: true })
  personalityTraits?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(HOBBIES, { each: true })
  hobbies?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(4000, { message: 'חזון בית ומשפחה: ארוך מדי' })
  familyVision?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(LOOKING_FOR_TRAITS, { each: true })
  lookingFor?: string[];

  @ApiPropertyOptional({ type: [ReferenceContactDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => ReferenceContactDto)
  references?: ReferenceContactDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}
