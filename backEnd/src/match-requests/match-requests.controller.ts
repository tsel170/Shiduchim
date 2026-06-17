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
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUserPayload } from '../auth/types/auth-user.payload';
import {
  CreateMatchRequestDto,
  EnrichedMatchRequestResponseDto,
  UpdateMatchRequestDto,
} from './dto/match-request.dto';
import { MatchRequestsService } from './match-requests.service';

@ApiTags('requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('requests')
export class MatchRequestsController {
  constructor(private readonly matchRequestsService: MatchRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Person sends a request to their shadchan' })
  @ApiCreatedResponse({ type: EnrichedMatchRequestResponseDto })
  create(
    @CurrentUser() user: AuthUserPayload,
    @Body() createMatchRequestDto: CreateMatchRequestDto,
  ) {
    return this.matchRequestsService.create(user, createMatchRequestDto);
  }

  @Get('outgoing')
  @ApiOperation({ summary: 'Get outgoing requests for current person' })
  @ApiOkResponse({ type: EnrichedMatchRequestResponseDto, isArray: true })
  findOutgoing(@CurrentUser() user: AuthUserPayload) {
    return this.matchRequestsService.findOutgoingForPerson(user);
  }

  @Get()
  @ApiOperation({ summary: 'Get requests for current shadchan' })
  @ApiOkResponse({ type: EnrichedMatchRequestResponseDto, isArray: true })
  findAll(@CurrentUser() user: AuthUserPayload) {
    return this.matchRequestsService.findAll({ shadchanId: user.accountId });
  }

  @Get(':requestId')
  @ApiOperation({ summary: 'Get request by id' })
  @ApiParam({ name: 'requestId' })
  @ApiOkResponse({ type: EnrichedMatchRequestResponseDto })
  @ApiNotFoundResponse({ description: 'Request not found' })
  findOne(
    @CurrentUser() user: AuthUserPayload,
    @Param('requestId') requestId: string,
  ) {
    return this.matchRequestsService.findOne(requestId, user.accountId);
  }

  @Put(':requestId')
  @ApiOperation({ summary: 'Update request' })
  @ApiParam({ name: 'requestId' })
  @ApiOkResponse({ type: EnrichedMatchRequestResponseDto })
  put(
    @CurrentUser() user: AuthUserPayload,
    @Param('requestId') requestId: string,
    @Body() updateMatchRequestDto: UpdateMatchRequestDto,
  ) {
    return this.matchRequestsService.update(
      requestId,
      user.accountId,
      updateMatchRequestDto,
    );
  }

  @Patch(':requestId')
  @ApiOperation({ summary: 'Partially update request' })
  @ApiParam({ name: 'requestId' })
  @ApiOkResponse({ type: EnrichedMatchRequestResponseDto })
  patch(
    @CurrentUser() user: AuthUserPayload,
    @Param('requestId') requestId: string,
    @Body() updateMatchRequestDto: UpdateMatchRequestDto,
  ) {
    return this.matchRequestsService.update(
      requestId,
      user.accountId,
      updateMatchRequestDto,
    );
  }

  @Delete(':requestId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete request' })
  @ApiParam({ name: 'requestId' })
  @ApiNoContentResponse({ description: 'Request deleted' })
  remove(
    @CurrentUser() user: AuthUserPayload,
    @Param('requestId') requestId: string,
  ) {
    return this.matchRequestsService.removeForUser(user, requestId);
  }
}
