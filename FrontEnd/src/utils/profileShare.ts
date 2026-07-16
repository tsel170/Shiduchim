import {
  getCityLabel,
  getGenderLabel,
  getMaritalStatusLabel,
  getReligiousStreamLabel,
} from '../constants/profileOptions';
import {
  DEFAULT_PROFILE_SHARE_SETTINGS,
  loadSavedSharePrefixes,
} from '../constants/profileShareOptions';
import { FullProfile } from '../types/profile';
import {
  ProfileShareField,
  ProfileShareSettings,
  ShareContentSegment,
} from '../types/profileShare';
import { formatHeightAll } from './height';
import { getFullName } from './profileHelpers';
import {
  getOrderedVisibleShareFields,
  isShareFieldVisible,
  normalizeProfileShareSettings,
} from './profileShareHelpers';

function getShareFieldLine(profile: FullProfile, field: ProfileShareField): string | null {
  switch (field) {
    case 'age':
      return `גיל: ${profile.age}`;
    case 'city':
      return `עיר: ${getCityLabel(profile.city)}`;
    case 'height':
      return `גובה: ${formatHeightAll(profile.heightCm)}`;
    case 'gender':
      return profile.gender ? `מין: ${getGenderLabel(profile.gender)}` : null;
    case 'maritalStatus':
      return `מצב משפחתי: ${getMaritalStatusLabel(profile.maritalStatus)}`;
    case 'religiousStream':
      return `זרם דתי: ${getReligiousStreamLabel(profile.religiousStream)}`;
    case 'personalityTraits':
      return profile.personalityTraits.length > 0
        ? `תכונות אישיות: ${profile.personalityTraits.join(', ')}`
        : null;
    case 'hobbies':
      return profile.hobbies.length > 0 ? `תחביבים: ${profile.hobbies.join(', ')}` : null;
    case 'familyVision':
      return profile.familyVision.trim()
        ? `חזון בית ומשפחה: ${profile.familyVision.trim()}`
        : null;
    case 'lookingFor':
      return profile.lookingFor.length > 0 ? `מחפש/ת: ${profile.lookingFor.join(', ')}` : null;
    case 'additionalInfo':
      return profile.additionalInfo.trim()
        ? `מידע נוסף: ${profile.additionalInfo.trim()}`
        : null;
    case 'photo':
      return null;
    default:
      return null;
  }
}

function categorySeparator(settings: ProfileShareSettings): string {
  return '\n'.repeat(settings.linesBetweenCategories + 1);
}

export function buildShareSegments(
  profile: FullProfile,
  settings: ProfileShareSettings
): ShareContentSegment[] {
  const normalized = normalizeProfileShareSettings(settings);
  const segments: ShareContentSegment[] = [];

  if (normalized.topPrefix.trim()) {
    segments.push({ type: 'text', text: normalized.topPrefix.trim(), role: 'prefix' });
  }

  for (const field of getOrderedVisibleShareFields(normalized)) {
    if (field === 'name') {
      segments.push({ type: 'text', text: getFullName(profile), role: 'name' });
      continue;
    }

    if (field === 'photo') {
      const url = profile.photos[0];
      if (url) segments.push({ type: 'image', url });
      continue;
    }

    const line = getShareFieldLine(profile, field);
    if (line) segments.push({ type: 'text', text: line, role: 'field' });
  }

  if (normalized.bottomPrefix.trim()) {
    segments.push({ type: 'text', text: normalized.bottomPrefix.trim(), role: 'suffix' });
  }

  return segments;
}

function isShareCategorySegment(segment: ShareContentSegment): boolean {
  return segment.type === 'text' && (segment.role === 'name' || segment.role === 'field');
}

export function buildProfileShareText(profile: FullProfile, settings: ProfileShareSettings): string {
  const normalized = normalizeProfileShareSettings(settings);
  const segments = buildShareSegments(profile, normalized);
  const separator = categorySeparator(normalized);
  const blocks: string[] = [];
  const categoryParts: string[] = [];

  const flushCategories = () => {
    if (categoryParts.length === 0) return;
    blocks.push(categoryParts.join(separator));
    categoryParts.length = 0;
  };

  for (const segment of segments) {
    if (segment.type === 'image') continue;

    if (segment.role === 'prefix' || segment.role === 'suffix') {
      flushCategories();
      blocks.push(segment.text);
      continue;
    }

    categoryParts.push(segment.text);
  }

  flushCategories();
  return blocks.join('\n');
}

export function getSharePhotoUrl(profile: FullProfile, settings: ProfileShareSettings): string | null {
  const normalized = normalizeProfileShareSettings(settings);
  if (!isShareFieldVisible(normalized, 'photo')) return null;
  return profile.photos[0] ?? null;
}

export function createDefaultProfileShareSettings(): ProfileShareSettings {
  const saved = loadSavedSharePrefixes();
  return normalizeProfileShareSettings({
    visibleFields: { ...DEFAULT_PROFILE_SHARE_SETTINGS.visibleFields },
    fieldOrder: [...DEFAULT_PROFILE_SHARE_SETTINGS.fieldOrder],
    linesBetweenCategories: DEFAULT_PROFILE_SHARE_SETTINGS.linesBetweenCategories,
    topPrefix: saved.topPrefix,
    bottomPrefix: saved.bottomPrefix,
  });
}

const COMPOSITE_WIDTH = 640;
const COMPOSITE_PADDING = 24;
const COMPOSITE_PHOTO_MAX_HEIGHT = 280;
const COMPOSITE_LINE_HEIGHT = 22;
const COMPOSITE_FONT = '16px Arial, sans-serif';

function loadImageElement(imageUrl: string, crossOrigin = true): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    if (crossOrigin) {
      image.crossOrigin = 'anonymous';
    }
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = imageUrl;
  });
}

function imageElementToPngBlob(image: HTMLImageElement): Promise<Blob | null> {
  const width = image.naturalWidth || 400;
  const height = image.naturalHeight || 400;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);

  ctx.drawImage(image, 0, 0, width, height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

async function loadPhotoPngBlob(photoUrl: string): Promise<Blob | null> {
  const directImage = await loadImageElement(photoUrl);
  if (directImage) {
    return imageElementToPngBlob(directImage);
  }

  try {
    const response = await fetch(photoUrl);
    if (!response.ok) return null;

    const fetchedBlob = await response.blob();
    const objectUrl = URL.createObjectURL(fetchedBlob);
    try {
      const blobImage = await loadImageElement(objectUrl, false);
      if (blobImage) {
        return imageElementToPngBlob(blobImage);
      }
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    // ignore
  }

  return null;
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];

  for (const paragraph of text.split('\n')) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }

    const words = paragraph.split(' ');
    let current = '';

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }

    if (current) lines.push(current);
  }

  return lines;
}

function extraCategoryGap(settings: ProfileShareSettings): number {
  return settings.linesBetweenCategories * COMPOSITE_LINE_HEIGHT;
}

async function buildCompositeShareImageBlob(
  profile: FullProfile,
  settings: ProfileShareSettings
): Promise<Blob | null> {
  const normalized = normalizeProfileShareSettings(settings);
  const segments = buildShareSegments(profile, normalized);
  const textAreaWidth = COMPOSITE_WIDTH - COMPOSITE_PADDING * 2;
  const categoryGap = extraCategoryGap(normalized);

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  if (!measureCtx) return null;
  measureCtx.font = COMPOSITE_FONT;

  const imageElements = new Map<string, HTMLImageElement>();
  for (const segment of segments) {
    if (segment.type !== 'image') continue;
    const image = await loadImageElement(segment.url);
    if (image) imageElements.set(segment.url, image);
  }

  let totalHeight = COMPOSITE_PADDING;
  let previousWasCategory = false;

  for (const segment of segments) {
    if (segment.type === 'image') {
      const image = imageElements.get(segment.url);
      if (!image) continue;
      const scale = Math.min(
        1,
        textAreaWidth / image.naturalWidth,
        COMPOSITE_PHOTO_MAX_HEIGHT / image.naturalHeight
      );
      totalHeight += image.naturalHeight * scale + COMPOSITE_PADDING;
      previousWasCategory = false;
      continue;
    }

    if (isShareCategorySegment(segment) && previousWasCategory) {
      totalHeight += categoryGap;
    }

    const lines = wrapCanvasText(measureCtx, segment.text, textAreaWidth);
    totalHeight += lines.length * COMPOSITE_LINE_HEIGHT;
    previousWasCategory = isShareCategorySegment(segment);
  }

  totalHeight += COMPOSITE_PADDING;

  const canvas = document.createElement('canvas');
  canvas.width = COMPOSITE_WIDTH;
  canvas.height = totalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, COMPOSITE_WIDTH, totalHeight);

  let y = COMPOSITE_PADDING;
  previousWasCategory = false;

  for (const segment of segments) {
    if (segment.type === 'image') {
      const image = imageElements.get(segment.url);
      if (!image) continue;

      const scale = Math.min(
        1,
        textAreaWidth / image.naturalWidth,
        COMPOSITE_PHOTO_MAX_HEIGHT / image.naturalHeight
      );
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const x = COMPOSITE_WIDTH - COMPOSITE_PADDING - drawWidth;
      ctx.drawImage(image, x, y, drawWidth, drawHeight);
      y += drawHeight + COMPOSITE_PADDING;
      previousWasCategory = false;
      continue;
    }

    if (isShareCategorySegment(segment) && previousWasCategory) {
      y += categoryGap;
    }

    ctx.fillStyle = '#111111';
    ctx.direction = 'rtl';
    ctx.textAlign = 'right';
    ctx.font = segment.role === 'name' ? `bold ${COMPOSITE_FONT}` : COMPOSITE_FONT;

    const lines = wrapCanvasText(ctx, segment.text, textAreaWidth);
    const textX = COMPOSITE_WIDTH - COMPOSITE_PADDING;
    for (const line of lines) {
      ctx.fillText(line, textX, y + COMPOSITE_LINE_HEIGHT * 0.8);
      y += COMPOSITE_LINE_HEIGHT;
    }

    previousWasCategory = isShareCategorySegment(segment);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

async function copyPngToClipboard(pngBlob: Blob): Promise<boolean> {
  if (!navigator.clipboard?.write) return false;

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': pngBlob,
      }),
    ]);
    return true;
  } catch {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': Promise.resolve(pngBlob),
        }),
      ]);
      return true;
    } catch {
      return false;
    }
  }
}

export async function copyProfileShareText(
  profile: FullProfile,
  settings: ProfileShareSettings
): Promise<boolean> {
  const text = buildProfileShareText(profile, settings);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function copyProfileSharePhoto(
  profile: FullProfile,
  settings: ProfileShareSettings
): Promise<boolean> {
  const photoUrl = getSharePhotoUrl(profile, settings);
  if (!photoUrl) return false;

  const pngBlob = await loadPhotoPngBlob(photoUrl);
  if (!pngBlob) return false;

  return copyPngToClipboard(pngBlob);
}

export async function copyProfileShareAsImage(
  profile: FullProfile,
  settings: ProfileShareSettings
): Promise<boolean> {
  const compositeBlob = await buildCompositeShareImageBlob(profile, settings);
  if (!compositeBlob) return false;
  return copyPngToClipboard(compositeBlob);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPrintableHtml(profile: FullProfile, settings: ProfileShareSettings): string {
  const normalized = normalizeProfileShareSettings(settings);
  const segments = buildShareSegments(profile, normalized);
  const gapPx = normalized.linesBetweenCategories * 16;
  let previousWasCategory = false;

  const bodyParts = segments.map((segment) => {
    if (segment.type === 'image') {
      previousWasCategory = false;
      return `<img src="${segment.url}" alt="" style="max-width:280px;width:100%;border-radius:12px;margin:12px 0;" />`;
    }

    const marginTop =
      isShareCategorySegment(segment) && previousWasCategory ? `margin-top:${gapPx}px;` : 'margin-top:0;';
    previousWasCategory = isShareCategorySegment(segment);
    const fontWeight = segment.role === 'name' ? 'font-weight:700;' : '';

    return `<p style="${marginTop}margin-bottom:0;line-height:1.55;${fontWeight}">${escapeHtml(segment.text).replace(/\n/g, '<br/>')}</p>`;
  });

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${getFullName(profile)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  ${bodyParts.join('\n')}
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;
}

export function downloadProfileSharePdf(profile: FullProfile, settings: ProfileShareSettings): void {
  const html = buildPrintableHtml(profile, settings);
  const popup = window.open('', '_blank');
  if (!popup) {
    window.alert('לא ניתן לפתוח חלון הדפסה. בדוק/י חוסם חלונות קופצים.');
    return;
  }
  popup.document.write(html);
  popup.document.close();
}

export async function shareProfilePdf(
  profile: FullProfile,
  settings: ProfileShareSettings
): Promise<boolean> {
  const text = buildProfileShareText(profile, settings);
  const title = `פרופיל: ${getFullName(profile)}`;

  if (navigator.share) {
    const compositeBlob = await buildCompositeShareImageBlob(profile, settings);
    if (compositeBlob) {
      const file = new File([compositeBlob], `${profile.firstName}-${profile.lastName}.png`, {
        type: 'image/png',
      });
      const payload: ShareData = { title, text, files: [file] };
      if (!navigator.canShare || navigator.canShare(payload)) {
        try {
          await navigator.share(payload);
          return true;
        } catch {
          // fall through
        }
      }
    }

    try {
      await navigator.share({ title, text });
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
