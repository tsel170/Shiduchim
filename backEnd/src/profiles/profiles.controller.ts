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
        streams: STREAMS,
        maritalStatuses: MARITAL_STATUSES,
        personalityTraits: PERSONALITY_TRAITS,
        hobbies: HOBBIES,
        lookingForTraits: LOOKING_FOR_TRAITS,
      },
    },
  })
  getOptions() {
    return {
      cities: CITIES,
      streams: STREAMS,
      maritalStatuses: MARITAL_STATUSES,
      personalityTraits: PERSONALITY_TRAITS,
      hobbies: HOBBIES,
      lookingForTraits: LOOKING_FOR_TRAITS,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new profile' })
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

  @Get(':id')
  @ApiOperation({ summary: 'Get profile by id' })
  @ApiParam({ name: 'id', example: 'D54F0F54-E6EB-4296-8803-D1051A4D3065' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  findOne(@Param('id') id: string) {
    return this.profilesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update profile' })
  @ApiParam({ name: 'id', example: 'D54F0F54-E6EB-4296-8803-D1051A4D3065' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete profile' })
  @ApiParam({ name: 'id', example: 'D54F0F54-E6EB-4296-8803-D1051A4D3065' })
  @ApiNoContentResponse({ description: 'Profile deleted' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  remove(@Param('id') id: string) {
    return this.profilesService.remove(id);
  }
}
