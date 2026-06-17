import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateId } from '../common/utils/generate-id';
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
  ) {}

  async create(shadchanId: string, createSuggestionDto: CreateSuggestionDto) {
    const existing = await this.suggestionModel.findOne({
      ownerAccountId: createSuggestionDto.ownerAccountId,
      profileId: createSuggestionDto.profileId,
    });
    if (existing) {
      throw new ConflictException('Suggestion already exists for this profile');
    }

    const suggestion = await this.suggestionModel.create({
      suggestionId: generateId(),
      ownerAccountId: createSuggestionDto.ownerAccountId,
      profileId: createSuggestionDto.profileId,
      shadchanId,
      shadchanNote: createSuggestionDto.shadchanNote,
      sentAt: new Date(),
      stage: createSuggestionDto.stage ?? 'new',
      checkStatus: createSuggestionDto.checkStatus,
    });

    return this.toResponse(suggestion);
  }

  async findForOwner(ownerAccountId: string, stage?: string) {
    const query: Record<string, string> = { ownerAccountId };
    if (stage) query.stage = stage;

    const suggestions = await this.suggestionModel
      .find(query)
      .sort({ sentAt: -1 });
    return suggestions.map((s) => this.toResponse(s));
  }

  async findOne(suggestionId: string, ownerAccountId: string) {
    const suggestion = await this.suggestionModel.findOne({
      suggestionId,
      ownerAccountId,
    });
    if (!suggestion) {
      throw new NotFoundException(`Suggestion "${suggestionId}" not found`);
    }
    return this.toResponse(suggestion);
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
      throw new NotFoundException(`Suggestion "${suggestionId}" not found`);
    }
    return this.toResponse(suggestion);
  }

  async remove(suggestionId: string, ownerAccountId: string) {
    const result = await this.suggestionModel.deleteOne({
      suggestionId,
      ownerAccountId,
    });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Suggestion "${suggestionId}" not found`);
    }
  }

  private toResponse(suggestion: SuggestionDocument) {
    return {
      suggestionId: suggestion.suggestionId,
      profileId: suggestion.profileId,
      shadchanId: suggestion.shadchanId,
      shadchanNote: suggestion.shadchanNote,
      sentAt: suggestion.sentAt,
      stage: suggestion.stage,
      checkStatus: suggestion.checkStatus,
    };
  }
}
