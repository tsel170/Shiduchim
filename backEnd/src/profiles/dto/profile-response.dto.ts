import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReferenceContactDto } from './reference-contact.dto';

export class ProfileResponseDto {
  @ApiProperty()
  profileId: string;

  @ApiProperty({ nullable: true })
  ownerAccountId: string | null;

  @ApiProperty({ nullable: true })
  addedByShadchanId: string | null;

  @ApiProperty({ example: 'שרה' })
  firstName: string;

  @ApiPropertyOptional({ example: 'כהן' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'ירושלים' })
  city?: string;

  @ApiProperty({ example: 22 })
  age: number;

  @ApiPropertyOptional({ example: 165 })
  heightCm?: number;

  @ApiPropertyOptional({ example: 'ליטאי' })
  religiousStream?: string;

  @ApiProperty({ example: 'רווקה' })
  maritalStatus: string;

  @ApiPropertyOptional({ type: [String] })
  personalityTraits?: string[];

  @ApiPropertyOptional({ type: [String] })
  hobbies?: string[];

  @ApiPropertyOptional()
  homeVision?: string;

  @ApiPropertyOptional({ type: [String] })
  lookingFor?: string[];

  @ApiPropertyOptional({ type: [ReferenceContactDto] })
  references?: ReferenceContactDto[];

  @ApiPropertyOptional({ type: [String] })
  photos?: string[];

  @ApiPropertyOptional({ type: [String] })
  shadchanIds?: string[];

  @ApiPropertyOptional()
  aboutMe?: string;

  @ApiPropertyOptional()
  aboutMyFamily?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
