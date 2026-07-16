import React, { useState } from 'react';
import { getApiErrorMessage } from '../../api/apiError';
import { matchCasesApi } from '../../api/matchCasesApi';
import { ContactDetailsPayload, MatchCase } from '../../types/matchCase';
import { ContactDetailsCard } from '../contact/ContactDetailsCard';

interface ContactDetailsSectionProps {
  matchCase: MatchCase;
}

export const ContactDetailsSection: React.FC<ContactDetailsSectionProps> = ({ matchCase }) => {
  const actions = matchCase.viewerContext?.availableActions;
  const [details, setDetails] = useState<ContactDetailsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!actions) return null;

  const blockedReason = actions.contactDetailsBlockedReason;
  const canView = actions.canViewContactDetails;
  const showButton = canView || Boolean(blockedReason);

  if (!showButton) return null;

  const handleRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await matchCasesApi.getContactDetails(matchCase.caseId);
      setDetails(payload);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!canView) {
    return (
      <section className="contact-details-section">
        <button type="button" className="btn btn--secondary" disabled title={blockedReason}>
          צפייה בפרטי קשר
        </button>
        {blockedReason && <p className="contact-details-section__hint">{blockedReason}</p>}
      </section>
    );
  }

  return (
    <section className="contact-details-section">
      <ContactDetailsCard
        details={details}
        loading={loading}
        error={error}
        onRequest={handleRequest}
      />
    </section>
  );
};
