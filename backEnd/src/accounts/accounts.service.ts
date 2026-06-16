import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { generateId } from '../common/utils/generate-id';
import {
  CreateAccountDto,
  UpdateAccountDto,
  UpdateAccountSettingsDto,
} from './dto/account.dto';
import { Account, AccountDocument } from './schemas/account.schema';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
  ) {}

  async create(createAccountDto: CreateAccountDto) {
    const existing = await this.accountModel.findOne({
      email: createAccountDto.email,
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(createAccountDto.password, 10);

    const account = await this.accountModel.create({
      accountId: generateId(),
      email: createAccountDto.email,
      passwordHash,
      role: createAccountDto.role,
      profileId: createAccountDto.profileId ?? null,
      settings: createAccountDto.settings ?? {},
    });

    return this.toResponse(account);
  }

  async findAll() {
    const accounts = await this.accountModel.find().sort({ email: 1 });
    return accounts.map((account) => this.toResponse(account));
  }

  async findOne(accountId: string) {
    const account = await this.accountModel.findOne({ accountId });
    if (!account) {
      throw new NotFoundException(`Account "${accountId}" not found`);
    }
    return this.toResponse(account);
  }

  async update(accountId: string, updateAccountDto: UpdateAccountDto) {
    const account = await this.accountModel.findOne({ accountId });
    if (!account) {
      throw new NotFoundException(`Account "${accountId}" not found`);
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
      account.settings.filters = {
        ...account.settings.filters,
        ...updateSettingsDto.filters,
      };
    }

    if (updateSettingsDto.displayPreferences !== undefined) {
      account.settings.displayPreferences = {
        ...account.settings.displayPreferences,
        ...updateSettingsDto.displayPreferences,
      };
    }

    account.markModified('settings');
    await account.save();
    return this.toResponse(account);
  }

  async remove(accountId: string) {
    const result = await this.accountModel.deleteOne({ accountId });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Account "${accountId}" not found`);
    }
  }

  private toResponse(account: AccountDocument) {
    return {
      accountId: account.accountId,
      email: account.email,
      role: account.role,
      profileId: account.profileId,
      settings: account.settings,
    };
  }
}
