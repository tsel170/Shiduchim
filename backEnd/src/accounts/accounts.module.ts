import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Profile, ProfileSchema } from '../profiles/schemas/profile.schema';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { Account, AccountSchema } from './schemas/account.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Profile.name, schema: ProfileSchema },
    ]),
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
