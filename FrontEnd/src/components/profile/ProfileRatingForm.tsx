import React from 'react';
import { RATING_CATEGORIES } from '../../constants/profileOptions';
import { ProfileRating, ProfileRatingCategory } from '../../types/profile';
import { calculateAverageRating, isRatingsComplete } from '../../utils/rating';
import './ProfileRatingForm.css';

interface ProfileRatingFormProps {
  rating?: ProfileRating;
  onRate: (category: ProfileRatingCategory, value: number) => void;
}

export const ProfileRatingForm: React.FC<ProfileRatingFormProps> = ({
  rating,
  onRate,
}) => {
  const completed = isRatingsComplete(rating);
  const completeRating = completed ? rating : undefined;
  return (
    <section className="rating-form">
      <h2>הערכת פרופיל לפני צפייה בתמונות</h2>
      <p>יש לדרג את כל הקטגוריות (1-5) כדי לפתוח תמונות ושמירה למועדפים.</p>
      <div className="rating-form__groups">
        {RATING_CATEGORIES.map((category) => {
          const selected = rating?.[category.id] ?? 0;
          return (
            <div key={category.id} className="rating-form__row">
              <span>{category.label}</span>
              <div className="rating-form__stars">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`rating-form__star${selected >= value ? ' rating-form__star--active' : ''}`}
                    onClick={() => onRate(category.id, value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {completed ? (
        <p className="rating-form__ok">
          דירוג מלא. ממוצע: {completeRating ? calculateAverageRating(completeRating) : '-'}
        </p>
      ) : (
        <p className="rating-form__warning">נא להשלים דירוג בכל הקטגוריות.</p>
      )}
    </section>
  );
};
