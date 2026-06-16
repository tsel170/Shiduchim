import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { generateId } from '../common/utils/generate-id';
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
  ) {}

  async create(createMatchRequestDto: CreateMatchRequestDto) {
    const matchRequest = await this.matchRequestModel.create({
      requestId: generateId(),
      ...createMatchRequestDto,
    });
    return this.toResponse(matchRequest);
  }

  async findAll(filters?: {
    shadchanId?: string;
    senderProfileId?: string;
    targetProfileId?: string;
  }) {
    const query: Record<string, string> = {};
    if (filters?.shadchanId) query.shadchanId = filters.shadchanId;
    if (filters?.senderProfileId) {
      query.senderProfileId = filters.senderProfileId;
    }
    if (filters?.targetProfileId) {
      query.targetProfileId = filters.targetProfileId;
    }

    const matchRequests = await this.matchRequestModel
      .find(query)
      .sort({ createdAt: -1 });
    return matchRequests.map((matchRequest) => this.toResponse(matchRequest));
  }

  async findOne(requestId: string) {
    const matchRequest = await this.matchRequestModel.findOne({ requestId });
    if (!matchRequest) {
      throw new NotFoundException(`Match request "${requestId}" not found`);
    }
    return this.toResponse(matchRequest);
  }

  async update(requestId: string, updateMatchRequestDto: UpdateMatchRequestDto) {
    const matchRequest = await this.matchRequestModel.findOneAndUpdate(
      { requestId },
      { $set: updateMatchRequestDto },
      { new: true, runValidators: true },
    );
    if (!matchRequest) {
      throw new NotFoundException(`Match request "${requestId}" not found`);
    }
    return this.toResponse(matchRequest);
  }

  async remove(requestId: string) {
    const result = await this.matchRequestModel.deleteOne({ requestId });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Match request "${requestId}" not found`);
    }
  }

  private toResponse(matchRequest: MatchRequestDocument) {
    return {
      requestId: matchRequest.requestId,
      senderProfileId: matchRequest.senderProfileId,
      targetProfileId: matchRequest.targetProfileId,
      shadchanId: matchRequest.shadchanId,
      notes: matchRequest.notes,
      createdAt: matchRequest.createdAt,
      updatedAt: matchRequest.updatedAt,
    };
  }
}
