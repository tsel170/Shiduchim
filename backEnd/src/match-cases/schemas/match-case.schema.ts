import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MATCH_PRIORITIES, MATCH_STATUSES } from '../constants/match-status';

export type MatchCaseDocument = HydratedDocument<MatchCase>;

@Schema({ collection: 'matchCases', timestamps: true, versionKey: false })
export class MatchCase {
  @Prop({ required: true, unique: true, index: true })
  caseId: string;

  @Prop({ required: true, index: true })
  senderProfileId: string;

  @Prop({ required: true, index: true })
  targetProfileId: string;

  @Prop({ required: true, index: true })
  senderAccountId: string;

  @Prop({ type: String, default: null, index: true })
  targetAccountId: string | null;

  @Prop({ required: true, index: true })
  assignedShadchanId: string;

  @Prop({ type: String, required: true, enum: MATCH_STATUSES, default: 'pending' })
  currentStatus: string;

  @Prop({ type: String, enum: MATCH_PRIORITIES, default: 'normal' })
  priority: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String, default: '' })
  internalNotes: string;

  @Prop({ type: Date, default: null })
  closedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const MatchCaseSchema = SchemaFactory.createForClass(MatchCase);

MatchCaseSchema.index(
  { senderAccountId: 1, targetProfileId: 1, assignedShadchanId: 1 },
  { unique: true },
);
