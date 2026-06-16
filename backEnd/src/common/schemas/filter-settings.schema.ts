import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class FilterCriteria {
  @Prop({ type: [String], default: undefined })
  maritalStatuses?: string[];

  @Prop({ type: [String], default: undefined })
  religiousStreams?: string[];

  @Prop({ type: [String], default: undefined })
  hobbies?: string[];

  @Prop({ type: [String], default: undefined })
  personalityTraits?: string[];
}

export const FilterCriteriaSchema =
  SchemaFactory.createForClass(FilterCriteria);

@Schema({ _id: false })
export class FilterSettings {
  @Prop()
  minAge?: number;

  @Prop()
  maxAge?: number;

  @Prop({ type: [String], default: undefined })
  cities?: string[];

  @Prop()
  maxDistanceKm?: number;

  @Prop({ type: FilterCriteriaSchema, default: undefined })
  mustHave?: FilterCriteria;

  @Prop({ type: FilterCriteriaSchema, default: undefined })
  mustNotHave?: FilterCriteria;

  @Prop()
  minHeightCm?: number;

  @Prop()
  maxHeightCm?: number;
}

export const FilterSettingsSchema =
  SchemaFactory.createForClass(FilterSettings);
