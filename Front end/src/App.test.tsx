import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app shell with browse profiles', () => {
  render(<App />);
  expect(screen.getByText('עיון בפרופילים')).toBeInTheDocument();
  expect(screen.getByText('שידוכים')).toBeInTheDocument();
});
