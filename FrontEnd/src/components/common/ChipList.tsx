import React from 'react';
import './ChipList.css';

interface ChipListProps {
  items: string[];
  emptyLabel?: string;
  variant?: 'default' | 'primary';
}

export const ChipList: React.FC<ChipListProps> = ({
  items,
  emptyLabel = 'לא צוין',
  variant = 'default',
}) => {
  if (items.length === 0) {
    return <p className="chip-list__empty">{emptyLabel}</p>;
  }

  return (
    <ul className={`chip-list chip-list--${variant}`}>
      {items.map((item) => (
        <li key={item} className="chip-list__chip">
          {item}
        </li>
      ))}
    </ul>
  );
};
