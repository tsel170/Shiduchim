import { ApiProperty } from '@nestjs/swagger';

export class InquiryPhoneResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'אמא' })
  contactName: string;

  @ApiProperty({ example: '050' })
  phonePrefix: string;

  @ApiProperty({ example: '1234567' })
  phoneNumber: string;
}

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'שרה' })
  firstName: string;

  @ApiProperty({ example: 'כהן' })
  lastName: string;

  @ApiProperty({ example: 'ירושלים' })
  residence: string;

  @ApiProperty({ example: 165 })
  heightCm: number;

  @ApiProperty({ example: 1.65, description: 'Height in meters' })
  heightMeters: number;

  @ApiProperty({ example: "5'5\"", description: 'Height in feet and inches' })
  heightImperial: string;

  @ApiProperty({ example: 'ליטאי' })
  stream: string;

  @ApiProperty({ example: 'רווקה' })
  maritalStatus: string;

  @ApiProperty({ example: 22 })
  age: number;

  @ApiProperty({ type: [String], example: ['חמה', 'שמחה'] })
  personalityTraits: string[];

  @ApiProperty({ type: [String], example: ['קריאה', 'בישול'] })
  hobbies: string[];

  @ApiProperty({ example: 'בית חם ותורני עם אווירה משפחתית' })
  desiredHomeDescription: string;

  @ApiProperty({ type: [String], example: ['לומד', 'רציני'] })
  lookingForInPartner: string[];

  @ApiProperty({ type: [InquiryPhoneResponseDto] })
  inquiryPhones: InquiryPhoneResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
