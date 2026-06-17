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
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUserPayload } from '../auth/types/auth-user.payload';
import {
  CreateSuggestionDto,
  SuggestionResponseDto,
  UpdateSuggestionDto,
} from './dto/suggestion.dto';
import { SUGGESTION_STAGES } from './schemas/suggestion.schema';
import { SuggestionsService } from './suggestions.service';

@ApiTags('suggestions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('suggestions')
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Post()
  @ApiOperation({ summary: 'Shadchan sends a profile suggestion to a person' })
  @ApiCreatedResponse({ type: SuggestionResponseDto })
  create(
    @CurrentUser() user: AuthUserPayload,
    @Body() createSuggestionDto: CreateSuggestionDto,
  ) {
    return this.suggestionsService.create(user.accountId, createSuggestionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get suggestions for current person account' })
  @ApiQuery({ name: 'stage', required: false, enum: SUGGESTION_STAGES })
  @ApiOkResponse({ type: SuggestionResponseDto, isArray: true })
  findAll(
    @CurrentUser() user: AuthUserPayload,
    @Query('stage') stage?: string,
  ) {
    return this.suggestionsService.findForOwner(user.accountId, stage);
  }

  @Get(':suggestionId')
  @ApiOperation({ summary: 'Get suggestion by id' })
  @ApiParam({ name: 'suggestionId' })
  @ApiOkResponse({ type: SuggestionResponseDto })
  findOne(
    @CurrentUser() user: AuthUserPayload,
    @Param('suggestionId') suggestionId: string,
  ) {
    return this.suggestionsService.findOne(suggestionId, user.accountId);
  }

  @Put(':suggestionId')
  @ApiOperation({ summary: 'Update suggestion' })
  @ApiParam({ name: 'suggestionId' })
  @ApiOkResponse({ type: SuggestionResponseDto })
  put(
    @CurrentUser() user: AuthUserPayload,
    @Param('suggestionId') suggestionId: string,
    @Body() updateSuggestionDto: UpdateSuggestionDto,
  ) {
    return this.suggestionsService.update(
      suggestionId,
      user.accountId,
      updateSuggestionDto,
    );
  }

  @Patch(':suggestionId')
  @ApiOperation({ summary: 'Partially update suggestion' })
  @ApiParam({ name: 'suggestionId' })
  @ApiOkResponse({ type: SuggestionResponseDto })
  patch(
    @CurrentUser() user: AuthUserPayload,
    @Param('suggestionId') suggestionId: string,
    @Body() updateSuggestionDto: UpdateSuggestionDto,
  ) {
    return this.suggestionsService.update(
      suggestionId,
      user.accountId,
      updateSuggestionDto,
    );
  }

  @Delete(':suggestionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete suggestion' })
  @ApiParam({ name: 'suggestionId' })
  remove(
    @CurrentUser() user: AuthUserPayload,
    @Param('suggestionId') suggestionId: string,
  ) {
    return this.suggestionsService.remove(suggestionId, user.accountId);
  }
}
