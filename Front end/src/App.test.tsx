import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders app shell with browse profiles', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'עיון בפרופילים' })).toBeInTheDocument();
  expect(screen.getByText('שידוכים')).toBeInTheDocument();
});

test('navigates to my profile page', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: 'הפרופיל שלי' }));
  expect(screen.getByRole('heading', { name: 'הפרופיל שלי' })).toBeInTheDocument();
});

test('opens profile details from grid', async () => {
  render(<App />);
  const profileCards = screen.getAllByRole('button', { name: /צפייה בפרופיל של/ });
  await userEvent.click(profileCards[0]);
  expect(screen.getByRole('button', { name: /חזרה לרשימה/ })).toBeInTheDocument();
});
