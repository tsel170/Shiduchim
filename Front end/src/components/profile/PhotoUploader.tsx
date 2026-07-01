import React, { useRef, useState } from 'react';
import { MAX_PROFILE_PHOTOS } from '../../constants/profileOptions';
import { compressImageFile } from '../../utils/compressImage';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const slots = Array.from({ length: MAX_PROFILE_PHOTOS }, (_, i) => photos[i] ?? null);

  const handleFile = async (file: File) => {
    if (photos.length >= MAX_PROFILE_PHOTOS || isProcessing) return;
    setUploadError(null);
    setIsProcessing(true);
    try {
      const compressed = await compressImageFile(file);
      onChange([...photos, compressed]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'לא ניתן להעלות את התמונה');
    } finally {
      setIsProcessing(false);
    }
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
              disabled={photos.length >= MAX_PROFILE_PHOTOS || isProcessing}
              onClick={() => inputRef.current?.click()}
            >
              <UploadIcon />
              <span>{isProcessing ? 'מעבד...' : 'הוסף תמונה'}</span>
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
      {(error || uploadError) && (
        <p className="photo-uploader__error">{uploadError ?? error}</p>
      )}
      <p className="photo-uploader__hint">
        עד {MAX_PROFILE_PHOTOS} תמונות · JPG, PNG · התמונות נדחסות אוטומטית לשמירה
      </p>
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
