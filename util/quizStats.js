import { createMMKV } from 'react-native-mmkv';

const STORAGE_ID = 'dailyQuizz.quizTopicStats';

const createFallbackStorage = () => {
  let memory = {};

  return {
    getString: (key) => (Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : undefined),
    set: (key, value) => {
      memory[key] = value;
    },
    delete: (key) => {
      delete memory[key];
    },
  };
};

const getStorage = () => {
  try {
    return createMMKV({
      id: STORAGE_ID,
    });
  } catch (error) {
    console.warn('MMKV unavailable, falling back to in-memory quiz stats:', error);
    return createFallbackStorage();
  }
};

const STORAGE = getStorage();

export const TOPIC_ORDER = ['gk', 'english', 'tc', 'ca'];

export const TOPIC_META = {
  gk: {
    key: 'gk',
    label: 'GK',
    title: 'GK',
    accent: '#8B5CF6',
    glow: 'rgba(139,92,246,0.26)',
  },
  english: {
    key: 'english',
    label: 'English Quizz',
    title: 'English Quizz',
    accent: '#60A5FA',
    glow: 'rgba(96,165,250,0.26)',
  },
  tc: {
    key: 'tc',
    label: 'Puzzles',
    title: 'Puzzles',
    accent: '#F59E0B',
    glow: 'rgba(245,158,11,0.26)',
  },
  ca: {
    key: 'ca',
    label: 'Current Affairs',
    title: 'Current Affairs',
    accent: '#34D399',
    glow: 'rgba(52,211,153,0.24)',
  },
};

const createEmptyTopicStats = () => ({
  attempted: 0,
  correct: 0,
  failed: 0,
  quizzesPlayed: 0,
  lastUpdatedAt: null,
});

const createDefaultStats = () =>
  TOPIC_ORDER.reduce((acc, key) => {
    acc[key] = createEmptyTopicStats();
    return acc;
  }, {});

const normalizeQuizType = (quizType) => {
  if (quizType === 'currentAffairs' || quizType === 'ca') {
    return 'ca';
  }

  if (quizType === 'puzzles' || quizType === 'tc') {
    return 'tc';
  }

  if (quizType === 'english') {
    return 'english';
  }

  return 'gk';
};

const normalizeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeTopicStats = (value = {}) => ({
  attempted: normalizeNumber(value.attempted),
  correct: normalizeNumber(value.correct),
  failed: normalizeNumber(value.failed),
  quizzesPlayed: normalizeNumber(value.quizzesPlayed),
  lastUpdatedAt: typeof value.lastUpdatedAt === 'string' ? value.lastUpdatedAt : null,
});

export const readQuizTopicStats = () => {
  try {
    const storedValue = STORAGE.getString(STORAGE_ID);

    if (!storedValue) {
      return createDefaultStats();
    }

    const parsedValue = JSON.parse(storedValue);
    const defaultStats = createDefaultStats();

    return TOPIC_ORDER.reduce((acc, key) => {
      acc[key] = normalizeTopicStats(parsedValue?.[key] ?? defaultStats[key]);
      return acc;
    }, {});
  } catch (error) {
    console.warn('Failed to read quiz topic stats:', error);
    return createDefaultStats();
  }
};

export const recordQuizResult = ({
  quizType,
  correctAnswers = 0,
  wrongAnswers = 0,
}) => {
  const topicKey = normalizeQuizType(quizType);
  const currentStats = readQuizTopicStats();
  const topicStats = currentStats[topicKey] ?? createEmptyTopicStats();

  const correct = normalizeNumber(correctAnswers);
  const failed = normalizeNumber(wrongAnswers);
  const attempted = correct + failed;

  const nextStats = {
    ...currentStats,
    [topicKey]: {
      ...topicStats,
      attempted: topicStats.attempted + attempted,
      correct: topicStats.correct + correct,
      failed: topicStats.failed + failed,
      quizzesPlayed: topicStats.quizzesPlayed + 1,
      lastUpdatedAt: new Date().toISOString(),
    },
  };

  STORAGE.set(STORAGE_ID, JSON.stringify(nextStats));

  return nextStats;
};

export const clearQuizTopicStats = () => {
  STORAGE.delete(STORAGE_ID);
};

export const getTopicStatsSummary = (stats = readQuizTopicStats()) =>
  TOPIC_ORDER.map((key) => {
    const topicStats = stats[key] ?? createEmptyTopicStats();
    const accuracy = topicStats.attempted
      ? Math.round((topicStats.correct / topicStats.attempted) * 100)
      : 0;
    const focusRate = topicStats.attempted
      ? Math.round((topicStats.failed / topicStats.attempted) * 100)
      : 0;

    return {
      ...TOPIC_META[key],
      ...topicStats,
      accuracy,
      focusRate,
      attempted: normalizeNumber(topicStats.attempted),
      correct: normalizeNumber(topicStats.correct),
      failed: normalizeNumber(topicStats.failed),
      quizzesPlayed: normalizeNumber(topicStats.quizzesPlayed),
    };
  });

export const getOverallQuizStats = (stats = readQuizTopicStats()) =>
  TOPIC_ORDER.reduce(
    (acc, key) => {
      const topicStats = stats[key] ?? createEmptyTopicStats();

      acc.attempted += normalizeNumber(topicStats.attempted);
      acc.correct += normalizeNumber(topicStats.correct);
      acc.failed += normalizeNumber(topicStats.failed);
      acc.quizzesPlayed += normalizeNumber(topicStats.quizzesPlayed);

      return acc;
    },
    {
      attempted: 0,
      correct: 0,
      failed: 0,
      quizzesPlayed: 0,
    }
  );

export const getQuizTopicMeta = (quizType) => TOPIC_META[normalizeQuizType(quizType)] ?? TOPIC_META.gk;
