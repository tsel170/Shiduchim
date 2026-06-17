import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class AgeHeightRange {
  @Prop({ required: true })
  min: number;

  @Prop({ required: true })
  max: number;
}

export const AgeHeightRangeSchema = SchemaFactory.createForClass(AgeHeightRange);

@Schema({ _id: false })
export class FilterConfiguration {
  @Prop({ type: AgeHeightRangeSchema, required: true })
  ageRange: AgeHeightRange;

  @Prop({ type: AgeHeightRangeSchema, required: true })
  heightRange: AgeHeightRange;

  @Prop({ type: [String], default: [] })
  cities: string[];

  @Prop({ type: [String], default: [] })
  religiousStreams: string[];

  @Prop({ type: [String], default: [] })
  genders: string[];

  @Prop({ type: [String], default: [] })
  maritalStatuses: string[];

  @Prop({ type: [String], default: [] })
  personalityTraits: string[];

  @Prop({ type: [String], default: [] })
  hobbies: string[];

  @Prop({ type: [String], default: [] })
  lookingFor: string[];
}

export const FilterConfigurationSchema =
  SchemaFactory.createForClass(FilterConfiguration);

export const DEFAULT_FILTER_CONFIGURATION: FilterConfiguration = {
  ageRange: { min: 18, max: 50 },
  heightRange: { min: 140, max: 210 },
  cities: [],
  religiousStreams: [],
  genders: [],
  maritalStatuses: [],
  personalityTraits: [],
  hobbies: [],
  lookingFor: [],
};
