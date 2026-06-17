import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ProfileRating {
  @Prop({ required: true, min: 1, max: 5 })
  personality: number;

  @Prop({ min: 1, max: 5 })
  hobbies?: number;

  @Prop({ min: 1, max: 5 })
  familyVision?: number;

  @Prop({ min: 1, max: 5 })
  lookingFor?: number;

  @Prop({ min: 1, max: 5 })
  look?: number;

  @Prop({ min: 1, max: 5 })
  averageRating?: number;
}

export const ProfileRatingSchema =
  SchemaFactory.createForClass(ProfileRating);

export function computeAverageRating(
  rating: Pick<ProfileRating, 'personality' | 'hobbies' | 'familyVision' | 'lookingFor' | 'look'>,
): number {
  const values = [
    rating.personality,
    rating.hobbies,
    rating.familyVision,
    rating.lookingFor,
    rating.look,
  ].filter((value): value is number => typeof value === 'number');
  if (values.length === 0) return 0;
  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round((sum / values.length) * 10) / 10;
}
