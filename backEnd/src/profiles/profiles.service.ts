import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateId } from '../common/utils/generate-id';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile, ProfileDocument } from './schemas/profile.schema';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
  ) {}

  async create(createProfileDto: CreateProfileDto) {
    const profile = await this.profileModel.create({
      profileId: generateId(),
      ...createProfileDto,
      ownerAccountId: createProfileDto.ownerAccountId ?? null,
      addedByShadchanId: createProfileDto.addedByShadchanId ?? null,
    });
    return this.toResponse(profile);
  }

  async findAll() {
    const profiles = await this.profileModel.find().sort({ createdAt: -1 });
    return profiles.map((profile) => this.toResponse(profile));
  }

  async findOne(profileId: string) {
    const profile = await this.profileModel.findOne({ profileId });
    if (!profile) {
      throw new NotFoundException(`Profile "${profileId}" not found`);
    }
    return this.toResponse(profile);
  }

  async update(profileId: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.profileModel.findOneAndUpdate(
      { profileId },
      { $set: updateProfileDto },
      { new: true, runValidators: true },
    );
    if (!profile) {
      throw new NotFoundException(`Profile "${profileId}" not found`);
    }
    return this.toResponse(profile);
  }

  async remove(profileId: string) {
    const result = await this.profileModel.deleteOne({ profileId });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Profile "${profileId}" not found`);
    }
  }

  private toResponse(profile: ProfileDocument) {
    return {
      profileId: profile.profileId,
      ownerAccountId: profile.ownerAccountId,
      addedByShadchanId: profile.addedByShadchanId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      city: profile.city,
      age: profile.age,
      heightCm: profile.heightCm,
      religiousStream: profile.religiousStream,
      maritalStatus: profile.maritalStatus,
      personalityTraits: profile.personalityTraits,
      hobbies: profile.hobbies,
      homeVision: profile.homeVision,
      lookingFor: profile.lookingFor,
      references: profile.references,
      photos: profile.photos,
      shadchanIds: profile.shadchanIds,
      aboutMe: profile.aboutMe,
      aboutMyFamily: profile.aboutMyFamily,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
