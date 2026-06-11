import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';

export class InquiryPhoneDto {
  @ApiProperty({ example: 'אמא' })
  @IsString()
  @MaxLength(255)
  contactName: string;

  @ApiProperty({ example: '050', description: 'Phone prefix / area code' })
  @IsString()
  @Matches(/^\d{2,4}$/)
  phonePrefix: string;

  @ApiProperty({ example: '1234567' })
  @IsString()
  @Matches(/^\d{6,10}$/)
  phoneNumber: string;
}
