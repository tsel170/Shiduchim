import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString({ message: 'נא להזין אימייל' })
  @MinLength(1, { message: 'נא להזין אימייל' })
  email: string;

  @ApiProperty({ example: '••••••••' })
  @IsString({ message: 'נא להזין סיסמה' })
  @MinLength(1, { message: 'נא להזין סיסמה' })
  password: string;
}
