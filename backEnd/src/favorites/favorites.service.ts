import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { computeAverageRating } from '../common/schemas/profile-rating.schema';
import { generateId } from '../common/utils/generate-id';
import {
  CreateFavoriteDto,
  UpdateFavoriteDto,
} from './dto/favorite.dto';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<FavoriteDocument>,
  ) {}

  async create(ownerAccountId: string, createFavoriteDto: CreateFavoriteDto) {
    const existing = await this.favoriteModel.findOne({
      ownerAccountId,
      profileId: createFavoriteDto.profileId,
    });
    if (existing) {
      throw new ConflictException('הפרופיל כבר נמצא במועדפים');
    }

    const averageRating = computeAverageRating(createFavoriteDto.rating);
    const favorite = await this.favoriteModel.create({
      favoriteId: generateId(),
      ownerAccountId,
      profileId: createFavoriteDto.profileId,
      rating: { ...createFavoriteDto.rating, averageRating },
      requestId: createFavoriteDto.requestId ?? null,
    });

    return this.toResponse(favorite);
  }

  async findAll(ownerAccountId: string) {
    const favorites = await this.favoriteModel
      .find({ ownerAccountId })
      .sort({ createdAt: -1 });
    return favorites.map((favorite) => this.toResponse(favorite));
  }

  async findOne(favoriteId: string, ownerAccountId: string) {
    const favorite = await this.favoriteModel.findOne({ favoriteId, ownerAccountId });
    if (!favorite) {
      throw new NotFoundException(`רשומת מועדפים "${favoriteId}" לא נמצאה`);
    }
    return this.toResponse(favorite);
  }

  async update(
    favoriteId: string,
    ownerAccountId: string,
    updateFavoriteDto: UpdateFavoriteDto,
  ) {
    const favorite = await this.favoriteModel.findOne({ favoriteId, ownerAccountId });
    if (!favorite) {
      throw new NotFoundException(`רשומת מועדפים "${favoriteId}" לא נמצאה`);
    }

    if (updateFavoriteDto.rating !== undefined) {
      favorite.rating = {
        ...updateFavoriteDto.rating,
        averageRating: computeAverageRating(updateFavoriteDto.rating),
      };
    }

    if (updateFavoriteDto.requestId !== undefined) {
      favorite.requestId = updateFavoriteDto.requestId;
    }

    await favorite.save();
    return this.toResponse(favorite);
  }

  async remove(favoriteId: string, ownerAccountId: string) {
    const result = await this.favoriteModel.deleteOne({ favoriteId, ownerAccountId });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`רשומת מועדפים "${favoriteId}" לא נמצאה`);
    }
  }

  private toResponse(favorite: FavoriteDocument) {
    return {
      favoriteId: favorite.favoriteId,
      profileId: favorite.profileId,
      rating: favorite.rating,
      requestId: favorite.requestId,
      createdAt: favorite.createdAt,
    };
  }
}
