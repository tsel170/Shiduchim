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
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUserPayload } from '../auth/types/auth-user.payload';
import {
  BatchProfileStatusDto,
  CaseActionDto,
  CaseHistoryResponseDto,
  CreateMatchCaseDto,
  EnrichedMatchCaseResponseDto,
  ListMatchCasesQueryDto,
  ProfileCaseContextDto,
  PersonMatchCaseActionDto,
  UpdateMatchCaseDto,
} from './dto/match-case.dto';
import { MatchCasesService } from './match-cases.service';
import { PersonSlot as SimpleSlot } from './domain/simplified-case-workflow';

@ApiTags('matchCases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matchCases')
export class MatchCasesController {
  constructor(private readonly matchCasesService: MatchCasesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a match case (person or shadchan)' })
  @ApiCreatedResponse({ type: EnrichedMatchCaseResponseDto })
  create(@CurrentUser() user: AuthUserPayload, @Body() dto: CreateMatchCaseDto) {
    return this.matchCasesService.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List match cases for current user' })
  @ApiOkResponse({ type: EnrichedMatchCaseResponseDto, isArray: true })
  findAll(@CurrentUser() user: AuthUserPayload, @Query() query: ListMatchCasesQueryDto) {
    return this.matchCasesService.findAll(user, query);
  }

  @Get('profile-statuses')
  @ApiOperation({ summary: 'Batch profile match status badges' })
  @ApiOkResponse({ type: BatchProfileStatusDto })
  getProfileStatuses(
    @CurrentUser() user: AuthUserPayload,
    @Query('profileIds') profileIdsRaw?: string,
  ) {
    const profileIds = (profileIdsRaw ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    return this.matchCasesService.getProfileStatuses(user, profileIds).then((statuses) => ({
      statuses,
    }));
  }

  @Get('profile-context/:profileId')
  @ApiOperation({ summary: 'Active match case context for a profile view' })
  @ApiParam({ name: 'profileId' })
  @ApiOkResponse({ type: ProfileCaseContextDto })
  getProfileCaseContext(
    @CurrentUser() user: AuthUserPayload,
    @Param('profileId') profileId: string,
  ) {
    return this.matchCasesService.getProfileCaseContext(user, profileId);
  }

  @Get(':caseId/contact-details')
  @ApiOperation({ summary: 'View counterparty contact details (logged in history)' })
  @ApiParam({ name: 'caseId' })
  getContactDetails(@CurrentUser() user: AuthUserPayload, @Param('caseId') caseId: string) {
    return this.matchCasesService.getContactDetails(user, caseId);
  }

  @Get(':caseId/history')
  @ApiOperation({ summary: 'Get append-only case history (timeline)' })
  @ApiParam({ name: 'caseId' })
  @ApiOkResponse({ type: CaseHistoryResponseDto, isArray: true })
  getHistory(@CurrentUser() user: AuthUserPayload, @Param('caseId') caseId: string) {
    return this.matchCasesService.getHistory(user, caseId);
  }

  @Get(':caseId')
  @ApiOperation({ summary: 'Get match case by id' })
  @ApiParam({ name: 'caseId' })
  @ApiOkResponse({ type: EnrichedMatchCaseResponseDto })
  findOne(@CurrentUser() user: AuthUserPayload, @Param('caseId') caseId: string) {
    return this.matchCasesService.findOne(user, caseId);
  }

  @Put(':caseId')
  @ApiOperation({ summary: 'Update match case (shadchan)' })
  @ApiParam({ name: 'caseId' })
  @ApiOkResponse({ type: EnrichedMatchCaseResponseDto })
  update(
    @CurrentUser() user: AuthUserPayload,
    @Param('caseId') caseId: string,
    @Body() dto: UpdateMatchCaseDto,
  ) {
    return this.matchCasesService.update(user, caseId, dto);
  }

  @Patch(':caseId')
  @ApiOperation({ summary: 'Partially update match case (shadchan)' })
  @ApiParam({ name: 'caseId' })
  @ApiOkResponse({ type: EnrichedMatchCaseResponseDto })
  patch(
    @CurrentUser() user: AuthUserPayload,
    @Param('caseId') caseId: string,
    @Body() dto: UpdateMatchCaseDto,
  ) {
    return this.matchCasesService.update(user, caseId, dto);
  }

  @Patch(':caseId/person-action')
  @ApiOperation({ summary: 'Person action — auto-updates status' })
  @ApiParam({ name: 'caseId' })
  @ApiOkResponse({ type: EnrichedMatchCaseResponseDto })
  personAction(
    @CurrentUser() user: AuthUserPayload,
    @Param('caseId') caseId: string,
    @Body() dto: PersonMatchCaseActionDto,
  ) {
    return this.matchCasesService.applyPersonAction(
      user,
      caseId,
      dto.action as 'interested' | 'not_interested',
      dto.denialReason as import('./domain/denial-reason').DenialReason | undefined,
      dto.note,
    );
  }

  @Post(':caseId/actions')
  @ApiOperation({ summary: 'Unified case action — approve, deny, approve on behalf' })
  @ApiParam({ name: 'caseId' })
  @ApiOkResponse({ type: EnrichedMatchCaseResponseDto })
  caseAction(
    @CurrentUser() user: AuthUserPayload,
    @Param('caseId') caseId: string,
    @Body() dto: CaseActionDto,
  ) {
    return this.matchCasesService.applyCaseAction(user, caseId, {
      type: dto.type,
      slot: dto.slot as SimpleSlot | 'PersonA' | 'PersonB' | undefined,
      denialReason: dto.denialReason as import('./domain/denial-reason').DenialReason | undefined,
      note: dto.note,
    });
  }

  @Delete(':caseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft close match case (history preserved)' })
  @ApiParam({ name: 'caseId' })
  @ApiOkResponse({ type: EnrichedMatchCaseResponseDto })
  close(@CurrentUser() user: AuthUserPayload, @Param('caseId') caseId: string) {
    return this.matchCasesService.close(user, caseId);
  }
}
