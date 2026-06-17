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
  @IsInt()
  @Min(1)
  @Max(5)
  personality: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  hobbies?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  familyVision?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  lookingFor?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  look?: number;
}

export class CreateFavoriteDto {
  @ApiProperty()
  @IsString()
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
