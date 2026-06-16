import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
  ],
  controllers: [MatchRequestsController],
  providers: [MatchRequestsService],
  exports: [MatchRequestsService],
})
export class MatchRequestsModule {}
