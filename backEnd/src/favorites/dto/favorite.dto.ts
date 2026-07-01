import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProfileRatingDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt({ message: 'דירוג אישיות: חייב להיות מספר שלם' })
  @Min(1, { message: 'דירוג אישיות: מינימום 1' })
  @Max(5, { message: 'דירוג אישיות: מקסימום 5' })
  personality: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt({ message: 'דירוג תחביבים: חייב להיות מספר שלם' })
  @Min(1, { message: 'דירוג תחביבים: מינימום 1' })
  @Max(5, { message: 'דירוג תחביבים: מקסימום 5' })
  hobbies?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt({ message: 'דירוג חזון: חייב להיות מספר שלם' })
  @Min(1, { message: 'דירוג חזון: מינימום 1' })
  @Max(5, { message: 'דירוג חזון: מקסימום 5' })
  familyVision?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt({ message: 'דירוג מחפש/ת: חייב להיות מספר שלם' })
  @Min(1, { message: 'דירוג מחפש/ת: מינימום 1' })
  @Max(5, { message: 'דירוג מחפש/ת: מקסימום 5' })
  lookingFor?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt({ message: 'דירוג מראה: חייב להיות מספר שלם' })
  @Min(1, { message: 'דירוג מראה: מינימום 1' })
  @Max(5, { message: 'דירוג מראה: מקסימום 5' })
  look?: number;
}

export class CreateFavoriteDto {
  @ApiProperty()
  @IsString({ message: 'נדרש מזהה פרופיל' })
  profileId: string;

  @ApiProperty({ type: ProfileRatingDto })
  @ValidateNested()
  @Type(() => ProfileRatingDto)
  rating: ProfileRatingDto;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  requestId?: string | null;
}

export class UpdateFavoriteDto {
  @ApiPropertyOptional({ type: ProfileRatingDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileRatingDto)
  rating?: ProfileRatingDto;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  requestId?: string | null;
}

export class FavoriteResponseDto {
  @ApiProperty()
  favoriteId: string;

  @ApiProperty()
  profileId: string;

  @ApiProperty({ type: ProfileRatingDto })
  rating: ProfileRatingDto & { averageRating: number };

  @ApiProperty({ nullable: true })
  requestId: string | null;

  @ApiProperty()
  createdAt: Date;
}
