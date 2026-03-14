export const useRatingDisplay = () => {
  const ratingStars = (rating: number): string => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return { ratingStars };
};
