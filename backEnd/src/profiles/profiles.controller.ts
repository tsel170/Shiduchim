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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUserPayload } from '../auth/types/auth-user.payload';
import { PROFILE_OPTIONS_RESPONSE } from './constants/profile-options';
import { CreateShadchanProfileDto } from './dto/create-shadchan-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { SearchProfilesDto } from './dto/search-profiles.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateShadchanProfileDto } from './dto/update-shadchan-profile.dto';
import { ProfilesService } from './profiles.service';
import { SanitizeProfileBodyPipe } from '../common/pipes/sanitize-profile-body.pipe';

@ApiTags('profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Public()
  @Get('options')
  @ApiOperation({ summary: 'Get available selection options (slug ids)' })
  getOptions() {
    return PROFILE_OPTIONS_RESPONSE;
  }

  @Post('search')
  @ApiOperation({ summary: 'Search profiles with filter configuration' })
  @ApiOkResponse({ type: ProfileResponseDto, isArray: true })
  search(@Body() searchProfilesDto: SearchProfilesDto) {
    return this.profilesService.search(searchProfilesDto.filters);
  }

  @Post('mine')
  @ApiOperation({ summary: 'Create personal profile for the current person account' })
  @ApiCreatedResponse({ type: ProfileResponseDto })
  createMine(
    @CurrentUser() user: AuthUserPayload,
    @Body(SanitizeProfileBodyPipe) createProfileDto: CreateProfileDto,
  ) {
    return this.profilesService.createForPerson(user, createProfileDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create profile' })
  @ApiCreatedResponse({ type: ProfileResponseDto })
  create(
    @Body(SanitizeProfileBodyPipe) createProfileDto: CreateShadchanProfileDto,
  ) {
    return this.profilesService.create(createProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get profiles' })
  @ApiQuery({ name: 'addedByShadchanId', required: false })
  @ApiQuery({ name: 'managedByShadchanId', required: false })
  @ApiQuery({ name: 'ownerAccountId', required: false })
  @ApiOkResponse({ type: ProfileResponseDto, isArray: true })
  findAll(
    @Query('addedByShadchanId') addedByShadchanId?: string,
    @Query('managedByShadchanId') managedByShadchanId?: string,
    @Query('ownerAccountId') ownerAccountId?: string,
  ) {
    return this.profilesService.findAll({
      addedByShadchanId,
      managedByShadchanId,
      ownerAccountId,
    });
  }

  @Get(':profileId')
  @ApiOperation({ summary: 'Get profile by id' })
  @ApiParam({ name: 'profileId' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  findOne(@Param('profileId') profileId: string) {
    return this.profilesService.findOne(profileId);
  }

  @Put(':profileId')
  @ApiOperation({ summary: 'Replace profile fields' })
  @ApiParam({ name: 'profileId' })
  @ApiOkResponse({ type: ProfileResponseDto })
  put(
    @Param('profileId') profileId: string,
    @Body() updateProfileDto: CreateProfileDto,
  ) {
    return this.profilesService.update(profileId, updateProfileDto);
  }

  @Patch(':profileId')
  @ApiOperation({ summary: 'Update profile' })
  @ApiParam({ name: 'profileId' })
  @ApiOkResponse({ type: ProfileResponseDto })
  patch(
    @Param('profileId') profileId: string,
    @CurrentUser() user: AuthUserPayload,
    @Body() updateProfileDto: UpdateShadchanProfileDto,
  ) {
    return this.profilesService.updateForUser(profileId, user, updateProfileDto);
  }

  @Delete(':profileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete profile' })
  @ApiParam({ name: 'profileId' })
  @ApiNoContentResponse({ description: 'Profile deleted' })
  remove(@Param('profileId') profileId: string, @CurrentUser() user: AuthUserPayload) {
    return this.profilesService.removeForUser(profileId, user);
  }
}
