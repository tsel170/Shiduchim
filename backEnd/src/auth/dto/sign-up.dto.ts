import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @ApiProperty({ enum: ['person', 'shadchan'], example: 'person' })
  @IsString()
  @IsIn(['person', 'shadchan'])
  role: 'person' | 'shadchan';

  @ApiProperty({ example: 'ישראל' })
  @IsString()
  @IsNotEmpty({ message: 'נא להזין שם פרטי' })
  @MaxLength(100, { message: 'שם פרטי ארוך מדי' })
  firstName: string;

  @ApiPropertyOptional({ example: 'ישראלי' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'שם משפחה ארוך מדי' })
  lastName?: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: '050-1234567' })
  @IsString()
  @IsNotEmpty({ message: 'נא להזין מספר טלפון' })
  @MaxLength(30, { message: 'מספר טלפון ארוך מדי' })
  phone: string;
}
