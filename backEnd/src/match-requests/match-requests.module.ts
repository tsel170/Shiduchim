import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from '../accounts/accounts.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { MatchRequestsController } from './match-requests.controller';
import { MatchRequestsService } from './match-requests.service';
import {
  MatchRequest,
  MatchRequestSchema,
} from './schemas/match-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MatchRequest.name, schema: MatchRequestSchema },
    ]),
    ProfilesModule,
    AccountsModule,
  ],
  controllers: [MatchRequestsController],
  providers: [MatchRequestsService],
  exports: [MatchRequestsService],
})
export class MatchRequestsModule {}
