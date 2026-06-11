import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
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
import { InquiryPhoneDto } from './inquiry-phone.dto';

export class CreateProfileDto {
  @ApiProperty({ example: 'שרה' })
  @IsString()
  @MaxLength(255)
  firstName: string;

  @ApiProperty({ example: 'כהן' })
  @IsString()
  @MaxLength(255)
  lastName: string;

  @ApiProperty({ example: 'ירושלים', enum: CITIES })
  @IsString()
  @IsIn(CITIES)
  residence: string;

  @ApiProperty({ example: 165, description: 'Height in centimeters' })
  @IsInt()
  @Min(100)
  @Max(250)
  heightCm: number;

  @ApiProperty({ example: 'ליטאי', enum: STREAMS })
  @IsString()
  @IsIn(STREAMS)
  stream: string;

  @ApiProperty({
    example: 'רווקה',
    description: 'Text field for flexibility (e.g. רווקה, גרושה, אלמנה)',
  })
  @IsString()
  @MaxLength(100)
  maritalStatus: string;

  @ApiProperty({ example: 22 })
  @IsInt()
  @Min(16)
  @Max(120)
  age: number;

  @ApiProperty({
    type: [String],
    example: ['חמה', 'שמחה'],
    enum: PERSONALITY_TRAITS,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsIn(PERSONALITY_TRAITS, { each: true })
  personalityTraits: string[];

  @ApiProperty({
    type: [String],
    example: ['קריאה', 'בישול'],
    enum: HOBBIES,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsIn(HOBBIES, { each: true })
  hobbies: string[];

  @ApiProperty({ example: 'בית חם ותורני עם אווירה משפחתית' })
  @IsString()
  @MaxLength(4000)
  desiredHomeDescription: string;

  @ApiProperty({
    type: [String],
    example: ['לומד', 'רציני'],
    enum: LOOKING_FOR_TRAITS,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsIn(LOOKING_FOR_TRAITS, { each: true })
  lookingForInPartner: string[];

  @ApiProperty({ type: [InquiryPhoneDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InquiryPhoneDto)
  inquiryPhones: InquiryPhoneDto[];
}
