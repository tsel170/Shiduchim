import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SuggestionDocument = HydratedDocument<Suggestion>;

export const SUGGESTION_STAGES = ['new', 'in_check', 'checked'] as const;

export const SUGGESTION_CHECK_STATUSES = [
  'sending_profile',
  'dor_yesharim_checking',
  'phone_checking',
  'ready_to_meet',
  'denied',
] as const;

@Schema({ collection: 'suggestions', versionKey: false })
export class Suggestion {
  @Prop({ required: true, unique: true, index: true })
  suggestionId: string;

  @Prop({ required: true, index: true })
  ownerAccountId: string;

  @Prop({ required: true, index: true })
  profileId: string;

  @Prop({ required: true, index: true })
  shadchanId: string;

  @Prop({ required: true })
  shadchanNote: string;

  @Prop({ required: true, default: () => new Date() })
  sentAt: Date;

  @Prop({ type: String, required: true, enum: SUGGESTION_STAGES, default: 'new' })
  stage: string;

  @Prop({ type: String, enum: SUGGESTION_CHECK_STATUSES })
  checkStatus?: string;
}

export const SuggestionSchema = SchemaFactory.createForClass(Suggestion);

SuggestionSchema.index({ ownerAccountId: 1, profileId: 1 }, { unique: true });
