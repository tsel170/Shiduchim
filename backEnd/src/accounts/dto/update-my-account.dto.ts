import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMyAccountDto {
  @ApiPropertyOptional({ example: 'ישראל' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'נא להזין שם פרטי' })
  @MaxLength(100, { message: 'שם פרטי ארוך מדי' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'ישראלי' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'שם משפחה ארוך מדי' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'כתובת אימייל לא תקינה' })
  email?: string;

  @ApiPropertyOptional({ nullable: true, example: '0501234567' })
  @IsOptional()
  @IsString()
  @MaxLength(30, { message: 'מספר טלפון ארוך מדי' })
  phone?: string | null;
}

export class AddLinkedShadchanDto {
  @ApiProperty({ example: 'uuid-of-shadchan-account' })
  @IsString()
  @IsNotEmpty({ message: 'יש לבחור שדכן' })
  shadchanAccountId: string;
}
