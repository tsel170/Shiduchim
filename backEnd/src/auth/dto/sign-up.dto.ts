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
  @IsString({ message: 'נא לבחור תפקיד' })
  @IsIn(['person', 'shadchan'], { message: 'תפקיד לא תקין' })
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
  @IsEmail({}, { message: 'כתובת אימייל לא תקינה' })
  email: string;

  @ApiProperty({ example: 'securePassword123', minLength: 6 })
  @IsString({ message: 'נא להזין סיסמה' })
  @MinLength(6, { message: 'הסיסמה חייבת להכיל לפחות 6 תווים' })
  @MaxLength(128, { message: 'הסיסמה ארוכה מדי' })
  password: string;

  @ApiProperty({ example: '050-1234567' })
  @IsString()
  @IsNotEmpty({ message: 'נא להזין מספר טלפון' })
  @MaxLength(30, { message: 'מספר טלפון ארוך מדי' })
  phone: string;
}
