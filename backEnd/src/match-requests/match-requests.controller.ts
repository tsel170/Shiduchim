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
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateMatchRequestDto,
  MatchRequestResponseDto,
  UpdateMatchRequestDto,
} from './dto/match-request.dto';
import { MatchRequestsService } from './match-requests.service';

@ApiTags('match-requests')
@Controller('match-requests')
export class MatchRequestsController {
  constructor(private readonly matchRequestsService: MatchRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create match request' })
  @ApiCreatedResponse({ type: MatchRequestResponseDto })
  create(@Body() createMatchRequestDto: CreateMatchRequestDto) {
    return this.matchRequestsService.create(createMatchRequestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get match requests' })
  @ApiQuery({ name: 'shadchanId', required: false })
  @ApiQuery({ name: 'senderProfileId', required: false })
  @ApiQuery({ name: 'targetProfileId', required: false })
  @ApiOkResponse({ type: MatchRequestResponseDto, isArray: true })
  findAll(
    @Query('shadchanId') shadchanId?: string,
    @Query('senderProfileId') senderProfileId?: string,
    @Query('targetProfileId') targetProfileId?: string,
  ) {
    return this.matchRequestsService.findAll({
      shadchanId,
      senderProfileId,
      targetProfileId,
    });
  }

  @Get(':requestId')
  @ApiOperation({ summary: 'Get match request by id' })
  @ApiParam({ name: 'requestId' })
  @ApiOkResponse({ type: MatchRequestResponseDto })
  @ApiNotFoundResponse({ description: 'Match request not found' })
  findOne(@Param('requestId') requestId: string) {
    return this.matchRequestsService.findOne(requestId);
  }

  @Patch(':requestId')
  @ApiOperation({ summary: 'Update match request' })
  @ApiParam({ name: 'requestId' })
  @ApiOkResponse({ type: MatchRequestResponseDto })
  @ApiNotFoundResponse({ description: 'Match request not found' })
  update(
    @Param('requestId') requestId: string,
    @Body() updateMatchRequestDto: UpdateMatchRequestDto,
  ) {
    return this.matchRequestsService.update(requestId, updateMatchRequestDto);
  }

  @Delete(':requestId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete match request' })
  @ApiParam({ name: 'requestId' })
  @ApiNoContentResponse({ description: 'Match request deleted' })
  @ApiNotFoundResponse({ description: 'Match request not found' })
  remove(@Param('requestId') requestId: string) {
    return this.matchRequestsService.remove(requestId);
  }
}
