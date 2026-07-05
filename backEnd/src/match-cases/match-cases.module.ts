import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from '../accounts/accounts.module';
import { ProfilesModule } from '../profiles/profiles.module';
import {
  MatchCasesController,
} from './match-cases.controller';
import { MatchCasesService } from './match-cases.service';
import { CaseHistory, CaseHistorySchema } from './schemas/case-history.schema';
import { MatchCase, MatchCaseSchema } from './schemas/match-case.schema';

@Module({
  imports: [
    AccountsModule,
    ProfilesModule,
    MongooseModule.forFeature([
      { name: MatchCase.name, schema: MatchCaseSchema },
      { name: CaseHistory.name, schema: CaseHistorySchema },
    ]),
  ],
  controllers: [MatchCasesController],
  providers: [MatchCasesService],
  exports: [MatchCasesService],
})
export class MatchCasesModule {}
