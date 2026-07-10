import {
  CITIES,
  GENDER_OPTIONS,
  HOBBY_OPTIONS,
  LOOKING_FOR_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PERSONALITY_TRAIT_OPTIONS,
  RELIGIOUS_STREAMS,
} from '../constants/profileOptions';

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type FieldInputType = 'text' | 'select' | 'multiselect' | 'number';

export interface FieldOption {
  id: string;
  label: string;
}

export interface ExtractedField {
  key: string;
  label: string;
  inputType: FieldInputType;
  value: string;
  values?: string[];
  options?: FieldOption[];
  confidence: number;
  sourceSnippet?: string;
  unmatchedRaw?: string;
}

export interface AiExtractionResult {
  fields: ExtractedField[];
  rawText: string;
}

export type AiImportDraft = Record<string, string | string[] | number>;

const RELIGIOUS_STREAM_ALIASES: Array<{ pattern: RegExp; id: string }> = [
  { pattern: /חרדי\s*מודרני|חרדית\s*מודרנית/i, id: 'modern-haredi' },
  { pattern: /חרדי\s*ספרדי|חרדית\s*ספרדית/i, id: 'sephardi-haredi' },
  { pattern: /דתי\s*לאומי|דתיה\s*לאומית/i, id: 'dati-leumi' },
  { pattern: /מסורתי|מסורתית/i, id: 'traditional' },
  { pattern: /חרדי|חרדית/i, id: 'haredi' },
];

const MARITAL_ALIASES: Array<{ pattern: RegExp; id: string }> = [
  { pattern: /רווק|רווקה/i, id: 'single' },
  { pattern: /גרוש|גרושה/i, id: 'divorced' },
  { pattern: /אלמן|אלמנה/i, id: 'widowed' },
];

function normalizeSpaces(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function matchCityId(raw: string): { id: string | null; snippet: string } {
  const text = normalizeSpaces(raw);
  const exact = CITIES.find((c) => c.label === text);
  if (exact) return { id: exact.id, snippet: text };

  const contains = CITIES.find((c) => text.includes(c.label) || c.label.includes(text));
  if (contains) return { id: contains.id, snippet: text };

  return { id: null, snippet: text };
}

function matchReligiousStreamId(text: string): { id: string | null; snippet: string } {
  for (const { pattern, id } of RELIGIOUS_STREAM_ALIASES) {
    const match = text.match(pattern);
    if (match) return { id, snippet: match[0] };
  }
  return { id: null, snippet: '' };
}

function matchMaritalStatusId(text: string): { id: string | null; snippet: string } {
  for (const { pattern, id } of MARITAL_ALIASES) {
    const match = text.match(pattern);
    if (match) return { id, snippet: match[0] };
  }
  return { id: null, snippet: '' };
}

function matchGender(text: string): { id: 'male' | 'female' | null; snippet: string; confidence: number } {
  if (/בת\s*\d|בת\s+\d|נקבה|אישה/i.test(text)) {
    return { id: 'female', snippet: 'נקבה', confidence: 0.86 };
  }
  if (/בן\s*\d|בן\s+\d|זכר|גבר/i.test(text)) {
    return { id: 'male', snippet: 'זכר', confidence: 0.86 };
  }
  return { id: null, snippet: '', confidence: 0 };
}

function heightToCm(match: string): string {
  if (/^\d{3}$/.test(match)) return match;
  const meters = parseFloat(match);
  if (!Number.isNaN(meters)) return String(Math.round(meters * 100));
  return match;
}

function traitMatches(text: string, option: string): boolean {
  if (text.includes(option)) return true;
  const slash = option.indexOf('/');
  if (slash > 0) {
    const male = option.slice(0, slash);
    const female = option.slice(slash + 1);
    if (text.includes(male) || text.includes(female)) return true;
  }
  return false;
}

function extractMultiSelect(
  text: string,
  options: readonly string[],
  key: string,
  label: string
): ExtractedField | null {
  const matched = options.filter((opt) => traitMatches(text, opt));
  if (matched.length === 0) return null;

  return {
    key,
    label,
    inputType: 'multiselect',
    value: '',
    values: [...matched],
    options: options.map((opt) => ({ id: opt, label: opt })),
    confidence: Math.min(0.92, 0.65 + matched.length * 0.08),
    sourceSnippet: matched.join(', '),
  };
}

function pushSelectField(
  fields: ExtractedField[],
  usedKeys: Set<string>,
  params: {
    key: string;
    label: string;
    id: string | null;
    options: FieldOption[];
    confidence: number;
    sourceSnippet: string;
    unmatchedRaw?: string;
  }
) {
  if (usedKeys.has(params.key)) return;
  usedKeys.add(params.key);

  fields.push({
    key: params.key,
    label: params.label,
    inputType: 'select',
    value: params.id ?? '',
    options: params.options,
    confidence: params.id ? params.confidence : Math.max(0.45, params.confidence - 0.25),
    sourceSnippet: params.sourceSnippet,
    unmatchedRaw: params.id ? undefined : params.unmatchedRaw,
  });
}

export function extractProfileFromText(rawText: string): AiExtractionResult {
  const text = rawText.trim();
  const fields: ExtractedField[] = [];
  const usedKeys = new Set<string>();

  const firstNameMatch = text.match(/שם[:\s]+([א-ת]{2,12})/i) ?? text.match(/^([א-ת]{2,10})\s+[א-ת]/m);
  if (firstNameMatch?.[1] && !usedKeys.has('firstName')) {
    usedKeys.add('firstName');
    fields.push({
      key: 'firstName',
      label: 'שם פרטי',
      inputType: 'text',
      value: firstNameMatch[1].trim(),
      confidence: 0.88,
      sourceSnippet: firstNameMatch[0].slice(0, 80),
    });
  }

  const lastNameMatch = text.match(/משפחה[:\s]+([א-ת]{2,14})/i) ?? text.match(/שם משפחה[:\s]+([א-ת]{2,14})/i);
  if (lastNameMatch?.[1] && !usedKeys.has('lastName')) {
    usedKeys.add('lastName');
    fields.push({
      key: 'lastName',
      label: 'שם משפחה',
      inputType: 'text',
      value: lastNameMatch[1].trim(),
      confidence: 0.82,
      sourceSnippet: lastNameMatch[0].slice(0, 80),
    });
  }

  const ageMatch = text.match(/גיל[:\s]+(\d{2})/i) ?? text.match(/בן[:\s]*(\d{2})/i) ?? text.match(/בת[:\s]*(\d{2})/i);
  if (ageMatch?.[1] && !usedKeys.has('age')) {
    usedKeys.add('age');
    fields.push({
      key: 'age',
      label: 'גיל',
      inputType: 'number',
      value: ageMatch[1],
      confidence: 0.92,
      sourceSnippet: ageMatch[0].slice(0, 80),
    });
  }

  const cityRaw =
    text.match(/עיר[:\s]+([א-ת\s-]{2,24})/i)?.[1] ??
    text.match(/גר[ה]?\s+ב([א-ת\s-]{2,24})/i)?.[1];
  if (cityRaw) {
    const { id, snippet } = matchCityId(cityRaw);
    pushSelectField(fields, usedKeys, {
      key: 'city',
      label: 'עיר',
      id,
      options: CITIES.map((c) => ({ id: c.id, label: c.label })),
      confidence: 0.85,
      sourceSnippet: snippet,
      unmatchedRaw: id ? undefined : normalizeSpaces(cityRaw),
    });
  }

  const heightMatch = text.match(/גובה[:\s]+(\d{3})/i) ?? text.match(/(\d\.\d{2})\s*מ/i);
  if (heightMatch?.[1] && !usedKeys.has('heightCm')) {
    usedKeys.add('heightCm');
    fields.push({
      key: 'heightCm',
      label: 'גובה (ס"מ)',
      inputType: 'number',
      value: heightToCm(heightMatch[1]),
      confidence: 0.78,
      sourceSnippet: heightMatch[0].slice(0, 80),
    });
  }

  const stream = matchReligiousStreamId(text);
  if (stream.snippet || text.match(/זרם|דתי|חרדי|מסורת/i)) {
    pushSelectField(fields, usedKeys, {
      key: 'religiousStream',
      label: 'זרם דתי',
      id: stream.id,
      options: RELIGIOUS_STREAMS.map((s) => ({ id: s.id, label: s.label })),
      confidence: 0.8,
      sourceSnippet: stream.snippet || 'זרם דתי',
      unmatchedRaw: stream.id ? undefined : stream.snippet,
    });
  }

  const marital = matchMaritalStatusId(text);
  if (marital.snippet || text.match(/מצב משפחתי|רווק|גרוש|אלמן/i)) {
    pushSelectField(fields, usedKeys, {
      key: 'maritalStatus',
      label: 'מצב משפחתי',
      id: marital.id,
      options: MARITAL_STATUS_OPTIONS.map((o) => ({ id: o.value, label: o.label })),
      confidence: 0.9,
      sourceSnippet: marital.snippet || 'מצב משפחתי',
      unmatchedRaw: marital.id ? undefined : marital.snippet,
    });
  }

  const gender = matchGender(text);
  if (gender.id) {
    pushSelectField(fields, usedKeys, {
      key: 'gender',
      label: 'מין',
      id: gender.id,
      options: GENDER_OPTIONS.map((o) => ({ id: o.value, label: o.label })),
      confidence: gender.confidence,
      sourceSnippet: gender.snippet,
    });
  }

  const familyVisionMatch = text.match(/(?:חזון|משפחה)[:\s]+(.{15,300})/is);
  if (familyVisionMatch?.[1] && !usedKeys.has('familyVision')) {
    usedKeys.add('familyVision');
    fields.push({
      key: 'familyVision',
      label: 'חזון בית ומשפחה',
      inputType: 'text',
      value: familyVisionMatch[1].trim(),
      confidence: 0.68,
      sourceSnippet: familyVisionMatch[0].slice(0, 80),
    });
  }

  for (const multi of [
    extractMultiSelect(text, PERSONALITY_TRAIT_OPTIONS, 'personalityTraits', 'תכונות אישיות'),
    extractMultiSelect(text, HOBBY_OPTIONS, 'hobbies', 'תחביבים'),
    extractMultiSelect(text, LOOKING_FOR_OPTIONS, 'lookingFor', 'מחפש/ת'),
  ]) {
    if (multi && !usedKeys.has(multi.key)) {
      usedKeys.add(multi.key);
      fields.push(multi);
    }
  }

  return { fields, rawText: text };
}

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.85) return 'high';
  if (confidence >= 0.72) return 'medium';
  return 'low';
}

export function getConfidenceLabel(level: ConfidenceLevel): string {
  if (level === 'high') return 'ביטחון גבוה';
  if (level === 'medium') return 'ביטחון בינוני';
  return 'ביטחון נמוך';
}

export const AI_IMPORT_STORAGE_KEY = 'shiduchim_ai_import_draft';

export function saveAiImportDraft(fields: ExtractedField[]): void {
  const draft: AiImportDraft = {};
  for (const field of fields) {
    if (field.inputType === 'multiselect' && field.values) {
      draft[field.key] = field.values;
    } else if (field.inputType === 'number') {
      const num = Number(field.value);
      if (!Number.isNaN(num)) draft[field.key] = num;
    } else if (field.value) {
      draft[field.key] = field.value;
    }
  }
  sessionStorage.setItem(AI_IMPORT_STORAGE_KEY, JSON.stringify(draft));
}

export function loadAiImportDraft(): AiImportDraft | null {
  try {
    const raw = sessionStorage.getItem(AI_IMPORT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AiImportDraft;
  } catch {
    return null;
  }
}

export function clearAiImportDraft(): void {
  sessionStorage.removeItem(AI_IMPORT_STORAGE_KEY);
}

export function getOptionLabel(field: ExtractedField, optionId: string): string {
  return field.options?.find((o) => o.id === optionId)?.label ?? optionId;
}
