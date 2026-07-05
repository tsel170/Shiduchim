import {
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
  CreateSuggestionDto,
  UpdateSuggestionDto,
} from './dto/suggestion.dto';
import { Suggestion, SuggestionDocument } from './schemas/suggestion.schema';

@Injectable()
export class SuggestionsService {
  constructor(
    @InjectModel(Suggestion.name)
    private readonly suggestionModel: Model<SuggestionDocument>,
    private readonly profilesService: ProfilesService,
    private readonly accountsService: AccountsService,
  ) {}

  async create(user: AuthUserPayload, createSuggestionDto: CreateSuggestionDto) {
    if (user.role !== 'shadchan') {
      throw new ForbiddenException('רק שדכן/ית יכול/ה לשלוח הצעות דרך האתר');
    }

    const owner = await this.accountsService.findOne(createSuggestionDto.ownerAccountId);
    if (owner.role !== 'person') {
      throw new ForbiddenException('ניתן לשלוח הצעות רק למשודך/ת');
    }

    const profile = await this.profilesService.findOne(createSuggestionDto.profileId);

    const existing = await this.suggestionModel.findOne({
      ownerAccountId: createSuggestionDto.ownerAccountId,
      profileId: createSuggestionDto.profileId,
    });
    if (existing) {
      existing.shadchanId = user.accountId;
      existing.shadchanNote = createSuggestionDto.shadchanNote;
      existing.sentAt = new Date();
      existing.stage = createSuggestionDto.stage ?? 'new';
      if (createSuggestionDto.checkStatus) {
        existing.checkStatus = createSuggestionDto.checkStatus;
      } else {
        delete existing.checkStatus;
      }
      existing.personResponse = null;
      existing.personRespondedAt = null;
      await existing.save();
      return this.toResponse(existing, profile);
    }

    const suggestion = await this.suggestionModel.create({
      suggestionId: generateId(),
      ownerAccountId: createSuggestionDto.ownerAccountId,
      profileId: createSuggestionDto.profileId,
      shadchanId: user.accountId,
      shadchanNote: createSuggestionDto.shadchanNote,
      sentAt: new Date(),
      stage: createSuggestionDto.stage ?? 'new',
      checkStatus: createSuggestionDto.checkStatus,
    });

    return this.toResponse(suggestion, profile);
  }

  async findForOwner(ownerAccountId: string, stage?: string) {
    const query: Record<string, string> = { ownerAccountId };
    if (stage) query.stage = stage;

    const suggestions = await this.suggestionModel
      .find(query)
      .sort({ sentAt: -1 });

    const profileIds = [...new Set(suggestions.map((s) => s.profileId))];
    const profiles = await Promise.all(
      profileIds.map(async (profileId) => {
        try {
          return await this.profilesService.findOne(profileId);
        } catch {
          return null;
        }
      }),
    );
    const profilesById = Object.fromEntries(
      profiles
        .filter((profile): profile is NonNullable<typeof profile> => profile !== null)
        .map((profile) => [profile.profileId, profile]),
    );

    return suggestions.map((suggestion) =>
      this.toResponse(suggestion, profilesById[suggestion.profileId] ?? null),
    );
  }

  async findOne(suggestionId: string, ownerAccountId: string) {
    const suggestion = await this.suggestionModel.findOne({
      suggestionId,
      ownerAccountId,
    });
    if (!suggestion) {
      throw new NotFoundException(`ההצעה "${suggestionId}" לא נמצאה`);
    }

    let profile = null;
    try {
      profile = await this.profilesService.findOne(suggestion.profileId);
    } catch {
      profile = null;
    }

    return this.toResponse(suggestion, profile);
  }

  async update(
    suggestionId: string,
    ownerAccountId: string,
    updateSuggestionDto: UpdateSuggestionDto,
  ) {
    const suggestion = await this.suggestionModel.findOneAndUpdate(
      { suggestionId, ownerAccountId },
      { $set: updateSuggestionDto },
      { new: true, runValidators: true },
    );
    if (!suggestion) {
      throw new NotFoundException(`ההצעה "${suggestionId}" לא נמצאה`);
    }

    let profile = null;
    try {
      profile = await this.profilesService.findOne(suggestion.profileId);
    } catch {
      profile = null;
    }

    return this.toResponse(suggestion, profile);
  }

  async remove(suggestionId: string, ownerAccountId: string) {
    const result = await this.suggestionModel.deleteOne({
      suggestionId,
      ownerAccountId,
    });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`ההצעה "${suggestionId}" לא נמצאה`);
    }
  }

  async isSuggestedProfile(ownerAccountId: string, profileId: string) {
    const suggestion = await this.suggestionModel.findOne({ ownerAccountId, profileId });
    return Boolean(suggestion);
  }

  async getProfileSuggestionContext(ownerAccountId: string, profileId: string) {
    const suggestion = await this.suggestionModel.findOne({ ownerAccountId, profileId });
    if (!suggestion) {
      return { suggested: false as const };
    }

    let profile = null;
    try {
      profile = await this.profilesService.findOne(suggestion.profileId);
    } catch {
      profile = null;
    }

    return {
      suggested: true as const,
      suggestion: this.toResponse(suggestion, profile),
    };
  }

  async respondToProfile(
    user: AuthUserPayload,
    profileId: string,
    response: 'interested' | 'not_interested',
  ) {
    if (user.role !== 'person') {
      throw new ForbiddenException('רק משודך/ת יכול/ה לעדכן הצעה מהשדכן');
    }

    const suggestion = await this.suggestionModel.findOne({
      ownerAccountId: user.accountId,
      profileId,
    });
    if (!suggestion) {
      throw new NotFoundException('לא נמצאה הצעה מהשדכן עבור פרופיל זה');
    }

    suggestion.personResponse = response;
    suggestion.personRespondedAt = new Date();

    if (response === 'interested') {
      suggestion.stage = 'in_check';
      suggestion.checkStatus = 'sending_profile';
    } else {
      suggestion.stage = 'checked';
      suggestion.checkStatus = 'denied';
    }

    await suggestion.save();

    let profile = null;
    try {
      profile = await this.profilesService.findOne(suggestion.profileId);
    } catch {
      profile = null;
    }

    return this.toResponse(suggestion, profile);
  }

  async findResponsesForShadchan(shadchanAccountId: string) {
    const suggestions = await this.suggestionModel
      .find({
        shadchanId: shadchanAccountId,
        personResponse: { $ne: null },
      })
      .sort({ personRespondedAt: -1 });

    const ownerIds = [...new Set(suggestions.map((s) => s.ownerAccountId))];
    const owners = await Promise.all(
      ownerIds.map((id) => this.accountsService.findOne(id).catch(() => null)),
    );
    const ownersById = Object.fromEntries(
      owners.filter(Boolean).map((owner) => [owner!.accountId, owner]),
    );

    const profileIds = [...new Set(suggestions.map((s) => s.profileId))];
    const profiles = await Promise.all(
      profileIds.map(async (id) => {
        try {
          return await this.profilesService.findOne(id);
        } catch {
          return null;
        }
      }),
    );
    const profilesById = Object.fromEntries(
      profiles.filter(Boolean).map((p) => [p!.profileId, p]),
    );

    return Promise.all(
      suggestions.map(async (suggestion) => {
        const owner = ownersById[suggestion.ownerAccountId];
        const profile = profilesById[suggestion.profileId] ?? null;
        const ownerName = owner
          ? await this.accountsService.getPersonDisplayName(owner)
          : 'משודך/ת';

        return {
          ...this.toResponse(suggestion, profile),
          ownerName,
        };
      }),
    );
  }

  private toResponse(
    suggestion: SuggestionDocument,
    profile: Awaited<ReturnType<ProfilesService['findOne']>> | null = null,
  ) {
    return {
      suggestionId: suggestion.suggestionId,
      profileId: suggestion.profileId,
      shadchanId: suggestion.shadchanId,
      shadchanNote: suggestion.shadchanNote,
      sentAt: suggestion.sentAt,
      stage: suggestion.stage,
      checkStatus: suggestion.checkStatus,
      personResponse: suggestion.personResponse ?? null,
      personRespondedAt: suggestion.personRespondedAt ?? null,
      ...(profile ? { profile } : {}),
    };
  }
}
