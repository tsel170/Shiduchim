import React from 'react';
import { LOOKING_FOR_OPTIONS } from '../../constants/profileOptions';
import { TraitSelector } from './TraitSelector';

interface LookingForSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const LookingForSelector: React.FC<LookingForSelectorProps> = ({
  selected,
  onChange,
}) => (
  <TraitSelector
    label="מחפש/ת"
    hint="בחר/י העדפות או הוסף/י חדשות"
    options={LOOKING_FOR_OPTIONS}
    selected={selected}
    onChange={onChange}
    customPlaceholder="העדפה נוספת..."
  />
);
