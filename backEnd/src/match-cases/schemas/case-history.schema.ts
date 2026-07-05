import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CASE_HISTORY_ACTIONS, MATCH_STATUSES } from '../constants/match-status';

export type CaseHistoryDocument = HydratedDocument<CaseHistory>;

@Schema({ collection: 'caseHistory', versionKey: false })
export class CaseHistory {
  @Prop({ required: true, unique: true, index: true })
  historyId: string;

  @Prop({ required: true, index: true })
  caseId: string;

  @Prop({ type: String, required: true, enum: CASE_HISTORY_ACTIONS })
  action: string;

  @Prop({ type: String, enum: MATCH_STATUSES })
  previousStatus?: string;

  @Prop({ type: String, enum: MATCH_STATUSES })
  newStatus?: string;

  @Prop({ required: true, index: true })
  changedByAccountId: string;

  @Prop({ required: true, default: () => new Date() })
  timestamp: Date;

  @Prop({ type: String })
  note?: string;
}

export const CaseHistorySchema = SchemaFactory.createForClass(CaseHistory);

CaseHistorySchema.index({ caseId: 1, timestamp: -1 });
