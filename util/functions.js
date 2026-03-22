export const formatTimer = (seconds) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
};

export const calculateAccuracy = (correct, total) => {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
};

export const getScoreMessage = (accuracy) => {
  if (accuracy >= 80) return 'Great Job!';
  if (accuracy >= 50) return 'Good Effort';
  return 'Keep Practicing';
};
