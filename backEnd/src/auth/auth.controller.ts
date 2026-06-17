import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AccountResponseDto, UpdateAccountSettingsDto } from '../accounts/dto/account.dto';
import { AddLinkedShadchanDto } from '../accounts/dto/update-my-account.dto';
import { ShadchanSummaryDto } from '../accounts/dto/shadchan-summary.dto';
import { UpdateMyAccountDto } from '../accounts/dto/update-my-account.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthUserPayload } from './types/auth-user.payload';

class LoginResponseDto {
  token: string;
  account: AccountResponseDto;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new person account' })
  @ApiCreatedResponse({ type: LoginResponseDto })
  @ApiConflictResponse({ description: 'Email already registered' })
  register(@Body() signUpDto: SignUpDto) {
    return this.authService.register(signUpDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated account' })
  @ApiOkResponse({ type: AccountResponseDto })
  me(@CurrentUser() user: AuthUserPayload) {
    return this.authService.getCurrentUser(user.accountId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiOperation({ summary: 'Update current account contact details' })
  @ApiOkResponse({ type: AccountResponseDto })
  updateMyAccount(
    @CurrentUser() user: AuthUserPayload,
    @Body() updateMyAccountDto: UpdateMyAccountDto,
  ) {
    return this.authService.updateMyAccount(user.accountId, updateMyAccountDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me/settings')
  @ApiOperation({ summary: 'Update current account settings' })
  @ApiOkResponse({ type: AccountResponseDto })
  updateMySettings(
    @CurrentUser() user: AuthUserPayload,
    @Body() updateSettingsDto: UpdateAccountSettingsDto,
  ) {
    return this.authService.updateSettings(user.accountId, updateSettingsDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('shadchanim')
  @ApiOperation({ summary: 'List shadchan accounts available to link' })
  @ApiOkResponse({ type: ShadchanSummaryDto, isArray: true })
  listShadchanim() {
    return this.authService.listShadchanim();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/linked-shadchanim')
  @ApiOperation({ summary: 'List shadchanim linked to the current person account' })
  @ApiOkResponse({ type: ShadchanSummaryDto, isArray: true })
  listLinkedShadchanim(@CurrentUser() user: AuthUserPayload) {
    return this.authService.listLinkedShadchanim(user.accountId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('me/linked-shadchanim')
  @ApiOperation({ summary: 'Link a shadchan to the current person account' })
  @ApiOkResponse({ type: AccountResponseDto })
  addLinkedShadchan(
    @CurrentUser() user: AuthUserPayload,
    @Body() body: AddLinkedShadchanDto,
  ) {
    return this.authService.addLinkedShadchan(user.accountId, body.shadchanAccountId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('me/linked-shadchanim/:shadchanAccountId')
  @ApiOperation({ summary: 'Remove a linked shadchan from the current person account' })
  @ApiOkResponse({ type: AccountResponseDto })
  removeLinkedShadchan(
    @CurrentUser() user: AuthUserPayload,
    @Param('shadchanAccountId') shadchanAccountId: string,
  ) {
    return this.authService.removeLinkedShadchan(user.accountId, shadchanAccountId);
  }
}
