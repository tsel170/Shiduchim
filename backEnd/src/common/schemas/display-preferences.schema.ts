import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class DisplayPreferences {
  @Prop({ type: [String], default: [] })
  visibleFields: string[];

  @Prop({ type: [String], default: [] })
  hiddenFields: string[];

  @Prop({ type: [String], default: [] })
  fieldOrder: string[];

  @Prop({ type: [String], default: [] })
  rankableFields: string[];
}

export const DisplayPreferencesSchema =
  SchemaFactory.createForClass(DisplayPreferences);
