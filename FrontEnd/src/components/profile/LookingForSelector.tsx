import React, { useEffect, useMemo } from 'react';
import {
  PERSONALITY_TRAIT_OPTIONS,
  filterPersonalityTraits,
} from '../../constants/profileOptions';
import { TraitSelector } from './TraitSelector';

interface LookingForSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const LookingForSelector: React.FC<LookingForSelectorProps> = ({
  selected,
  onChange,
}) => {
  const validSelected = useMemo(() => filterPersonalityTraits(selected), [selected]);

  useEffect(() => {
    if (validSelected.length !== selected.length) {
      onChange(validSelected);
    }
  }, [validSelected, selected, onChange]);

  return (
    <TraitSelector
      label="מחפש/ת"
      hint="בחר/י תכונות אישיות שחשובות לך בבן/בת זוג"
      options={PERSONALITY_TRAIT_OPTIONS}
      selected={validSelected}
      onChange={(next) => onChange(filterPersonalityTraits(next))}
      allowCustom={false}
    />
  );
};
