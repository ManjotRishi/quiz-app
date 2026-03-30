export const LANGUAGE_OPTIONS = [
  { key: 'English', label: 'English' },
  { key: 'Hindi', label: 'Hindi' },
  { key: 'Punjabi', label: 'Punjabi' },
];

export const getLanguageQuestions = (quizData, selectedLanguage) => {
  if (Array.isArray(quizData)) {
    return quizData;
  }

  const activeQuestions = quizData?.[selectedLanguage];
  if (Array.isArray(activeQuestions)) {
    return activeQuestions;
  }

  const fallbackLanguages = LANGUAGE_OPTIONS
    .map((option) => option.key)
    .filter((language) => language !== selectedLanguage);

  for (const fallbackLanguage of fallbackLanguages) {
    const fallbackQuestions = quizData?.[fallbackLanguage];
    if (Array.isArray(fallbackQuestions)) {
      return fallbackQuestions;
    }
  }

  return [];
};

export const getAvailableLanguage = (quizData, preferredLanguage = 'English') => {
  if (Array.isArray(quizData)) {
    return preferredLanguage;
  }

  if (Array.isArray(quizData?.[preferredLanguage])) {
    return preferredLanguage;
  }

  const availableLanguage = LANGUAGE_OPTIONS.find((option) => Array.isArray(quizData?.[option.key]));

  return availableLanguage?.key ?? preferredLanguage;
};
