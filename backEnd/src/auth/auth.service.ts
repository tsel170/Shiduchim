import { Injectable, BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountsService } from '../accounts/accounts.service';
import { UpdateAccountSettingsDto } from '../accounts/dto/account.dto';
import { UpdateMyAccountDto } from '../accounts/dto/update-my-account.dto';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const account = await this.accountsService.validateCredentials(
      loginDto.email,
      loginDto.password,
    );
    if (!account) {
      throw new UnauthorizedException('אימייל או סיסמה שגויים');
    }

    return this.buildSession(account);
  }

  async register(signUpDto: SignUpDto) {
    const firstName = signUpDto.firstName.trim();
    const lastName = signUpDto.lastName?.trim() ?? '';

    if (!firstName) {
      throw new BadRequestException('נא להזין שם פרטי');
    }
    if (signUpDto.role === 'shadchan' && !lastName) {
      throw new BadRequestException('שדכן חייב להזין שם משפחה');
    }

    const phone = signUpDto.phone?.trim() ?? '';
    if (!phone) {
      throw new BadRequestException('נא להזין מספר טלפון');
    }

    const account = await this.accountsService.create({
      email: signUpDto.email.trim(),
      password: signUpDto.password,
      role: signUpDto.role,
      firstName,
      lastName,
      phone,
    });

    return this.buildSession(account);
  }

  async getCurrentUser(accountId: string) {
    return this.accountsService.findOne(accountId);
  }

  async updateSettings(accountId: string, updateSettingsDto: UpdateAccountSettingsDto) {
    return this.accountsService.updateSettings(accountId, updateSettingsDto);
  }

  async updateMyAccount(accountId: string, updateMyAccountDto: UpdateMyAccountDto) {
    return this.accountsService.updateMyAccount(accountId, {
      firstName: updateMyAccountDto.firstName,
      lastName: updateMyAccountDto.lastName,
      email: updateMyAccountDto.email,
      phone: updateMyAccountDto.phone,
    });
  }

  async listShadchanim() {
    return this.accountsService.findShadchanim();
  }

  async listLinkedShadchanim(personAccountId: string) {
    return this.accountsService.findLinkedShadchanim(personAccountId);
  }

  async listLinkedPersons(shadchanAccountId: string, role: 'person' | 'shadchan') {
    if (role !== 'shadchan') {
      throw new ForbiddenException('רק שדכן/ית יכול/ה לצפות במשודכים מקושרים');
    }
    return this.accountsService.findLinkedPersons(shadchanAccountId);
  }

  async addLinkedShadchan(personAccountId: string, shadchanAccountId: string) {
    return this.accountsService.addLinkedShadchan(personAccountId, shadchanAccountId);
  }

  async removeLinkedShadchan(personAccountId: string, shadchanAccountId: string) {
    return this.accountsService.removeLinkedShadchan(personAccountId, shadchanAccountId);
  }

  private async buildSession(account: {
    accountId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'person' | 'shadchan';
    profileId: string | null;
    phone: string | null;
    settings: unknown;
    linkedShadchanIds?: string[];
  }) {
    const token = await this.jwtService.signAsync({
      sub: account.accountId,
      email: account.email,
      role: account.role,
      profileId: account.profileId,
    });

    return {
      token,
      account: {
        accountId: account.accountId,
        firstName: account.firstName ?? '',
        lastName: account.lastName ?? '',
        email: account.email,
        role: account.role,
        profileId: account.profileId,
        phone: account.phone,
        settings: account.settings,
        linkedShadchanIds: account.linkedShadchanIds ?? [],
      },
    };
  }
}
