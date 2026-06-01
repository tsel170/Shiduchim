import React, { useState } from 'react';
import './ProfileGallery.css';

interface ProfileGalleryProps {
  photos: string[];
  alt: string;
}

export const ProfileGallery: React.FC<ProfileGalleryProps> = ({ photos, alt }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const safePhotos = photos.length > 0 ? photos : [''];
  const mainPhoto = safePhotos[activeIndex] || safePhotos[0];

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
      {safePhotos.length > 1 && safePhotos[0] && (
        <div className="profile-gallery__thumbs" role="tablist" aria-label="גלריית תמונות">
          {safePhotos.map((photo, index) => (
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
