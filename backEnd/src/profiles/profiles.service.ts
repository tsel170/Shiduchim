import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileHobby } from './entities/profile-hobby.entity';
import { ProfileInquiryPhone } from './entities/profile-inquiry-phone.entity';
import { ProfileLookingForTrait } from './entities/profile-looking-for.entity';
import { ProfilePersonality } from './entities/profile-personality.entity';
import { Profile } from './entities/profile.entity';
import {
  ProfileResponse,
  toProfileResponse,
  toProfilesResponse,
} from './profiles.types';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    @InjectRepository(ProfilePersonality)
    private readonly personalitiesRepository: Repository<ProfilePersonality>,
    @InjectRepository(ProfileHobby)
    private readonly hobbiesRepository: Repository<ProfileHobby>,
    @InjectRepository(ProfileLookingForTrait)
    private readonly lookingForRepository: Repository<ProfileLookingForTrait>,
    @InjectRepository(ProfileInquiryPhone)
    private readonly phonesRepository: Repository<ProfileInquiryPhone>,
  ) {}

  async create(createProfileDto: CreateProfileDto): Promise<ProfileResponse> {
    const profile = this.profilesRepository.create({
      firstName: createProfileDto.firstName,
      lastName: createProfileDto.lastName,
      residence: createProfileDto.residence,
      heightCm: createProfileDto.heightCm,
      stream: createProfileDto.stream,
      maritalStatus: createProfileDto.maritalStatus,
      age: createProfileDto.age,
      desiredHomeDescription: createProfileDto.desiredHomeDescription,
      personalityTraits: createProfileDto.personalityTraits.map((value) =>
        this.personalitiesRepository.create({ value }),
      ),
      hobbies: createProfileDto.hobbies.map((value) =>
        this.hobbiesRepository.create({ value }),
      ),
      lookingForInPartner: createProfileDto.lookingForInPartner.map((value) =>
        this.lookingForRepository.create({ value }),
      ),
      inquiryPhones: createProfileDto.inquiryPhones.map((phone) =>
        this.phonesRepository.create(phone),
      ),
    });

    const savedProfile = await this.profilesRepository.save(profile);
    return toProfileResponse(savedProfile);
  }

  async findAll(): Promise<ProfileResponse[]> {
    const profiles = await this.profilesRepository.find({
      order: { createdAt: 'DESC' },
    });

    return toProfilesResponse(profiles);
  }

  async findOne(id: string): Promise<ProfileResponse> {
    const profile = await this.profilesRepository.findOne({ where: { id } });

    if (!profile) {
      throw new NotFoundException(`Profile with id "${id}" not found`);
    }

    return toProfileResponse(profile);
  }

  async update(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponse> {
    const profile = await this.profilesRepository.findOne({ where: { id } });

    if (!profile) {
      throw new NotFoundException(`Profile with id "${id}" not found`);
    }

    if (updateProfileDto.firstName !== undefined) {
      profile.firstName = updateProfileDto.firstName;
    }
    if (updateProfileDto.lastName !== undefined) {
      profile.lastName = updateProfileDto.lastName;
    }
    if (updateProfileDto.residence !== undefined) {
      profile.residence = updateProfileDto.residence;
    }
    if (updateProfileDto.heightCm !== undefined) {
      profile.heightCm = updateProfileDto.heightCm;
    }
    if (updateProfileDto.stream !== undefined) {
      profile.stream = updateProfileDto.stream;
    }
    if (updateProfileDto.maritalStatus !== undefined) {
      profile.maritalStatus = updateProfileDto.maritalStatus;
    }
    if (updateProfileDto.age !== undefined) {
      profile.age = updateProfileDto.age;
    }
    if (updateProfileDto.desiredHomeDescription !== undefined) {
      profile.desiredHomeDescription = updateProfileDto.desiredHomeDescription;
    }

    if (updateProfileDto.personalityTraits !== undefined) {
      await this.personalitiesRepository.delete({ profile: { id } });
      profile.personalityTraits = updateProfileDto.personalityTraits.map(
        (value) => this.personalitiesRepository.create({ value }),
      );
    }

    if (updateProfileDto.hobbies !== undefined) {
      await this.hobbiesRepository.delete({ profile: { id } });
      profile.hobbies = updateProfileDto.hobbies.map((value) =>
        this.hobbiesRepository.create({ value }),
      );
    }

    if (updateProfileDto.lookingForInPartner !== undefined) {
      await this.lookingForRepository.delete({ profile: { id } });
      profile.lookingForInPartner = updateProfileDto.lookingForInPartner.map(
        (value) => this.lookingForRepository.create({ value }),
      );
    }

    if (updateProfileDto.inquiryPhones !== undefined) {
      await this.phonesRepository.delete({ profile: { id } });
      profile.inquiryPhones = updateProfileDto.inquiryPhones.map((phone) =>
        this.phonesRepository.create(phone),
      );
    }

    const savedProfile = await this.profilesRepository.save(profile);
    return toProfileResponse(savedProfile);
  }

  async remove(id: string): Promise<void> {
    const profile = await this.profilesRepository.findOne({ where: { id } });

    if (!profile) {
      throw new NotFoundException(`Profile with id "${id}" not found`);
    }

    await this.profilesRepository.remove(profile);
  }
}
