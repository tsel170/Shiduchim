import React, { useMemo, useState } from 'react';
import { saveSharePrefixes } from '../../constants/profileShareOptions';
import { FullProfile } from '../../types/profile';
import {
  ProfileShareSettings,
  ShadchanShareMethod,
  ShadchanShareTab,
} from '../../types/profileShare';
import {
  buildShareSegments,
  copyProfileShareAsImage,
  copyProfileSharePhoto,
  copyProfileShareText,
  downloadProfileSharePdf,
  shareProfilePdf,
} from '../../utils/profileShare';
import { ProfileShareFieldsPanel } from './ProfileShareFieldsPanel';
import './ShadchanSharePanel.css';

interface ShadchanSharePanelProps {
  profile: FullProfile;
  initialTab: ShadchanShareTab;
  /** send = שדכן שולח למשודך/ת; export = שמירה מקומית (העתקה / PDF) */
  variant?: 'send' | 'export';
  settings: ProfileShareSettings;
  onSettingsChange: (next: ProfileShareSettings) => void;
  onClose: () => void;
  recipientAccountId?: string;
  onRecipientAccountIdChange?: (value: string) => void;
  onSiteSend?: (note: string) => Promise<void>;
  isSending?: boolean;
}

const OTHER_METHODS: ReadonlyArray<{ id: ShadchanShareMethod; label: string }> = [
  { id: 'copy-as-image', label: 'העתק כתמונה' },
  { id: 'copy-text', label: 'העתק טקסט' },
  { id: 'copy-image', label: 'העתק תמונה' },
  { id: 'download-pdf', label: 'הורד PDF' },
  { id: 'share-pdf', label: 'שתף PDF' },
];

export const ShadchanSharePanel: React.FC<ShadchanSharePanelProps> = ({
  profile,
  initialTab,
  variant = 'send',
  settings,
  onSettingsChange,
  onClose,
  recipientAccountId = '',
  onRecipientAccountIdChange,
  onSiteSend,
  isSending = false,
}) => {
  const isExport = variant === 'export';
  const [activeTab, setActiveTab] = useState<ShadchanShareTab>(isExport ? 'other' : initialTab);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [prefixSaved, setPrefixSaved] = useState(false);

  const segments = useMemo(() => buildShareSegments(profile, settings), [profile, settings]);

  const patchSettings = (patch: Partial<ProfileShareSettings>) => {
    onSettingsChange({ ...settings, ...patch });
    setPrefixSaved(false);
  };

  const handleSavePrefixes = () => {
    saveSharePrefixes(settings.topPrefix, settings.bottomPrefix);
    setPrefixSaved(true);
  };

  const handleSiteSend = async () => {
    if (!onSiteSend) return;
    const note = [settings.topPrefix, settings.bottomPrefix].filter(Boolean).join('\n\n').trim()
      || `המלצה: ${profile.firstName} ${profile.lastName}`;
    await onSiteSend(note);
  };

  const runOtherMethod = async (method: ShadchanShareMethod) => {
    switch (method) {
      case 'copy-as-image': {
        const ok = await copyProfileShareAsImage(profile, settings);
        setStatusMessage(
          ok
            ? 'הועתקה תמונה משולבת ללוח.'
            : 'לא הצלחנו להעתיק. ודא ש"תמונת פרופיל" מסומנת ובמיקום הרצוי.'
        );
        break;
      }
      case 'copy-text': {
        const ok = await copyProfileShareText(profile, settings);
        setStatusMessage(ok ? 'הטקסט הועתק ללוח.' : 'לא הצלחנו להעתיק את הטקסט.');
        break;
      }
      case 'copy-image': {
        const ok = await copyProfileSharePhoto(profile, settings);
        setStatusMessage(
          ok ? 'תמונת הפרופיל הועתקה ללוח.' : 'לא הצלחנו להעתיק. ודא ש"תמונת פרופיל" מסומנת.'
        );
        break;
      }
      case 'download-pdf':
        downloadProfileSharePdf(profile, settings);
        setStatusMessage('נפתח חלון להדפסה / שמירה כ-PDF.');
        break;
      case 'share-pdf': {
        const ok = await shareProfilePdf(profile, settings);
        setStatusMessage(
          ok
            ? 'נפתח תפריט השיתוף.'
            : 'שיתוף לא זמין בדפדפן זה. נסה "הורד PDF".'
        );
        break;
      }
    }
  };

  const isCategorySegment = (segment: (typeof segments)[number]) =>
    segment.type === 'text' && (segment.role === 'name' || segment.role === 'field');

  const previewGapBefore = (index: number): number => {
    if (index === 0) return 0;
    const segment = segments[index];
    const previous = segments[index - 1];
    if (isCategorySegment(segment) && isCategorySegment(previous)) {
      return settings.linesBetweenCategories;
    }
    return segment.type === 'image' || previous.type === 'image' ? 1 : 0;
  };

  return (
    <section className="shadchan-share-panel">
      <header className="shadchan-share-panel__header">
        <div>
          <h2 className="shadchan-share-panel__title">
            {isExport ? 'שמירת פרופיל' : 'שיתוף פרופיל'}
          </h2>
          <p className="shadchan-share-panel__subtitle">
            {isExport
              ? 'בחר שיטת שמירה, התאם שדות וצפה בתצוגה מקדימה'
              : 'בחר שיטת שליחה, התאם שדות וצפה בתצוגה מקדימה'}
          </p>
        </div>
        <button type="button" className="shadchan-share-panel__close" onClick={onClose} aria-label="סגור">
          ×
        </button>
      </header>

      {!isExport && (
        <div className="shadchan-share-panel__tabs" role="tablist" aria-label="שיטת שליחה">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'site'}
            className={`shadchan-share-panel__tab${activeTab === 'site' ? ' shadchan-share-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('site')}
          >
            שליחה דרך האתר
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'other'}
            className={`shadchan-share-panel__tab${activeTab === 'other' ? ' shadchan-share-panel__tab--active' : ''}`}
            onClick={() => setActiveTab('other')}
          >
            שיטות אחרות
          </button>
        </div>
      )}

      <div className="shadchan-share-panel__body">
        <div className="shadchan-share-panel__config">
          <ProfileShareFieldsPanel
            value={settings}
            onChange={(next) => {
              onSettingsChange(next);
              setPrefixSaved(false);
            }}
          />

          <h3 className="shadchan-share-panel__section-title">שורות ריקות בין קטגוריות</h3>
          <div className="shadchan-share-panel__spacing-input-row">
            <input
              type="number"
              className="shadchan-share-panel__spacing-input"
              min={0}
              max={10}
              value={settings.linesBetweenCategories}
              onChange={(event) => {
                const parsed = Number(event.target.value);
                patchSettings({
                  linesBetweenCategories: Number.isFinite(parsed)
                    ? Math.min(10, Math.max(0, Math.round(parsed)))
                    : 0,
                });
              }}
            />
            <span className="shadchan-share-panel__spacing-hint">0 = ללא רווח נוסף</span>
          </div>

          <h3 className="shadchan-share-panel__section-title">קידומת עליונה</h3>
          <textarea
            className="shadchan-share-panel__textarea"
            rows={2}
            value={settings.topPrefix}
            onChange={(event) => patchSettings({ topPrefix: event.target.value })}
          />

          <h3 className="shadchan-share-panel__section-title">קידומת תחתונה</h3>
          <textarea
            className="shadchan-share-panel__textarea"
            rows={2}
            value={settings.bottomPrefix}
            onChange={(event) => patchSettings({ bottomPrefix: event.target.value })}
          />

          <button type="button" className="btn btn--secondary btn--sm" onClick={handleSavePrefixes}>
            שמור קידומות לפעם הבאה
          </button>
          {prefixSaved && <p className="shadchan-share-panel__saved">הקידומות נשמרו.</p>}
        </div>

        <div className="shadchan-share-panel__preview-wrap">
          <h3 className="shadchan-share-panel__section-title">תצוגה מקדימה</h3>
          <div className="shadchan-share-panel__preview">
            {segments.map((segment, index) => {
              const gap = previewGapBefore(index);
              if (segment.type === 'image') {
                return (
                  <img
                    key={`${segment.url}-${index}`}
                    src={segment.url}
                    alt=""
                    className="shadchan-share-panel__preview-image"
                    style={{ marginTop: gap ? `${gap * 0.75}rem` : undefined }}
                  />
                );
              }

              return (
                <p
                  key={`${segment.text}-${index}`}
                  className={`shadchan-share-panel__preview-line shadchan-share-panel__preview-line--${segment.role}`}
                  style={{ marginTop: gap ? `${gap * 0.75}rem` : undefined }}
                >
                  {segment.text}
                </p>
              );
            })}
          </div>

          <div className="shadchan-share-panel__actions">
            {!isExport && activeTab === 'site' ? (
              <>
                <label className="shadchan-share-panel__section-title" htmlFor="recipient-account-id">
                  מזהה חשבון משודך/ת
                </label>
                <input
                  id="recipient-account-id"
                  type="text"
                  className="shadchan-share-panel__spacing-input"
                  value={recipientAccountId}
                  onChange={(event) => onRecipientAccountIdChange?.(event.target.value)}
                  placeholder="הזן accountId של המשודך/ת"
                />
                <button
                  type="button"
                  className={`btn btn--primary${isSending ? ' btn--loading' : ''}`}
                  onClick={handleSiteSend}
                  disabled={isSending || !recipientAccountId.trim() || !onSiteSend}
                  aria-busy={isSending}
                >
                  {isSending && <span className="btn__spinner" aria-hidden="true" />}
                  {isSending ? 'שולח...' : 'שלח דרך האתר'}
                </button>
              </>
            ) : (
              <div className="shadchan-share-panel__method-grid">
                {OTHER_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() => runOtherMethod(method.id)}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {statusMessage && <p className="shadchan-share-panel__status">{statusMessage}</p>}
        </div>
      </div>
    </section>
  );
};
