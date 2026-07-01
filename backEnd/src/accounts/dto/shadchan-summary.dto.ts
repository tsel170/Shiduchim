import { ApiProperty } from '@nestjs/swagger';

export class ShadchanSummaryDto {
  @ApiProperty()
  accountId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  phone: string | null;
}
