import React from 'react';
import './ProfileCardSkeleton.css';

export const ProfileCardSkeleton: React.FC = () => (
  <article className="profile-card-skeleton" aria-hidden="true">
    <div className="profile-card-skeleton__image skeleton-block" />
    <div className="profile-card-skeleton__body">
      <div className="profile-card-skeleton__line profile-card-skeleton__line--title skeleton-block" />
      <div className="profile-card-skeleton__line profile-card-skeleton__line--meta skeleton-block" />
    </div>
  </article>
);
