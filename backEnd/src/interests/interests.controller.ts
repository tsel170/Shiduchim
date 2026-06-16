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
  CreateInterestDto,
  InterestResponseDto,
  UpdateInterestDto,
} from './dto/interest.dto';
import { InterestsService } from './interests.service';

@ApiTags('interests')
@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create interest' })
  @ApiCreatedResponse({ type: InterestResponseDto })
  create(@Body() createInterestDto: CreateInterestDto) {
    return this.interestsService.create(createInterestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get interests' })
  @ApiQuery({ name: 'ownerAccountId', required: false })
  @ApiOkResponse({ type: InterestResponseDto, isArray: true })
  findAll(@Query('ownerAccountId') ownerAccountId?: string) {
    return this.interestsService.findAll(ownerAccountId);
  }

  @Get(':interestId')
  @ApiOperation({ summary: 'Get interest by id' })
  @ApiParam({ name: 'interestId' })
  @ApiOkResponse({ type: InterestResponseDto })
  @ApiNotFoundResponse({ description: 'Interest not found' })
  findOne(@Param('interestId') interestId: string) {
    return this.interestsService.findOne(interestId);
  }

  @Patch(':interestId')
  @ApiOperation({ summary: 'Update interest status' })
  @ApiParam({ name: 'interestId' })
  @ApiOkResponse({ type: InterestResponseDto })
  @ApiNotFoundResponse({ description: 'Interest not found' })
  update(
    @Param('interestId') interestId: string,
    @Body() updateInterestDto: UpdateInterestDto,
  ) {
    return this.interestsService.update(interestId, updateInterestDto);
  }

  @Delete(':interestId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete interest' })
  @ApiParam({ name: 'interestId' })
  @ApiNoContentResponse({ description: 'Interest deleted' })
  @ApiNotFoundResponse({ description: 'Interest not found' })
  remove(@Param('interestId') interestId: string) {
    return this.interestsService.remove(interestId);
  }
}
