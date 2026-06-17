import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class DisplayPreferences {
  @Prop({ type: Object, default: {} })
  visibleFields: Record<string, boolean>;

  @Prop({ type: [String], default: [] })
  fieldOrder: string[];
}

export const DisplayPreferencesSchema =
  SchemaFactory.createForClass(DisplayPreferences);

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  visibleFields: {
    city: true,
    height: true,
    gender: true,
    maritalStatus: true,
    religiousStream: true,
    personalityTraits: true,
    hobbies: true,
    familyVision: true,
    lookingFor: true,
  },
  fieldOrder: [
    'city',
    'height',
    'gender',
    'maritalStatus',
    'religiousStream',
    'personalityTraits',
    'hobbies',
    'familyVision',
    'lookingFor',
  ],
};
