import React from 'react';
import './FavoriteCardSkeleton.css';

const SKELETON_COUNT = 4;

export const FavoriteCardSkeleton: React.FC = () => (
  <article className="favorite-card-skeleton" aria-hidden="true">
    <div className="favorite-card-skeleton__image skeleton-block" />
    <div className="favorite-card-skeleton__body">
      <div className="favorite-card-skeleton__line favorite-card-skeleton__line--title skeleton-block" />
      <div className="favorite-card-skeleton__line favorite-card-skeleton__line--meta skeleton-block" />
      <div className="favorite-card-skeleton__line favorite-card-skeleton__line--city skeleton-block" />
      <div className="favorite-card-skeleton__score skeleton-block" />
      <div className="favorite-card-skeleton__btn skeleton-block" />
    </div>
  </article>
);

export const FavoritesListSkeleton: React.FC = () => (
  <div className="favorites-list favorites-list--loading" aria-busy="true" aria-label="טוען מועדפים">
    {Array.from({ length: SKELETON_COUNT }, (_, index) => (
      <FavoriteCardSkeleton key={`favorite-skeleton-${index}`} />
    ))}
  </div>
);
