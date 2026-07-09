import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  MATCH_PRIORITIES,
  SHIDDUCH_STATUSES,
} from '../constants/shidduch-workflow';
import {
  CASE_STAGES,
  PROFILE_DECISIONS,
} from '../domain/simplified-case-workflow';
import { DENIAL_REASONS } from '../domain/denial-reason';

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

  @Prop({
    type: String,
    required: true,
    enum: SHIDDUCH_STATUSES,
    default: 'sent_to_shadchan',
  })
  currentStatus: string;

  @Prop({
    type: String,
    required: true,
    enum: CASE_STAGES,
    default: 'profile_check',
  })
  stage: string;

  @Prop({
    type: String,
    required: true,
    enum: PROFILE_DECISIONS,
    default: 'waiting',
  })
  profileAStatus: string;

  @Prop({
    type: String,
    required: true,
    enum: PROFILE_DECISIONS,
    default: 'waiting',
  })
  profileBStatus: string;

  @Prop({ type: Boolean, default: false })
  personBReleased: boolean;

  @Prop({ type: String, enum: ['person', 'shadchan'], default: null })
  initiatedBy: string | null;

  @Prop({ type: String, enum: DENIAL_REASONS, default: null })
  denialReason: string | null;

  @Prop({ type: String, default: null })
  denialNote: string | null;

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
