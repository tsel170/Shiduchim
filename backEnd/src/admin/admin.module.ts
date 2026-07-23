import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from '../accounts/schemas/account.schema';
import { Favorite, FavoriteSchema } from '../favorites/schemas/favorite.schema';
import { MatchCase, MatchCaseSchema } from '../match-cases/schemas/match-case.schema';
import { Profile, ProfileSchema } from '../profiles/schemas/profile.schema';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Profile.name, schema: ProfileSchema },
      { name: Favorite.name, schema: FavoriteSchema },
      { name: MatchCase.name, schema: MatchCaseSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
