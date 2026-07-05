import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from '../accounts/schemas/account.schema';
import { AccountsModule } from '../accounts/accounts.module';
import { Favorite, FavoriteSchema } from '../favorites/schemas/favorite.schema';
import {
  MatchRequest,
  MatchRequestSchema,
} from '../match-requests/schemas/match-request.schema';
import { MatchCase, MatchCaseSchema } from '../match-cases/schemas/match-case.schema';
import { CaseHistory, CaseHistorySchema } from '../match-cases/schemas/case-history.schema';
import { Profile, ProfileSchema } from '../profiles/schemas/profile.schema';
import { Suggestion, SuggestionSchema } from '../suggestions/schemas/suggestion.schema';
import { DemoSeedService } from './demo-seed.service';
import { LegacyMatchMigrationService } from './legacy-match-migration.service';

@Module({
  imports: [
    AccountsModule,
    MongooseModule.forFeature([
      { name: Profile.name, schema: ProfileSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Favorite.name, schema: FavoriteSchema },
      { name: Suggestion.name, schema: SuggestionSchema },
      { name: MatchRequest.name, schema: MatchRequestSchema },
      { name: MatchCase.name, schema: MatchCaseSchema },
      { name: CaseHistory.name, schema: CaseHistorySchema },
    ]),
  ],
  providers: [DemoSeedService, LegacyMatchMigrationService],
})
export class DemoModule {}
