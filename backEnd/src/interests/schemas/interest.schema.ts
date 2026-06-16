import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { InterestStatus } from '../../common/types/data-model.types';

export type InterestDocument = HydratedDocument<Interest>;

export const INTEREST_STATUSES = [
  'Dating',
  'notRequested',
  'requested',
  'underReview',
  'DoryesharimReview',
  'phoneReview',
  'presented',
  'accepted',
  'declined',
] as const satisfies readonly InterestStatus[];

@Schema({ collection: 'interests', versionKey: false })
export class Interest {
  @Prop({ required: true, unique: true, index: true })
  interestId: string;

  @Prop({ required: true, index: true })
  ownerAccountId: string;

  @Prop({ required: true, index: true })
  profileId: string;

  @Prop({ required: true, enum: INTEREST_STATUSES, default: 'notRequested' })
  status: (typeof INTEREST_STATUSES)[number];

  @Prop({ required: true, default: () => new Date() })
  updatedAt: Date;
}

export const InterestSchema = SchemaFactory.createForClass(Interest);

InterestSchema.index({ ownerAccountId: 1, profileId: 1 }, { unique: true });
