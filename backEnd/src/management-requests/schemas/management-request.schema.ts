import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ManagementRequestStatus = 'pending' | 'approved' | 'declined';

export type ManagementRequestDocument = HydratedDocument<ManagementRequest>;

@Schema({ collection: 'managementRequests', timestamps: true, versionKey: false })
export class ManagementRequest {
  @Prop({ required: true, unique: true, index: true })
  requestId: string;

  @Prop({ required: true, index: true })
  shadchanId: string;

  @Prop({ required: true, index: true })
  personAccountId: string;

  @Prop({ required: true, index: true })
  personProfileId: string;

  @Prop({ required: true, maxlength: 4000 })
  message: string;

  @Prop({
    required: true,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending',
    index: true,
  })
  status: ManagementRequestStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const ManagementRequestSchema = SchemaFactory.createForClass(ManagementRequest);

ManagementRequestSchema.index(
  { shadchanId: 1, personAccountId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
  },
);
