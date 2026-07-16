import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import {
  AiExtractionResult,
  ExtractedField,
  extractProfileFromText,
  saveAiImportDraft,
} from '../utils/aiProfileExtract';
import { ExtractedFieldRow } from '../components/profile/AiImportFieldRow';
import './Page.css';
import './AiImportPage.css';

type Step = 'input' | 'review';

const SAMPLE_TEXT = `שם: יעקב
גיל: 24
עיר: ירושלים
גובה: 1.78 מ
זרם: חרדי
מצב משפחתי: רווק
תכונות: אדיב/ה, ישר/ה, אמפתי/ת
תחביבים: קריאה, נסיעות
מחפש/ת: משפחתי/ת, צנוע/ה
חזון: בית חם ותומך עם דגש על חינוך הילדים.`;

export const AiImportPage: React.FC = () => {  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [rawText, setRawText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<AiExtractionResult | null>(null);
  const [fields, setFields] = useState<ExtractedField[]>([]);

  const handleExtract = async () => {
    if (!rawText.trim()) return;
    setIsExtracting(true);
    await new Promise((r) => setTimeout(r, 900));
    const extracted = extractProfileFromText(rawText);
    setResult(extracted);
    setFields(extracted.fields);
    setStep('review');
    setIsExtracting(false);
  };

  const handleFieldChange = (updated: ExtractedField) => {
    setFields((prev) => prev.map((f) => (f.key === updated.key ? updated : f)));
  };

  const requiredSelectsValid = fields
    .filter((f) => f.inputType === 'select' && ['gender', 'maritalStatus'].includes(f.key))
    .every((f) => Boolean(f.value));

  const handleApprove = () => {
    if (!requiredSelectsValid) return;
    saveAiImportDraft(fields);
    navigate('/add-profile?from=ai-import');
  };

  const handleBack = () => {
    setStep('input');
  };

  return (
    <div className="ds-page ds-page--wide ai-import-page">
      <PageHeader
        variant="hero"
        title="ייבוא פרופיל אוטומטי"
        subtitle="הדביקו טקסט גולמי מוואטסאפ, אימייל או מסמך — המערכת תחלץ שדות אוטומטית לבדיקה ואישור."
        badge={<span className="ds-badge ds-badge--primary">חדש</span>}
        actions={
          step === 'review' ? (
            <button type="button" className="btn btn--secondary" onClick={handleBack}>
              חזרה לעריכת טקסט
            </button>
          ) : null
        }
      />

      {step === 'input' && (
        <div className="ai-import__input-stage animate-fade-in">
          <div className="ds-card ds-card--elevated ai-import__paste-card">
            <div className="ds-card__header">
              <div>
                <h2 className="ds-card__title">טקסט מקור</h2>
                <p className="ds-card__subtitle">
                  הדביקו את תיאור הפרופיל כפי שהתקבל מהמשודך/ת או מההורים
                </p>
              </div>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setRawText(SAMPLE_TEXT)}
              >
                טען דוגמה
              </button>
            </div>
            <div className="ds-card__body ai-import__paste-body">
              <textarea
                className="form-field__textarea ai-import__textarea"
                rows={14}
                placeholder="הדביקו כאן את הטקסט המלא..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>
            <div className="ds-card__footer">
              <button
                type="button"
                className={`btn btn--primary btn--lg${isExtracting ? ' btn--loading' : ''}`}
                disabled={!rawText.trim() || isExtracting}
                onClick={handleExtract}
              >
                {isExtracting ? (
                  <>
                    <span className="btn__spinner" aria-hidden="true" />
                    מחלץ שדות...
                  </>
                ) : (
                  'חלץ שדות אוטומטית'
                )}
              </button>
            </div>
          </div>

          <aside className="ai-import__tips ds-card">
            <h3 className="ds-card__title">טיפים לתוצאות טובות יותר</h3>
            <ul className="ai-import__tips-list">
              <li>כלולו שם, גיל, עיר ומצב משפחתי במפורש</li>
              <li>הפרידו בין שדות עם שורה חדשה או נקודתיים</li>
              <li>אחרי החילוץ תוכלו לערוך כל שדה לפני השמירה</li>
            </ul>
          </aside>
        </div>
      )}

      {step === 'review' && result && (
        <div className="ai-import__review-stage animate-fade-in">
          <div className="ai-import__compare">
            <section className="ai-import__panel ai-import__panel--source ds-card">
              <header className="ai-import__panel-header">
                <h2 className="ds-card__title">טקסט מקורי</h2>
                <span className="ds-badge ds-badge--muted">מקור</span>
              </header>
              <pre className="ai-import__source-text">{result.rawText}</pre>
            </section>

            <section className="ai-import__panel ai-import__panel--extracted">
              <header className="ai-import__panel-header">
                <h2 className="ds-card__title">שדות שחולצו</h2>
                <span className="ds-badge ds-badge--success">{fields.length} שדות</span>
              </header>

              {fields.length === 0 ? (
                <div className="ds-empty">
                  <p className="ds-empty__title">לא זוהו שדות</p>
                  <p className="ds-empty__text">נסו להוסיף מידע מפורש יותר בטקסט המקורי</p>
                </div>
              ) : (
                <div className="ai-import__fields">
                  {fields.map((field) => (
                    <ExtractedFieldRow
                      key={field.key}
                      field={field}
                      onChange={handleFieldChange}
                    />
                  ))}                </div>
              )}

              <div className="ai-import__review-actions">
                <button type="button" className="btn btn--secondary" onClick={handleBack}>
                  ביטול
                </button>
                <button
                  type="button"
                  className="btn btn--primary btn--lg"
                  disabled={fields.length === 0 || !requiredSelectsValid}
                  onClick={handleApprove}
                  title={
                    !requiredSelectsValid
                      ? 'יש לבחור מין ומצב משפחתי מהרשימה'
                      : undefined
                  }
                >                  אשר וצור פרופיל
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
