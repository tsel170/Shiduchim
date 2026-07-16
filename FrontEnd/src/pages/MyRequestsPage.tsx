import React from 'react';
import './Page.css';

export const MyRequestsPage: React.FC = () => {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">הבקשות שלי</h1>
        <p className="page__subtitle">מעקב אחר בקשות שנשלחו לשדכן</p>
      </header>
      <div className="page__placeholder">
        <RequestIcon />
        <p>אין בקשות פעילות כרגע.</p>
        <span className="page__placeholder-hint">תכונה זו תתווסף בהמשך</span>
      </div>
    </div>
  );
};

function RequestIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 12h-6l-2 3H10l-2-3H2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
