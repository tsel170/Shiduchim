import React, { useEffect, useState } from 'react';
import { imagesApi } from '../../api/imagesApi';
import './ProfileGallery.css';

interface ProfileGalleryProps {
  photos: string[];
  alt: string;
  /** Stable seed so the pigeon matches the card preview. */
  seed?: string | null;
}

export const ProfileGallery: React.FC<ProfileGalleryProps> = ({
  photos,
  alt,
  seed = null,
}) => {
  const realPhotos = photos.filter((photo) => Boolean(photo?.trim()));
  const [pigeonUrl, setPigeonUrl] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (realPhotos.length > 0) {
      setPigeonUrl(null);
      return;
    }

    let cancelled = false;
    imagesApi
      .pigeonFor(seed)
      .then((image) => {
        if (!cancelled) {
          setPigeonUrl(image?.url || image?.thumbUrl || null);
        }
      })
      .catch(() => {
        if (!cancelled) setPigeonUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [realPhotos.length, seed]);

  const displayPhotos =
    realPhotos.length > 0 ? realPhotos : pigeonUrl ? [pigeonUrl] : [];
  const mainPhoto = displayPhotos[activeIndex] || displayPhotos[0] || null;
  const showThumbs = realPhotos.length > 1;

  return (
    <div className="profile-gallery">
      <div className="profile-gallery__main">
        {mainPhoto ? (
          <img src={mainPhoto} alt={alt} className="profile-gallery__main-img" />
        ) : (
          <div className="profile-gallery__placeholder" aria-hidden="true">
            <span>אין תמונה</span>
          </div>
        )}
      </div>
      {showThumbs && (
        <div className="profile-gallery__thumbs" role="tablist" aria-label="גלריית תמונות">
          {realPhotos.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`תמונה ${index + 1}`}
              className={`profile-gallery__thumb${index === activeIndex ? ' profile-gallery__thumb--active' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              <img src={photo} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
