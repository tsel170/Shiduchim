import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  APPROVAL_STATUSES,
  PARTICIPANT_ROLES,
  PERSON_SLOTS,
} from '../domain/case-participant.types';

@Schema({ _id: false, versionKey: false })
export class CaseParticipant {
  @Prop({ required: true })
  accountId: string;

  @Prop({ type: String, default: null })
  profileId: string | null;

  @Prop({ type: String, required: true, enum: PARTICIPANT_ROLES })
  role: string;

  @Prop({ type: String, enum: PERSON_SLOTS, default: null })
  personSlot: string | null;

  @Prop({ type: String, required: true, enum: APPROVAL_STATUSES, default: 'Pending' })
  approvalStatus: string;

  @Prop({ type: Date, default: null })
  approvedAt: Date | null;

  @Prop({ type: String, default: null })
  approvedByAccountId: string | null;
}

export const CaseParticipantSchema = SchemaFactory.createForClass(CaseParticipant);
