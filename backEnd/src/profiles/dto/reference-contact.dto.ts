import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class ReferenceContactDto {
  @ApiProperty()
  @IsString()
  @MaxLength(64)
  id: string;

  @ApiProperty({ example: 'אמא' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: '+972' })
  @IsString()
  @MaxLength(10)
  countryCode: string;

  @ApiProperty({ example: '501234567' })
  @IsString()
  @MaxLength(20)
  phoneNumber: string;
}
