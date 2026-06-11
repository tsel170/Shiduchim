import { DisplayField } from './profile';

export type ProfileShareExtraField = 'name' | 'age' | 'photo';

export type ProfileShareField = DisplayField | ProfileShareExtraField;

export type ShadchanShareTab = 'site' | 'other';

export type ShadchanShareMethod =
  | 'copy-as-image'
  | 'copy-text'
  | 'copy-image'
  | 'download-pdf'
  | 'share-pdf';

export interface ProfileShareSettings {
  visibleFields: Record<ProfileShareField, boolean>;
  fieldOrder: ProfileShareField[];
  linesBetweenCategories: number;
  topPrefix: string;
  bottomPrefix: string;
}

export type ShareContentSegment =
  | { type: 'text'; text: string; role: 'prefix' | 'name' | 'field' | 'suffix' }
  | { type: 'image'; url: string };
