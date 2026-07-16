import React, { useState } from 'react';
import { ContactDetailsPayload } from '../../types/matchCase';
import './ContactDetailsCard.css';

interface ContactDetailsCardProps {
  details: ContactDetailsPayload | null;
  loading?: boolean;
  error?: string | null;
  onRequest: () => void;
}

export const ContactDetailsCard: React.FC<ContactDetailsCardProps> = ({
  details,
  loading = false,
  error = null,
  onRequest,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    if (!expanded && !details && !loading) {
      onRequest();
    }
    setExpanded((open) => !open);
  };

  return (
    <section className="contact-details-card" aria-label="פרטי קשר">
      <button
        type="button"
        className="btn btn--secondary contact-details-card__toggle"
        onClick={handleToggle}
        aria-expanded={expanded}
        disabled={loading}
      >
        {loading ? 'טוען פרטי קשר...' : 'צפייה בפרטי קשר'}
      </button>

      {error && <p className="contact-details-card__error">{error}</p>}

      {expanded && details && (
        <div className="contact-details-card__panel">
          <h3 className="contact-details-card__title">פרטי קשר</h3>

          <div className="contact-details-card__section">
            <h4 className="contact-details-card__section-title">מספרי טלפון</h4>
            {details.phone ? (
              <a className="contact-details-card__phone" href={`tel:${details.phone}`}>
                {details.phone}
              </a>
            ) : (
              <p className="contact-details-card__empty">לא הוזן מספר טלפון</p>
            )}
          </div>

          <div className="contact-details-card__section">
            <h4 className="contact-details-card__section-title">אנשי קשר לרפרנס</h4>
            {details.references.length > 0 ? (
              <ul className="contact-details-card__refs">
                {details.references.map((ref) => (
                  <li key={ref.id} className="contact-details-card__ref">
                    <span className="contact-details-card__ref-name">{ref.name}</span>
                    <a
                      className="contact-details-card__ref-phone"
                      href={`tel:${ref.countryCode}${ref.phoneNumber}`}
                    >
                      {ref.countryCode} {ref.phoneNumber}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="contact-details-card__empty">אין אנשי קשר לרפרנס</p>
            )}
          </div>

          <div className="contact-details-card__section">
            <h4 className="contact-details-card__section-title">דור ישרים</h4>
            <p className="contact-details-card__empty">
              {details.dorYesharimStatus ?? 'טרם הוזן — יתווסף בעתיד'}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
