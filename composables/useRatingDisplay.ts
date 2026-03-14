export const useRatingDisplay = () => {
  const ratingStars = (rating: number): string => {
    const clamped = Math.min(5, Math.max(0, Math.floor(rating)));
    return "★".repeat(clamped) + "☆".repeat(5 - clamped);
  };

  return { ratingStars };
};
