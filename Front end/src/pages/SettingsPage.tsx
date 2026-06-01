import React from 'react';
import './Page.css';

export const SettingsPage: React.FC = () => {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">הגדרות</h1>
        <p className="page__subtitle">ניהול חשבון והעדפות</p>
      </header>
      <div className="page__settings">
        <section className="settings-section">
          <h2 className="settings-section__title">פרטים אישיים</h2>
          <div className="settings-section__row">
            <label className="settings-section__label">שם מלא</label>
            <input type="text" className="settings-section__input" defaultValue="יוסי כהן" readOnly />
          </div>
          <div className="settings-section__row">
            <label className="settings-section__label">אימייל</label>
            <input type="email" className="settings-section__input" defaultValue="yossi@example.com" readOnly />
          </div>
        </section>
        <section className="settings-section">
          <h2 className="settings-section__title">העדפות שידוך</h2>
          <div className="settings-section__row">
            <label className="settings-section__label">טווח גילאים</label>
            <input type="text" className="settings-section__input" defaultValue="21–27" readOnly />
          </div>
          <div className="settings-section__row">
            <label className="settings-section__label">אזור מועדף</label>
            <input type="text" className="settings-section__input" defaultValue="מרכז הארץ" readOnly />
          </div>
        </section>
        <p className="page__placeholder-hint">הגדרות לקריאה בלבד — הדגמה</p>
      </div>
    </div>
  );
};
