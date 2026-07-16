import React, { useEffect, useMemo, useState } from 'react';
import { SendButton } from '../common/SendButton';
import { authApi } from '../../api/authApi';
import { getApiErrorMessage } from '../../api/apiError';
import { saveSharePrefixes } from '../../constants/profileShareOptions';
import { PersonSummary } from '../../types/account';
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
import {
  getPersonDisplayName,
  getPersonInitial,
  getShadchanContactMeta,
} from '../../utils/accountName';
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
  onSiteSend?: (
    note: string,
    recipientAccountId: string,
    recipientProfileId: string
  ) => Promise<void>;
  onViewPersonProfile?: (profileId: string) => void;
  isSending?: boolean;
}

const OTHER_METHODS: ReadonlyArray<{ id: ShadchanShareMethod; label: string }> = [
  { id: 'copy-as-image', label: 'העתק כתמונה' },
  { id: 'copy-text', label: 'העתק טקסט' },
  { id: 'copy-image', label: 'העתק תמונה' },
  { id: 'download-pdf', label: 'הורד כמסמך' },
  { id: 'share-pdf', label: 'שתף כמסמך' },
];

export const ShadchanSharePanel: React.FC<ShadchanSharePanelProps> = ({
  profile,
  initialTab,
  variant = 'send',
  settings,
  onSettingsChange,
  onClose,
  onSiteSend,
  onViewPersonProfile,
  isSending = false,
}) => {
  const isExport = variant === 'export';
  const [activeTab, setActiveTab] = useState<ShadchanShareTab>(isExport ? 'other' : initialTab);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [prefixSaved, setPrefixSaved] = useState(false);
  const [linkedPersons, setLinkedPersons] = useState<PersonSummary[]>([]);
  const [personsLoading, setPersonsLoading] = useState(false);
  const [personsError, setPersonsError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<PersonSummary | null>(null);

  const segments = useMemo(() => buildShareSegments(profile, settings), [profile, settings]);

  useEffect(() => {
    if (isExport || activeTab !== 'site') return;

    let cancelled = false;
    setPersonsLoading(true);
    setPersonsError(null);

    authApi
      .getLinkedPersons()
      .then((persons) => {
        if (!cancelled) setLinkedPersons(persons);
      })
      .catch((error) => {
        if (!cancelled) setPersonsError(getApiErrorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setPersonsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, isExport]);

  useEffect(() => {
    if (activeTab !== 'site') {
      setSelectedPerson(null);
    }
  }, [activeTab]);

  const patchSettings = (patch: Partial<ProfileShareSettings>) => {
    onSettingsChange({ ...settings, ...patch });
    setPrefixSaved(false);
  };

  const handleSavePrefixes = () => {
    saveSharePrefixes(settings.topPrefix, settings.bottomPrefix);
    setPrefixSaved(true);
  };

  const isSiteMode = !isExport && activeTab === 'site';

  const handleSiteSend = async () => {
    if (!onSiteSend || !selectedPerson?.accountId || !selectedPerson.profileId) return;
    const note = `המלצה: ${profile.firstName} ${profile.lastName}`.trim();
    await onSiteSend(note, selectedPerson.accountId, selectedPerson.profileId);
    setSelectedPerson(null);
  };

  const handleViewPersonProfile = () => {
    if (!selectedPerson?.profileId || !onViewPersonProfile) return;
    onViewPersonProfile(selectedPerson.profileId);
    onClose();
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
        setStatusMessage('נפתח חלון להדפסה או שמירה כמסמך.');
        break;
      case 'share-pdf': {
        const ok = await shareProfilePdf(profile, settings);
        setStatusMessage(
          ok
            ? 'נפתח תפריט השיתוף.'
            : 'שיתוף לא זמין בדפדפן זה. נסה "הורד כמסמך".'
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
    return segment.type === 'image' || previous.type === 'image' ? 2 : 0;
  };

  const renderSiteRecipientSection = () => (
    <div className="shadchan-share-panel__site-send">
      {!selectedPerson ? (
        <>
          <h3 className="shadchan-share-panel__section-title">בחר/י משודך/ת באחריותך</h3>
          {personsLoading && (
            <p className="shadchan-share-panel__status">טוען רשימת משודכים...</p>
          )}
          {personsError && (
            <p className="shadchan-share-panel__status shadchan-share-panel__status--error">
              {personsError}
            </p>
          )}
          {!personsLoading && !personsError && linkedPersons.length === 0 && (
            <p className="shadchan-share-panel__status">
              אין משודכים באחריותך. הוסף/י פרופיל משודך/ת תחת &quot;פרופילים באחריותי&quot;.
            </p>
          )}
          {!personsLoading && linkedPersons.length > 0 && (
            <ul className="shadchan-share-panel__recipient-list" role="listbox" aria-label="משודכים באחריותך">
              {linkedPersons.map((person) => {
                const displayName = getPersonDisplayName(person);
                const contactMeta =
                  getShadchanContactMeta(person.phone) ??
                  (!person.accountId ? 'אין חשבון באפליקציה' : null);
                const listKey = person.accountId ?? person.profileId ?? displayName;

                return (
                  <li key={listKey}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={false}
                      className="shadchan-share-panel__recipient-option"
                      onClick={() => setSelectedPerson(person)}
                      disabled={isSending}
                    >
                      <span className="shadchan-share-panel__recipient-avatar" aria-hidden="true">
                        {getPersonInitial(person)}
                      </span>
                      <span className="shadchan-share-panel__recipient-body">
                        <strong className="shadchan-share-panel__recipient-name">{displayName}</strong>
                        {contactMeta && (
                          <span className="shadchan-share-panel__recipient-meta">{contactMeta}</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        <>
          <button
            type="button"
            className="btn btn--ghost btn--sm shadchan-share-panel__back"
            onClick={() => setSelectedPerson(null)}
            disabled={isSending}
          >
            חזרה לרשימה
          </button>
          <p className="shadchan-share-panel__selected-name">
            נבחר/ה: <strong>{getPersonDisplayName(selectedPerson)}</strong>
          </p>
          <div className="shadchan-share-panel__selected-actions">
            {selectedPerson.profileId && onViewPersonProfile && (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleViewPersonProfile}
                disabled={isSending}
              >
                צפה בפרופיל שלהם
              </button>
            )}
            <SendButton
              variant="site"
              isLoading={isSending}
              onClick={handleSiteSend}
              disabled={!onSiteSend || !selectedPerson.accountId}
              fullWidth
            >
              שלח להם את הפרופיל
            </SendButton>
          </div>
          {!selectedPerson.accountId && (
            <p className="shadchan-share-panel__status">
              למשודך/ת זה אין חשבון באפליקציה — ניתן לצפות בפרופיל, אך שליחה דרך האתר דורשת
              שהמשודך/ת יירשם/תירשם ויקשר/תקשר אותך.
            </p>
          )}
        </>
      )}
    </div>
  );

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
              : isSiteMode
                ? 'בחר/י למי לשלוח את הפרופיל'
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

      {isSiteMode ? (
        <div className="shadchan-share-panel__body shadchan-share-panel__body--site-only">
          {renderSiteRecipientSection()}
        </div>
      ) : (
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
            {isExport || activeTab === 'other' ? (
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
            ) : null}
          </div>

          {statusMessage && <p className="shadchan-share-panel__status">{statusMessage}</p>}
        </div>
      </div>
      )}
    </section>
  );
};
