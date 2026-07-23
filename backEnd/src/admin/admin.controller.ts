import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ACCOUNT_ROLES } from '../common/types/account-role';
import type { AccountRole } from '../common/types/account-role';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('accounts')
  @ApiOperation({ summary: 'List / search / filter all accounts' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'role', required: false, enum: ACCOUNT_ROLES })
  @ApiQuery({ name: 'isBlocked', required: false })
  @ApiQuery({ name: 'isDeleted', required: false })
  @ApiOkResponse({ description: 'Accounts with associated profile + shadchanim' })
  listAccounts(
    @Query('q') q?: string,
    @Query('role') role?: AccountRole,
    @Query('isBlocked') isBlocked?: string,
    @Query('isDeleted') isDeleted?: string,
  ) {
    return this.adminService.listAccounts({
      q,
      role,
      isBlocked: parseOptionalBool(isBlocked),
      isDeleted: parseOptionalBool(isDeleted),
    });
  }

  @Get('accounts/:accountId')
  @ApiOperation({ summary: 'Get account details for admin' })
  getAccount(@Param('accountId') accountId: string) {
    return this.adminService.getAccount(accountId);
  }

  @Patch('accounts/:accountId/block')
  @ApiOperation({ summary: 'Block account' })
  blockAccount(@Param('accountId') accountId: string) {
    return this.adminService.blockAccount(accountId, true);
  }

  @Patch('accounts/:accountId/unblock')
  @ApiOperation({ summary: 'Unblock account' })
  unblockAccount(@Param('accountId') accountId: string) {
    return this.adminService.blockAccount(accountId, false);
  }

  @Patch('accounts/:accountId/soft-delete')
  @ApiOperation({ summary: 'Soft-delete account' })
  softDeleteAccount(@Param('accountId') accountId: string) {
    return this.adminService.softDeleteAccount(accountId);
  }

  @Patch('accounts/:accountId/restore')
  @ApiOperation({ summary: 'Restore soft-deleted account' })
  restoreAccount(@Param('accountId') accountId: string) {
    return this.adminService.restoreAccount(accountId);
  }

  @Get('profiles')
  @ApiOperation({ summary: 'List all profiles' })
  @ApiQuery({ name: 'includeDeleted', required: false })
  listProfiles(@Query('includeDeleted') includeDeleted?: string) {
    return this.adminService.listProfiles(includeDeleted === 'true');
  }

  @Patch('profiles/:profileId/soft-delete')
  @ApiOperation({ summary: 'Soft-delete profile' })
  softDeleteProfile(@Param('profileId') profileId: string) {
    return this.adminService.softDeleteProfile(profileId);
  }

  @Patch('profiles/:profileId/restore')
  @ApiOperation({ summary: 'Restore soft-deleted profile' })
  restoreProfile(@Param('profileId') profileId: string) {
    return this.adminService.restoreProfile(profileId);
  }

  @Get('match-cases')
  @ApiOperation({ summary: 'List all shidduch cases' })
  listMatchCases() {
    return this.adminService.listMatchCases();
  }

  @Get('favorites')
  @ApiOperation({ summary: 'List all favorites' })
  listFavorites() {
    return this.adminService.listFavorites();
  }
}

function parseOptionalBool(value?: string): boolean | undefined {
  if (value == null || value === '') return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}
