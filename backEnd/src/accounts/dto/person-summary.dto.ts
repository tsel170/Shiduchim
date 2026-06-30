import { ApiProperty } from '@nestjs/swagger';

export class PersonSummaryDto {
  @ApiProperty({ nullable: true })
  accountId: string | null;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  phone: string | null;

  @ApiProperty({ nullable: true })
  profileId: string | null;

  @ApiProperty()
  displayName: string;
}
