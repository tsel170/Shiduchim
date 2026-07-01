import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
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
  CreateManagementRequestDto,
  ManagementRequestProfileContextDto,
  ManagementRequestResponseDto,
  RespondManagementRequestDto,
} from './dto/management-request.dto';
import { ManagementRequestsService } from './management-requests.service';

const MANAGEMENT_REQUEST_STATUSES = ['pending', 'approved', 'declined'] as const;
type ManagementRequestStatus = (typeof MANAGEMENT_REQUEST_STATUSES)[number];

@ApiTags('management-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('management-requests')
export class ManagementRequestsController {
  constructor(
    private readonly managementRequestsService: ManagementRequestsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Shadchan sends a management request to a person with account' })
  @ApiCreatedResponse({ type: ManagementRequestResponseDto })
  create(
    @CurrentUser() user: AuthUserPayload,
    @Body() createDto: CreateManagementRequestDto,
  ) {
    return this.managementRequestsService.create(user, createDto);
  }

  @Get('shadchan')
  @ApiOperation({ summary: 'List management requests sent by current shadchan' })
  @ApiOkResponse({ type: ManagementRequestResponseDto, isArray: true })
  findForShadchan(@CurrentUser() user: AuthUserPayload) {
    return this.managementRequestsService.findForShadchan(user);
  }

  @Get('check/:profileId')
  @ApiOperation({ summary: 'Check if shadchan can send management request for profile' })
  @ApiParam({ name: 'profileId' })
  @ApiOkResponse({ type: ManagementRequestProfileContextDto })
  getProfileContext(
    @CurrentUser() user: AuthUserPayload,
    @Param('profileId') profileId: string,
  ) {
    return this.managementRequestsService.getProfileContext(user, profileId);
  }

  @Get()
  @ApiOperation({ summary: 'List management requests for current person' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'declined'] })
  @ApiOkResponse({ type: ManagementRequestResponseDto, isArray: true })
  findForPerson(
    @CurrentUser() user: AuthUserPayload,
    @Query('status') status?: ManagementRequestStatus,
  ) {
    return this.managementRequestsService.findForPerson(user, status);
  }

  @Patch(':requestId/respond')
  @ApiOperation({ summary: 'Person approves or declines a management request' })
  @ApiParam({ name: 'requestId' })
  @ApiOkResponse({ type: ManagementRequestResponseDto })
  respond(
    @CurrentUser() user: AuthUserPayload,
    @Param('requestId') requestId: string,
    @Body() respondDto: RespondManagementRequestDto,
  ) {
    return this.managementRequestsService.respond(user, requestId, respondDto);
  }
}
