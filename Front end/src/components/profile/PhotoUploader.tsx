import React, { useRef } from 'react';
import { MAX_PROFILE_PHOTOS } from '../../constants/profileOptions';
import './PhotoUploader.css';

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  error?: string;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos,
  onChange,
  error,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const slots = Array.from({ length: MAX_PROFILE_PHOTOS }, (_, i) => photos[i] ?? null);

  const handleFile = (file: File) => {
    if (photos.length >= MAX_PROFILE_PHOTOS) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange([...photos, reader.result]);
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="photo-uploader">
      <div className="photo-uploader__header">
        <span className="photo-uploader__label">תמונות פרופיל</span>
        <span className="photo-uploader__count">
          {photos.length} / {MAX_PROFILE_PHOTOS}
        </span>
      </div>
      <div className="photo-uploader__grid">
        {slots.map((photo, index) =>
          photo ? (
            <div key={`photo-${index}`} className="photo-uploader__slot photo-uploader__slot--filled">
              <img src={photo} alt={`תמונה ${index + 1}`} />
              <button
                type="button"
                className="photo-uploader__remove"
                aria-label={`הסר תמונה ${index + 1}`}
                onClick={() => removePhoto(index)}
              >
                ×
              </button>
            </div>
          ) : (
            <button
              key={`empty-${index}`}
              type="button"
              className="photo-uploader__slot photo-uploader__slot--empty"
              aria-label="העלה תמונה"
              disabled={photos.length >= MAX_PROFILE_PHOTOS}
              onClick={() => inputRef.current?.click()}
            >
              <UploadIcon />
              <span>הוסף תמונה</span>
            </button>
          )
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="photo-uploader__input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      {error && <p className="photo-uploader__error">{error}</p>}
      <p className="photo-uploader__hint">עד {MAX_PROFILE_PHOTOS} תמונות · JPG, PNG</p>
    </div>
  );
};

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16" strokeLinecap="round" />
    </svg>
  );
}
