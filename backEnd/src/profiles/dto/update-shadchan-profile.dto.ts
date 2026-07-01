import { OmitType } from '@nestjs/mapped-types';
import { CreateShadchanProfileDto } from './create-shadchan-profile.dto';

export class UpdateShadchanProfileDto extends OmitType(CreateShadchanProfileDto, [
  'addedByShadchanId',
] as const) {}
