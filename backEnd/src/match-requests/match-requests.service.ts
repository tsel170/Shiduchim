import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountsService } from '../accounts/accounts.service';
import { generateId } from '../common/utils/generate-id';
import { AuthUserPayload } from '../auth/types/auth-user.payload';
import { ProfilesService } from '../profiles/profiles.service';
import {
  CreateMatchRequestDto,
  UpdateMatchRequestDto,
} from './dto/match-request.dto';
import {
  MatchRequest,
  MatchRequestDocument,
} from './schemas/match-request.schema';

@Injectable()
export class MatchRequestsService {
  constructor(
    @InjectModel(MatchRequest.name)
    private readonly matchRequestModel: Model<MatchRequestDocument>,
    private readonly profilesService: ProfilesService,
    private readonly accountsService: AccountsService,
  ) {}

  async create(user: AuthUserPayload, createMatchRequestDto: CreateMatchRequestDto) {
    const senderProfileId = createMatchRequestDto.senderProfileId?.trim() || undefined;

    if (user.role === 'person' && createMatchRequestDto.senderProfileId === '' && !user.profileId) {
      throw new BadRequestException(
        'נדרש פרופיל אישי כדי לצרף את הפרופיל שלך. צור/י את הפרופיל שלי ונסה שוב.',
      );
    }

    const shadchanId =
      createMatchRequestDto.shadchanId ??
      (user.role === 'shadchan'
        ? user.accountId
        : await this.accountsService.findDemoShadchanAccountId());

    if (user.role === 'person') {
      await this.assertPersonCanSendToShadchan(
        user,
        createMatchRequestDto.targetProfileId,
        shadchanId,
      );
    }

    const matchRequest = await this.matchRequestModel.create({
      requestId: generateId(),
      shadchanId,
      senderProfileId,
      targetProfileId: createMatchRequestDto.targetProfileId,
      notes: createMatchRequestDto.notes,
    });
    return this.toEnrichedResponse(matchRequest);
  }

  async findOutgoingForPerson(user: AuthUserPayload) {
    if (!user.profileId) {
      return [];
    }

    const matchRequests = await this.matchRequestModel
      .find({ senderProfileId: user.profileId })
      .sort({ createdAt: -1 });

    return Promise.all(
      matchRequests.map((matchRequest) => this.toEnrichedResponse(matchRequest)),
    );
  }

  async findAll(filters: { shadchanId: string }) {
    const matchRequests = await this.matchRequestModel
      .find({ shadchanId: filters.shadchanId })
      .sort({ createdAt: -1 });
    return Promise.all(
      matchRequests.map((matchRequest) => this.toEnrichedResponse(matchRequest)),
    );
  }

  async findOne(requestId: string, shadchanId: string) {
    const matchRequest = await this.matchRequestModel.findOne({
      requestId,
      shadchanId,
    });
    if (!matchRequest) {
      throw new NotFoundException(`הבקשה "${requestId}" לא נמצאה`);
    }
    return this.toEnrichedResponse(matchRequest);
  }

  async update(
    requestId: string,
    shadchanId: string,
    updateMatchRequestDto: UpdateMatchRequestDto,
  ) {
    const matchRequest = await this.matchRequestModel.findOneAndUpdate(
      { requestId, shadchanId },
      { $set: updateMatchRequestDto },
      { new: true, runValidators: true },
    );
    if (!matchRequest) {
      throw new NotFoundException(`הבקשה "${requestId}" לא נמצאה`);
    }
    return this.toEnrichedResponse(matchRequest);
  }

  async removeForUser(user: AuthUserPayload, requestId: string) {
    const matchRequest = await this.matchRequestModel.findOne({ requestId });
    if (!matchRequest) {
      throw new NotFoundException(`הבקשה "${requestId}" לא נמצאה`);
    }

    const isShadchanOwner =
      user.role === 'shadchan' && matchRequest.shadchanId === user.accountId;
    const isSender =
      user.role === 'person' && user.profileId === matchRequest.senderProfileId;

    if (!isShadchanOwner && !isSender) {
      throw new ForbiddenException('אין הרשאה לבטל בקשה זו');
    }

    await this.matchRequestModel.deleteOne({ requestId });
  }

  async remove(requestId: string, shadchanId: string) {
    const result = await this.matchRequestModel.deleteOne({ requestId, shadchanId });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`הבקשה "${requestId}" לא נמצאה`);
    }
  }

  private async assertPersonCanSendToShadchan(
    user: AuthUserPayload,
    _targetProfileId: string,
    shadchanId: string,
  ) {
    const shadchan = await this.accountsService.findOne(shadchanId);
    if (shadchan.role !== 'shadchan') {
      throw new NotFoundException('שדכן לא נמצא במערכת');
    }
  }

  private async toEnrichedResponse(matchRequest: MatchRequestDocument) {
    const [senderProfile, targetProfile] = await Promise.all([
      matchRequest.senderProfileId
        ? this.profilesService.findOne(matchRequest.senderProfileId)
        : Promise.resolve(null),
      this.profilesService.findOne(matchRequest.targetProfileId),
    ]);

    const targetOwnerAccountId = targetProfile
      ? await this.accountsService.findPersonAccountIdForProfile({
          profileId: targetProfile.profileId,
          ownerAccountId: targetProfile.ownerAccountId ?? null,
        })
      : null;

    return {
      requestId: matchRequest.requestId,
      senderProfileId: matchRequest.senderProfileId,
      targetProfileId: matchRequest.targetProfileId,
      shadchanId: matchRequest.shadchanId,
      notes: matchRequest.notes,
      createdAt: matchRequest.createdAt,
      updatedAt: matchRequest.updatedAt,
      senderProfile,
      targetProfile,
      targetOwnerAccountId,
    };
  }
}
