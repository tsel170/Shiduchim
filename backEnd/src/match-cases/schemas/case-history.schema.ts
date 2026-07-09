import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  CASE_HISTORY_ACTIONS,
  SHIDDUCH_STATUSES,
} from '../constants/shidduch-workflow';
import { DENIAL_REASONS } from '../domain/denial-reason';
import { PERSON_SLOTS } from '../domain/case-participant.types';

/** Who performed the action — persons or shadchan. */
export const HISTORY_ACTOR_SLOTS = [...PERSON_SLOTS, 'Shadchan'] as const;

export type CaseHistoryDocument = HydratedDocument<CaseHistory>;

@Schema({ collection: 'caseHistory', versionKey: false })
export class CaseHistory {
  @Prop({ required: true, unique: true, index: true })
  historyId: string;

  @Prop({ required: true, index: true })
  caseId: string;

  @Prop({ type: String, required: true, enum: CASE_HISTORY_ACTIONS })
  action: string;

  @Prop({ type: String, enum: SHIDDUCH_STATUSES })
  previousStatus?: string;

  @Prop({ type: String, enum: SHIDDUCH_STATUSES })
  newStatus?: string;

  @Prop({ required: true, index: true })
  changedByAccountId: string;

  @Prop({ required: true, default: () => new Date() })
  timestamp: Date;

  @Prop({ type: String })
  note?: string;

  @Prop({ type: String, enum: HISTORY_ACTOR_SLOTS })
  actorSlot?: string;

  @Prop({ type: String, enum: PERSON_SLOTS })
  onBehalfOfSlot?: string;

  @Prop({ type: String, enum: DENIAL_REASONS })
  denialReason?: string;

  @Prop({ type: Object, default: null })
  metadata?: Record<string, unknown> | null;
}

export const CaseHistorySchema = SchemaFactory.createForClass(CaseHistory);

CaseHistorySchema.index({ caseId: 1, timestamp: -1 });
