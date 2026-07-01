import React from 'react';
import { ACCOUNT_FILTER_TABS, AccountFilter } from '../../utils/profileAccount';
import './AccountFilterTabs.css';

interface AccountFilterTabsProps {
  value: AccountFilter;
  onChange: (next: AccountFilter) => void;
  className?: string;
}

export const AccountFilterTabs: React.FC<AccountFilterTabsProps> = ({
  value,
  onChange,
  className = '',
}) => (
  <nav
    className={`account-filter-tabs${className ? ` ${className}` : ''}`}
    aria-label="סינון לפי חשבון משתמש"
  >
    {ACCOUNT_FILTER_TABS.map((tab) => (
      <button
        key={tab.id}
        type="button"
        className={`account-filter-tabs__tab${
          value === tab.id ? ' account-filter-tabs__tab--active' : ''
        }`}
        aria-pressed={value === tab.id}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </nav>
);
