import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { generateId } from '../common/utils/generate-id';
import { normalizeAccountSettings } from '../common/utils/normalize-account-settings';
import {
  CreateAccountDto,
  UpdateAccountDto,
  UpdateAccountSettingsDto,
} from './dto/account.dto';
import { Account, AccountDocument } from './schemas/account.schema';

const DEMO_ACCOUNTS = [
  {
    email: 'Person',
    password: 'Person',
    role: 'person' as const,
    firstName: 'משודך',
    lastName: 'דמו',
  },
  {
    email: 'Shadchan',
    password: 'Shadchan',
    role: 'shadchan' as const,
    firstName: 'שדכן',
    lastName: 'דמו',
  },
];

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
  ) {}

  async seedDemoAccounts() {
    for (const demo of DEMO_ACCOUNTS) {
      const existing = await this.accountModel.findOne({ email: demo.email });
      if (existing) {
        const needsName =
          !existing.firstName?.trim() ||
          !existing.lastName?.trim() ||
          existing.firstName !== demo.firstName ||
          existing.lastName !== demo.lastName;
        if (needsName) {
          existing.firstName = demo.firstName;
          existing.lastName = demo.lastName;
          await existing.save();
        }
        continue;
      }

      const passwordHash = await bcrypt.hash(demo.password, 10);
      try {
        await this.accountModel.create({
          accountId: generateId(),
          email: demo.email,
          passwordHash,
          role: demo.role,
          firstName: demo.firstName,
          lastName: demo.lastName,
          profileId: null,
          settings: {},
        });
      } catch (error) {
        const code = (error as { code?: number }).code;
        if (code !== 11000) throw error;
      }
    }

    await this.backfillMissingAccountNames();
  }

  async backfillMissingAccountNames() {
    const accounts = await this.accountModel.find();
    for (const account of accounts) {
      const demo = DEMO_ACCOUNTS.find((entry) => entry.email === account.email);
      if (demo) {
        const needsUpdate =
          account.firstName !== demo.firstName || account.lastName !== demo.lastName;
        if (needsUpdate) {
          account.firstName = demo.firstName;
          account.lastName = demo.lastName;
          await account.save();
        }
        continue;
      }

      if (account.firstName?.trim()) {
        continue;
      }

      const localPart = account.email.includes('@')
        ? account.email.split('@')[0]?.trim()
        : account.email.trim();
      if (!localPart) {
        continue;
      }

      account.firstName = localPart;
      if (!account.lastName?.trim()) {
        account.lastName = '';
      }
      await account.save();
    }
  }

  async validateCredentials(email: string, password: string) {
    const account = await this.accountModel
      .findOne({ email: email.trim() })
      .select('+passwordHash');
    if (!account) return null;

    const valid = await bcrypt.compare(password, account.passwordHash);
    if (!valid) return null;

    return this.toResponse(account);
  }

  async create(createAccountDto: CreateAccountDto) {
    if (!createAccountDto.role) {
      throw new BadRequestException('role is required');
    }

    const existing = await this.accountModel.findOne({
      email: createAccountDto.email,
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(createAccountDto.password, 10);

    const account = await this.accountModel.create({
      accountId: generateId(),
      email: createAccountDto.email.trim(),
      passwordHash,
      role: createAccountDto.role,
      firstName: createAccountDto.firstName?.trim() ?? '',
      lastName: createAccountDto.lastName?.trim() ?? '',
      profileId: createAccountDto.profileId ?? null,
      phone: createAccountDto.phone?.trim() || null,
      settings: createAccountDto.settings ?? {},
    });

    return this.toResponse(account);
  }

  async findAll(role?: 'person' | 'shadchan') {
    const query = role ? { role } : {};
    const accounts = await this.accountModel.find(query).sort({ email: 1 });
    return accounts.map((account) => this.toResponse(account));
  }

  async findOne(accountId: string) {
    const account = await this.accountModel.findOne({ accountId });
    if (!account) {
      throw new NotFoundException(`Account "${accountId}" not found`);
    }
    return this.toResponse(account);
  }

  async linkProfile(accountId: string, profileId: string) {
    const account = await this.accountModel.findOne({ accountId });
    if (!account) {
      throw new NotFoundException(`Account "${accountId}" not found`);
    }
    if (account.profileId) {
      throw new ConflictException('לחשבון זה כבר משויך פרופיל');
    }
    account.profileId = profileId;
    await account.save();
    return this.toResponse(account);
  }

  async update(accountId: string, updateAccountDto: UpdateAccountDto) {
    const account = await this.accountModel.findOne({ accountId });
    if (!account) {
      throw new NotFoundException(`Account "${accountId}" not found`);
    }

    if (updateAccountDto.firstName !== undefined) {
      account.firstName = updateAccountDto.firstName.trim();
    }

    if (updateAccountDto.lastName !== undefined) {
      account.lastName = updateAccountDto.lastName.trim();
    }

    if (updateAccountDto.email !== undefined) {
      const emailTaken = await this.accountModel.findOne({
        email: updateAccountDto.email,
        accountId: { $ne: accountId },
      });
      if (emailTaken) {
        throw new ConflictException('Email already registered');
      }
      account.email = updateAccountDto.email;
    }

    if (updateAccountDto.password !== undefined) {
      account.passwordHash = await bcrypt.hash(updateAccountDto.password, 10);
    }

    if (updateAccountDto.role !== undefined) {
      account.role = updateAccountDto.role;
    }

    if (updateAccountDto.profileId !== undefined) {
      account.profileId = updateAccountDto.profileId;
    }

    if (updateAccountDto.phone !== undefined) {
      account.phone = updateAccountDto.phone?.trim() || null;
    }

    await account.save();
    return this.toResponse(account);
  }

  async updateSettings(
    accountId: string,
    updateSettingsDto: UpdateAccountSettingsDto,
  ) {
    const account = await this.accountModel.findOne({ accountId });
    if (!account) {
      throw new NotFoundException(`Account "${accountId}" not found`);
    }

    if (updateSettingsDto.filters !== undefined) {
      account.settings.filters = updateSettingsDto.filters;
    }

    if (updateSettingsDto.displayPreferences !== undefined) {
      account.settings.displayPreferences = updateSettingsDto.displayPreferences;
    }

    account.markModified('settings');
    await account.save();
    return this.toResponse(account);
  }

  async updateMyAccount(
    accountId: string,
    update: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string | null;
    },
  ) {
    const account = await this.accountModel.findOne({ accountId });
    if (!account) {
      throw new NotFoundException(`Account "${accountId}" not found`);
    }

    if (account.role === 'shadchan' && update.lastName !== undefined && !update.lastName.trim()) {
      throw new BadRequestException('שדכן חייב להזין שם משפחה');
    }

    return this.update(accountId, {
      firstName: update.firstName,
      lastName: update.lastName,
      email: update.email,
      phone: update.phone,
    });
  }

  async findShadchanim() {
    const accounts = await this.accountModel
      .find({ role: 'shadchan' })
      .sort({ firstName: 1, lastName: 1, email: 1 })
      .select('accountId email phone role firstName lastName');
    return accounts.map((account) => this.toShadchanSummary(account));
  }

  async findLinkedShadchanim(personAccountId: string) {
    const person = await this.accountModel.findOne({ accountId: personAccountId });
    if (!person || person.role !== 'person') {
      return [];
    }

    const linkedIds = person.linkedShadchanIds ?? [];
    if (linkedIds.length === 0) {
      return [];
    }

    const accounts = await this.accountModel
      .find({ accountId: { $in: linkedIds }, role: 'shadchan' })
      .select('accountId email phone role firstName lastName');

    const byId = new Map(accounts.map((account) => [account.accountId, account]));

    return linkedIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((account) => this.toShadchanSummary(account!));
  }

  async addLinkedShadchan(personAccountId: string, shadchanAccountId: string) {
    const person = await this.accountModel.findOne({ accountId: personAccountId });
    if (!person) {
      throw new NotFoundException(`Account "${personAccountId}" not found`);
    }
    if (person.role !== 'person') {
      throw new ForbiddenException('רק משודך/ת יכול/ה לקשר שדכנים');
    }

    const shadchan = await this.accountModel.findOne({
      accountId: shadchanAccountId,
      role: 'shadchan',
    });
    if (!shadchan) {
      throw new NotFoundException('שדכן לא נמצא במערכת');
    }

    const linked = person.linkedShadchanIds ?? [];
    if (!linked.includes(shadchanAccountId)) {
      person.linkedShadchanIds = [...linked, shadchanAccountId];
      await person.save();
    }

    return this.toResponse(person);
  }

  async removeLinkedShadchan(personAccountId: string, shadchanAccountId: string) {
    const person = await this.accountModel.findOne({ accountId: personAccountId });
    if (!person) {
      throw new NotFoundException(`Account "${personAccountId}" not found`);
    }
    if (person.role !== 'person') {
      throw new ForbiddenException('רק משודך/ת יכול/ה לנתק שדכנים');
    }

    person.linkedShadchanIds = (person.linkedShadchanIds ?? []).filter(
      (id) => id !== shadchanAccountId,
    );
    await person.save();
    return this.toResponse(person);
  }

  async remove(accountId: string) {
    const result = await this.accountModel.deleteOne({ accountId });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Account "${accountId}" not found`);
    }
  }

  async findDemoShadchanAccountId(): Promise<string> {
    const account = await this.accountModel.findOne({ email: 'Shadchan' });
    if (!account) {
      throw new NotFoundException('Demo shadchan account not found');
    }
    return account.accountId;
  }

  private toShadchanSummary(
    account: Pick<Account, 'accountId' | 'email' | 'phone' | 'firstName' | 'lastName'>,
  ) {
    return {
      accountId: account.accountId,
      firstName: account.firstName ?? '',
      lastName: account.lastName ?? '',
      email: account.email,
      phone: account.phone ?? null,
    };
  }

  private toResponse(account: AccountDocument) {
    return {
      accountId: account.accountId,
      firstName: account.firstName ?? '',
      lastName: account.lastName ?? '',
      email: account.email,
      role: account.role,
      profileId: account.profileId,
      phone: account.phone ?? null,
      settings: normalizeAccountSettings(account.settings),
      linkedShadchanIds:
        account.role === 'person' ? account.linkedShadchanIds ?? [] : [],
    };
  }
}
