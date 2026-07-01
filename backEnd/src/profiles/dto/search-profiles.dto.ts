import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class RangeDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  min: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
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

export class SearchProfilesDto {
  @ApiProperty({ type: FilterConfigurationDto })
  @ValidateNested()
  @Type(() => FilterConfigurationDto)
  filters: FilterConfigurationDto;
}
