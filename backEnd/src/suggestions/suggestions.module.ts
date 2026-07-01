import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from '../accounts/accounts.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { Suggestion, SuggestionSchema } from './schemas/suggestion.schema';
import { SuggestionsController } from './suggestions.controller';
import { SuggestionsService } from './suggestions.service';

@Module({
  imports: [
    AccountsModule,
    ProfilesModule,
    MongooseModule.forFeature([
      { name: Suggestion.name, schema: SuggestionSchema },
    ]),
  ],
  controllers: [SuggestionsController],
  providers: [SuggestionsService],
  exports: [SuggestionsService],
})
export class SuggestionsModule {}
