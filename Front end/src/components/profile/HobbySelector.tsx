import React from 'react';
import { HOBBY_OPTIONS } from '../../constants/profileOptions';
import { TraitSelector } from './TraitSelector';

interface HobbySelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const HobbySelector: React.FC<HobbySelectorProps> = ({ selected, onChange }) => (
  <TraitSelector
    label="תחביבים"
    hint="בחר/י תחביבים או הוסף/י חדשים"
    options={HOBBY_OPTIONS}
    selected={selected}
    onChange={onChange}
    customPlaceholder="תחביב נוסף..."
  />
);
