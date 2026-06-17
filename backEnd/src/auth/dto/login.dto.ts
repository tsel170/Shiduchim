import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'Person' })
  @IsString()
  @MinLength(1)
  email: string;

  @ApiProperty({ example: 'Person' })
  @IsString()
  @MinLength(1)
  password: string;
}
