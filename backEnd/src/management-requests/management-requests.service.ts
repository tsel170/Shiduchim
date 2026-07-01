import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountsService } from '../accounts/accounts.service';
import { AuthUserPayload } from '../auth/types/auth-user.payload';
import { generateId } from '../common/utils/generate-id';
import { ProfilesService } from '../profiles/profiles.service';
import {
  CreateManagementRequestDto,
  RespondManagementRequestDto,
} from './dto/management-request.dto';
import {
  ManagementRequest,
  ManagementRequestDocument,
} from './schemas/management-request.schema';

@Injectable()
export class ManagementRequestsService {
  constructor(
    @InjectModel(ManagementRequest.name)
    private readonly managementRequestModel: Model<ManagementRequestDocument>,
    private readonly accountsService: AccountsService,
    private readonly profilesService: ProfilesService,
  ) {}

  async create(user: AuthUserPayload, createDto: CreateManagementRequestDto) {
    if (user.role !== 'shadchan') {
      throw new ForbiddenException('רק שדכן יכול לשלוח בקשת ניהול');
    }

    const profile = await this.profilesService.findOne(createDto.personProfileId);
    if (!profile.ownerAccountId) {
      throw new BadRequestException('לפרופיל זה אין חשבון משתמש — לא ניתן לשלוח בקשת ניהול');
    }

    const personAccount = await this.accountsService.findOne(profile.ownerAccountId);
    if (personAccount.role !== 'person') {
      throw new BadRequestException('הפרופיל אינו שייך למשודך/ת');
    }

    const alreadyLinked = await this.accountsService.isProfileManagedByShadchan(
      {
        profileId: profile.profileId,
        addedByShadchanId: profile.addedByShadchanId,
        shadchanIds: profile.shadchanIds,
      },
      user.accountId,
    );
    if (alreadyLinked) {
      throw new ConflictException('הפרופיל כבר באחריותך');
    }

    const existingPending = await this.managementRequestModel.findOne({
      shadchanId: user.accountId,
      personAccountId: profile.ownerAccountId,
      status: 'pending',
    });
    if (existingPending) {
      throw new ConflictException('כבר נשלחה בקשת ניהול ממתינה לפרופיל זה');
    }

    const request = await this.managementRequestModel.create({
      requestId: generateId(),
      shadchanId: user.accountId,
      personAccountId: profile.ownerAccountId,
      personProfileId: profile.profileId,
      message: createDto.message.trim(),
      status: 'pending',
    });

    return this.toEnrichedResponse(request);
  }

  async findForPerson(user: AuthUserPayload, status?: 'pending' | 'approved' | 'declined') {
    if (user.role !== 'person') {
      throw new ForbiddenException('רק משודך/ת יכול/ה לצפות בבקשות ניהול');
    }

    const query: Record<string, unknown> = { personAccountId: user.accountId };
    if (status) {
      query.status = status;
    }

    const requests = await this.managementRequestModel
      .find(query)
      .sort({ createdAt: -1 });

    return Promise.all(requests.map((request) => this.toEnrichedResponse(request)));
  }

  async findForShadchan(user: AuthUserPayload) {
    if (user.role !== 'shadchan') {
      throw new ForbiddenException('רק שדכן יכול לצפות בבקשות ניהול ששלח');
    }

    const requests = await this.managementRequestModel
      .find({ shadchanId: user.accountId })
      .sort({ createdAt: -1 });

    return Promise.all(requests.map((request) => this.toEnrichedResponse(request)));
  }

  async getProfileContext(user: AuthUserPayload, profileId: string) {
    if (user.role !== 'shadchan') {
      throw new ForbiddenException('רק שדכן יכול לבדוק בקשת ניהול לפרופיל');
    }

    const profile = await this.profilesService.findOne(profileId);
    if (!profile.ownerAccountId) {
      return {
        canSend: false,
        alreadyLinked: false,
        reason: 'לפרופיל זה אין חשבון משתמש',
        pendingRequest: null,
      };
    }

    const alreadyLinked = await this.accountsService.isProfileManagedByShadchan(
      {
        profileId: profile.profileId,
        addedByShadchanId: profile.addedByShadchanId,
        shadchanIds: profile.shadchanIds,
      },
      user.accountId,
    );
    if (alreadyLinked) {
      return {
        canSend: false,
        alreadyLinked: true,
        reason: 'הפרופיל כבר באחריותך',
        pendingRequest: null,
      };
    }

    const pendingRequest = await this.managementRequestModel.findOne({
      shadchanId: user.accountId,
      personAccountId: profile.ownerAccountId,
      status: 'pending',
    });

    if (pendingRequest) {
      return {
        canSend: false,
        alreadyLinked: false,
        reason: 'בקשת ניהול ממתינה כבר נשלחה',
        pendingRequest: await this.toEnrichedResponse(pendingRequest),
      };
    }

    return {
      canSend: true,
      alreadyLinked: false,
      reason: null,
      pendingRequest: null,
    };
  }

  async respond(
    user: AuthUserPayload,
    requestId: string,
    respondDto: RespondManagementRequestDto,
  ) {
    if (user.role !== 'person') {
      throw new ForbiddenException('רק משודך/ת יכול/ה להגיב לבקשת ניהול');
    }

    const request = await this.managementRequestModel.findOne({ requestId });
    if (!request) {
      throw new NotFoundException(`בקשת ניהול "${requestId}" לא נמצאה`);
    }
    if (request.personAccountId !== user.accountId) {
      throw new ForbiddenException('אין הרשאה להגיב לבקשה זו');
    }
    if (request.status !== 'pending') {
      throw new ConflictException('הבקשה כבר טופלה');
    }

    if (respondDto.response === 'approved') {
      await this.accountsService.addLinkedShadchan(
        request.personAccountId,
        request.shadchanId,
      );
      request.status = 'approved';
    } else {
      request.status = 'declined';
    }

    await request.save();
    return this.toEnrichedResponse(request);
  }

  private async toEnrichedResponse(request: ManagementRequestDocument) {
    let shadchan;
    try {
      const account = await this.accountsService.findOne(request.shadchanId);
      if (account.role === 'shadchan') {
        shadchan = {
          accountId: account.accountId,
          firstName: account.firstName ?? '',
          lastName: account.lastName ?? '',
          email: account.email,
          phone: account.phone ?? null,
        };
      }
    } catch {
      shadchan = undefined;
    }

    return {
      requestId: request.requestId,
      shadchanId: request.shadchanId,
      personAccountId: request.personAccountId,
      personProfileId: request.personProfileId,
      message: request.message,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      shadchan,
    };
  }
}
