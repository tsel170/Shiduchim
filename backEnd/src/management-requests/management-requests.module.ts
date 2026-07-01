import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsModule } from '../accounts/accounts.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { ManagementRequestsController } from './management-requests.controller';
import { ManagementRequestsService } from './management-requests.service';
import {
  ManagementRequest,
  ManagementRequestSchema,
} from './schemas/management-request.schema';

@Module({
  imports: [
    AccountsModule,
    ProfilesModule,
    MongooseModule.forFeature([
      { name: ManagementRequest.name, schema: ManagementRequestSchema },
    ]),
  ],
  controllers: [ManagementRequestsController],
  providers: [ManagementRequestsService],
  exports: [ManagementRequestsService],
})
export class ManagementRequestsModule {}
