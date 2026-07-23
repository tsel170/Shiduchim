import React, { useEffect, useState } from 'react';
import { imagesApi } from '../../api/imagesApi';
import './ProfileImage.css';

interface ProfileImageProps {
  photos?: string[] | null;
  alt?: string;
  className?: string;
  imgClassName?: string;
  locked?: boolean;
}

export const ProfileImage: React.FC<ProfileImageProps> = ({
  photos,
  alt = '',
  className = '',
  imgClassName = '',
  locked = false,
}) => {
  const uploaded = photos?.find((photo) => Boolean(photo?.trim())) ?? null;
  const [placeholder, setPlaceholder] = useState<string | null>(null);

  useEffect(() => {
    if (uploaded) {
      setPlaceholder(null);
      return;
    }

    let cancelled = false;
    imagesApi
      .randomPigeon()
      .then((image) => {
        if (!cancelled) setPlaceholder(image?.url ?? null);
      })
      .catch(() => {
        if (!cancelled) setPlaceholder(null);
      });

    return () => {
      cancelled = true;
    };
  }, [uploaded]);

  const src = uploaded ?? placeholder;

  return (
    <div
      className={`profile-image${locked ? ' profile-image--locked' : ''}${className ? ` ${className}` : ''}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`profile-image__img${imgClassName ? ` ${imgClassName}` : ''}`}
          loading="lazy"
        />
      ) : (
        <div className="profile-image__fallback" aria-hidden="true" />
      )}
    </div>
  );
};
