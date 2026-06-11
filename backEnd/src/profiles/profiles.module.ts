import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileHobby } from './entities/profile-hobby.entity';
import { ProfileInquiryPhone } from './entities/profile-inquiry-phone.entity';
import { ProfileLookingForTrait } from './entities/profile-looking-for.entity';
import { ProfilePersonality } from './entities/profile-personality.entity';
import { Profile } from './entities/profile.entity';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
      ProfilePersonality,
      ProfileHobby,
      ProfileLookingForTrait,
      ProfileInquiryPhone,
    ]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
