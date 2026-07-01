import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateId } from '../common/utils/generate-id';
import { CreateInterestDto, UpdateInterestDto } from './dto/interest.dto';
import { Interest, InterestDocument } from './schemas/interest.schema';

@Injectable()
export class InterestsService {
  constructor(
    @InjectModel(Interest.name)
    private readonly interestModel: Model<InterestDocument>,
  ) {}

  async create(createInterestDto: CreateInterestDto) {
    const existing = await this.interestModel.findOne({
      ownerAccountId: createInterestDto.ownerAccountId,
      profileId: createInterestDto.profileId,
    });
    if (existing) {
      throw new ConflictException('כבר קיים עניין בפרופיל זה');
    }

    const interest = await this.interestModel.create({
      interestId: generateId(),
      ownerAccountId: createInterestDto.ownerAccountId,
      profileId: createInterestDto.profileId,
      status: createInterestDto.status ?? 'notRequested',
      updatedAt: new Date(),
    });

    return this.toResponse(interest);
  }

  async findAll(ownerAccountId?: string) {
    const filter = ownerAccountId ? { ownerAccountId } : {};
    const interests = await this.interestModel
      .find(filter)
      .sort({ updatedAt: -1 });
    return interests.map((interest) => this.toResponse(interest));
  }

  async findOne(interestId: string) {
    const interest = await this.interestModel.findOne({ interestId });
    if (!interest) {
      throw new NotFoundException(`רשומת עניין "${interestId}" לא נמצאה`);
    }
    return this.toResponse(interest);
  }

  async update(interestId: string, updateInterestDto: UpdateInterestDto) {
    const interest = await this.interestModel.findOne({ interestId });
    if (!interest) {
      throw new NotFoundException(`רשומת עניין "${interestId}" לא נמצאה`);
    }

    if (updateInterestDto.status !== undefined) {
      interest.status = updateInterestDto.status;
      interest.updatedAt = new Date();
    }

    await interest.save();
    return this.toResponse(interest);
  }

  async remove(interestId: string) {
    const result = await this.interestModel.deleteOne({ interestId });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`רשומת עניין "${interestId}" לא נמצאה`);
    }
  }

  private toResponse(interest: InterestDocument) {
    return {
      interestId: interest.interestId,
      ownerAccountId: interest.ownerAccountId,
      profileId: interest.profileId,
      status: interest.status,
      updatedAt: interest.updatedAt,
    };
  }
}
