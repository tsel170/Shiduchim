import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MatchRequestDocument = HydratedDocument<MatchRequest>;

@Schema({ collection: 'matchRequests', timestamps: true, versionKey: false })
export class MatchRequest {
  @Prop({ required: true, unique: true, index: true })
  requestId: string;

  @Prop({ required: true, index: true })
  senderProfileId: string;

  @Prop({ required: true, index: true })
  targetProfileId: string;

  @Prop({ required: true, index: true })
  shadchanId: string;

  @Prop()
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const MatchRequestSchema = SchemaFactory.createForClass(MatchRequest);
