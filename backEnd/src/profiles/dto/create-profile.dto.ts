import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
  ValidateNested,
} from 'class-validator';
import {
  CITIES,
  HOBBIES,
  LOOKING_FOR_TRAITS,
  PERSONALITY_TRAITS,
  STREAMS,
} from '../constants/profile-options';
import { ReferenceContactDto } from './reference-contact.dto';

export class CreateProfileDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  ownerAccountId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  addedByShadchanId?: string | null;

  @ApiProperty({ example: 'שרה' })
  @IsString()
  @MaxLength(255)
  firstName: string;

  @ApiPropertyOptional({ example: 'כהן' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  lastName?: string;

  @ApiPropertyOptional({ example: 'ירושלים', enum: CITIES })
  @IsOptional()
  @IsString()
  @IsIn(CITIES)
  city?: string;

  @ApiProperty({ example: 22 })
  @IsInt()
  @Min(16)
  @Max(120)
  age: number;

  @ApiPropertyOptional({ example: 165 })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(250)
  heightCm?: number;

  @ApiPropertyOptional({ example: 'ליטאי', enum: STREAMS })
  @IsOptional()
  @IsString()
  @IsIn(STREAMS)
  religiousStream?: string;

  @ApiProperty({ example: 'רווקה' })
  @IsString()
  @MaxLength(100)
  maritalStatus: string;

  @ApiPropertyOptional({ type: [String], example: ['חמה', 'שמחה'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(PERSONALITY_TRAITS, { each: true })
  personalityTraits?: string[];

  @ApiPropertyOptional({ type: [String], example: ['קריאה', 'בישול'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(HOBBIES, { each: true })
  hobbies?: string[];

  @ApiPropertyOptional({ example: 'בית חם ותורני עם אווירה משפחתית' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  homeVision?: string;

  @ApiPropertyOptional({ type: [String], example: ['לומד', 'רציני'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(LOOKING_FOR_TRAITS, { each: true })
  lookingFor?: string[];

  @ApiPropertyOptional({ type: [ReferenceContactDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReferenceContactDto)
  references?: ReferenceContactDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  shadchanIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  aboutMe?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  aboutMyFamily?: string;
}
