import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  CITIES,
  HOBBIES,
  LOOKING_FOR_TRAITS,
  MARITAL_STATUSES,
  PERSONALITY_TRAITS,
  STREAMS,
} from './constants/profile-options';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfilesService } from './profiles.service';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('options')
  @ApiOperation({ summary: 'Get available selection options' })
  @ApiOkResponse({
    schema: {
      example: {
        cities: CITIES,
        religiousStreams: STREAMS,
        maritalStatuses: MARITAL_STATUSES,
        personalityTraits: PERSONALITY_TRAITS,
        hobbies: HOBBIES,
        lookingFor: LOOKING_FOR_TRAITS,
      },
    },
  })
  getOptions() {
    return {
      cities: CITIES,
      religiousStreams: STREAMS,
      maritalStatuses: MARITAL_STATUSES,
      personalityTraits: PERSONALITY_TRAITS,
      hobbies: HOBBIES,
      lookingFor: LOOKING_FOR_TRAITS,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create profile' })
  @ApiCreatedResponse({ type: ProfileResponseDto })
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all profiles' })
  @ApiOkResponse({ type: ProfileResponseDto, isArray: true })
  findAll() {
    return this.profilesService.findAll();
  }

  @Get(':profileId')
  @ApiOperation({ summary: 'Get profile by id' })
  @ApiParam({ name: 'profileId' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  findOne(@Param('profileId') profileId: string) {
    return this.profilesService.findOne(profileId);
  }

  @Patch(':profileId')
  @ApiOperation({ summary: 'Update profile' })
  @ApiParam({ name: 'profileId' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  update(
    @Param('profileId') profileId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.update(profileId, updateProfileDto);
  }

  @Delete(':profileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete profile' })
  @ApiParam({ name: 'profileId' })
  @ApiNoContentResponse({ description: 'Profile deleted' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  remove(@Param('profileId') profileId: string) {
    return this.profilesService.remove(profileId);
  }
}
