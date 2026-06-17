import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReferenceContactDto } from './reference-contact.dto';

export class ProfileResponseDto {
  @ApiProperty({ description: 'Canonical profile id (same as profileId)' })
  id: string;

  @ApiProperty()
  profileId: string;

  @ApiProperty({ nullable: true })
  ownerAccountId: string | null;

  @ApiProperty({ nullable: true })
  addedByShadchanId: string | null;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  heightCm: number;

  @ApiProperty()
  religiousStream: string;

  @ApiProperty({ enum: ['male', 'female'] })
  gender: string;

  @ApiProperty()
  maritalStatus: string;

  @ApiProperty({ type: [String] })
  personalityTraits: string[];

  @ApiProperty({ type: [String] })
  hobbies: string[];

  @ApiProperty()
  familyVision: string;

  @ApiProperty({ type: [String] })
  lookingFor: string[];

  @ApiProperty({ type: [ReferenceContactDto] })
  references: ReferenceContactDto[];

  @ApiProperty({ type: [String] })
  photos: string[];

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
