import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class CaseApprovals {
  @Prop({ type: Date, default: null })
  senderProfileApprovedAt: Date | null;

  @Prop({ type: Date, default: null })
  receiverProfileApprovedAt: Date | null;

  @Prop({ type: Date, default: null })
  senderBackgroundCheckApprovedAt: Date | null;

  @Prop({ type: Date, default: null })
  receiverBackgroundCheckApprovedAt: Date | null;

  @Prop({ type: Date, default: null })
  senderMeetingApprovedAt: Date | null;

  @Prop({ type: Date, default: null })
  receiverMeetingApprovedAt: Date | null;

  @Prop({ type: Date, default: null })
  senderContinuedAfterMeetingAt: Date | null;

  @Prop({ type: Date, default: null })
  receiverContinuedAfterMeetingAt: Date | null;
}

export const CaseApprovalsSchema = SchemaFactory.createForClass(CaseApprovals);
