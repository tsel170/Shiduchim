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
import { AccountsService } from './accounts.service';
import {
  AccountResponseDto,
  CreateAccountDto,
  UpdateAccountDto,
  UpdateAccountSettingsDto,
} from './dto/account.dto';
import { ShadchanSummaryDto } from './dto/shadchan-summary.dto';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create account' })
  @ApiCreatedResponse({ type: AccountResponseDto })
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get accounts (optional role filter)' })
  @ApiQuery({ name: 'role', required: false, enum: ['person', 'shadchan'] })
  @ApiOkResponse({ type: AccountResponseDto, isArray: true })
  findAll(@Query('role') role?: 'person' | 'shadchan') {
    return this.accountsService.findAll(role);
  }

  @Get('shadchanim')
  @ApiOperation({ summary: 'List shadchan accounts' })
  @ApiOkResponse({ type: ShadchanSummaryDto, isArray: true })
  findShadchanim() {
    return this.accountsService.findShadchanim();
  }

  @Get(':accountId')
  @ApiOperation({ summary: 'Get account by id' })
  @ApiParam({ name: 'accountId' })
  @ApiOkResponse({ type: AccountResponseDto })
  @ApiNotFoundResponse({ description: 'Account not found' })
  findOne(@Param('accountId') accountId: string) {
    return this.accountsService.findOne(accountId);
  }

  @Patch(':accountId')
  @ApiOperation({ summary: 'Update account' })
  @ApiParam({ name: 'accountId' })
  @ApiOkResponse({ type: AccountResponseDto })
  @ApiNotFoundResponse({ description: 'Account not found' })
  update(
    @Param('accountId') accountId: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(accountId, updateAccountDto);
  }

  @Patch(':accountId/settings')
  @ApiOperation({ summary: 'Update account settings' })
  @ApiParam({ name: 'accountId' })
  @ApiOkResponse({ type: AccountResponseDto })
  @ApiNotFoundResponse({ description: 'Account not found' })
  updateSettings(
    @Param('accountId') accountId: string,
    @Body() updateSettingsDto: UpdateAccountSettingsDto,
  ) {
    return this.accountsService.updateSettings(accountId, updateSettingsDto);
  }

  @Delete(':accountId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete account' })
  @ApiParam({ name: 'accountId' })
  @ApiNoContentResponse({ description: 'Account deleted' })
  @ApiNotFoundResponse({ description: 'Account not found' })
  remove(@Param('accountId') accountId: string) {
    return this.accountsService.remove(accountId);
  }
}
