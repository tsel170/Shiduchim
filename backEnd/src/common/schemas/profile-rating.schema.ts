import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ProfileRating {
  @Prop({ required: true, min: 1, max: 5 })
  firstName: number;

  @Prop({ required: true, min: 1, max: 5 })
  lastName: number;

  @Prop({ required: true, min: 1, max: 5 })
  city: number;

  @Prop({ required: true, min: 1, max: 5 })
  age: number;

  @Prop({ required: true, min: 1, max: 5 })
  heightCm: number;

  @Prop({ required: true, min: 1, max: 5 })
  religiousStream: number;

  @Prop({ required: true, min: 1, max: 5 })
  maritalStatus: number;

  @Prop({ required: true, min: 1, max: 5 })
  personalityTraits: number;

  @Prop({ required: true, min: 1, max: 5 })
  hobbies: number;

  @Prop({ required: true, min: 1, max: 5 })
  homeVision: number;

  @Prop({ required: true, min: 1, max: 5 })
  lookingFor: number;

  @Prop({ required: true, min: 1, max: 5 })
  photos: number;

  @Prop({ required: true, min: 1, max: 5 })
  averageRating: number;
}

export const ProfileRatingSchema =
  SchemaFactory.createForClass(ProfileRating);

export function computeAverageRating(
  rating: Omit<ProfileRating, 'averageRating'>,
): number {
  const values = [
    rating.firstName,
    rating.lastName,
    rating.city,
    rating.age,
    rating.heightCm,
    rating.religiousStream,
    rating.maritalStatus,
    rating.personalityTraits,
    rating.hobbies,
    rating.homeVision,
    rating.lookingFor,
    rating.photos,
  ];
  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round((sum / values.length) * 100) / 100;
}
