import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  ProfileRating,
  ProfileRatingSchema,
} from '../../common/schemas/profile-rating.schema';

export type FavoriteDocument = HydratedDocument<Favorite>;

@Schema({ collection: 'favorites', versionKey: false })
export class Favorite {
  @Prop({ required: true, unique: true, index: true })
  favoriteId: string;

  @Prop({ required: true, index: true })
  ownerAccountId: string;

  @Prop({ required: true, index: true })
  profileId: string;

  @Prop({ type: ProfileRatingSchema, required: true })
  rating: ProfileRating;

  @Prop({ type: String, default: null })
  requestId: string | null;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

FavoriteSchema.index({ ownerAccountId: 1, profileId: 1 }, { unique: true });
