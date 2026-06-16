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
  firstName: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  lastName: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  city: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  age: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  heightCm: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  religiousStream: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  maritalStatus: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  personalityTraits: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  hobbies: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  homeVision: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  lookingFor: number;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  photos: number;
}

export class CreateFavoriteDto {
  @ApiProperty()
  @IsString()
  ownerAccountId: string;

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
  ownerAccountId: string;

  @ApiProperty()
  profileId: string;

  @ApiProperty({ type: ProfileRatingDto })
  rating: ProfileRatingDto & { averageRating: number };

  @ApiProperty({ nullable: true })
  requestId: string | null;
}
