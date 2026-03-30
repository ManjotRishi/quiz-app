const ANSWER_INDEX = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
};

export const getRandomMessage = (messages = []) => {
  if (!messages?.length) {
    return '';
  }

  return messages[Math.floor(Math.random() * messages.length)] ?? '';
};

export const getTimeProgressColors = (progressRatio = 0) => {
  if (progressRatio <= 0.33) {
    return ['#FF5C5C', '#FF8A4C'];
  }

  if (progressRatio <= 0.66) {
    return ['#FFB84D', '#FFE06A'];
  }

  return ['#4BE2C5', '#7CE9F8'];
};

export const resolveCorrectOption = (question) => {
  const options = question?.options ?? [];
  const answer = question?.answer;

  if (!answer) return null;
  if (options.includes(answer)) return answer;

  const normalizedAnswer = String(answer).trim().toUpperCase();
  const optionIndex = ANSWER_INDEX[normalizedAnswer];

  if (optionIndex !== undefined && options?.[optionIndex]) {
    return options[optionIndex];
  }

  const prefixedMatch = options.find((option) =>
    option?.trim?.()?.toUpperCase?.()?.startsWith(`${normalizedAnswer})`)
  );

  return prefixedMatch ?? null;
};
