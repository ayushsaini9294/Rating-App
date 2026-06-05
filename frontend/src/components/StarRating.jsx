import { useState } from 'react';

const StarRating = ({ value, onChange, readonly = false, size = '' }) => {
  const [hovered, setHovered] = useState(0);

  const display = hovered || value || 0;

  return (
    <div className={`stars${size === 'sm' ? ' stars-sm' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${display >= star ? 'filled' : 'empty'}${readonly ? ' readonly' : ''}`}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
