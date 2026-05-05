import { createMMKV } from 'react-native-mmkv';

const STORAGE_ID = 'dailyQuizz.quizTopicStats';
const SESSION_STORAGE_ID = 'dailyQuizz.quizTopicProgressSessions';

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

const getTodayDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const TOPIC_ORDER = ['gk', 'math', 'english', 'child', 'tc', 'ca'];

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
    label: 'English Quiz',
    title: 'English Quiz',
    accent: '#60A5FA',
    glow: 'rgba(96,165,250,0.26)',
  },
  math: {
    key: 'math',
    label: 'Math Quiz',
    title: 'Math Quiz',
    accent: '#14B8A6',
    glow: 'rgba(20,184,166,0.24)',
  },
  child: {
    key: 'child',
    label: 'Child Quiz',
    title: 'Child Quiz',
    accent: '#F59E0B',
    glow: 'rgba(245,158,11,0.24)',
  },
  tc: {
    key: 'tc',
    label: 'Reasoning',
    title: 'Reasoning',
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
  totalQuestions: 0,
  attempted: 0,
  correct: 0,
  failed: 0,
  unattempted: 0,
  quizzesPlayed: 0,
  lastUpdatedAt: null,
});

const createDefaultStats = () =>
  TOPIC_ORDER.reduce((acc, key) => {
    acc[key] = createEmptyTopicStats();
    return acc;
  }, {});

const createStatsPayload = (dateKey = getTodayDateKey(), stats = createDefaultStats()) => ({
  dateKey,
  stats,
});

const createSessionsPayload = (dateKey = getTodayDateKey(), sessions = {}) => ({
  dateKey,
  sessions,
});

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

  if (quizType === 'math') {
    return 'math';
  }

  if (quizType === 'child') {
    return 'child';
  }

  return 'gk';
};

const normalizeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeTopicStats = (value = {}) => ({
  totalQuestions: normalizeNumber(value.totalQuestions),
  attempted: normalizeNumber(value.attempted),
  correct: normalizeNumber(value.correct),
  failed: normalizeNumber(value.failed),
  unattempted: normalizeNumber(value.unattempted),
  quizzesPlayed: normalizeNumber(value.quizzesPlayed),
  lastUpdatedAt: typeof value.lastUpdatedAt === 'string' ? value.lastUpdatedAt : null,
});

const normalizeSessionStats = (value = {}) => ({
  quizType: typeof value.quizType === 'string' ? value.quizType : 'gk',
  totalQuestions: normalizeNumber(value.totalQuestions),
  correctAnswers: normalizeNumber(value.correctAnswers),
  wrongAnswers: normalizeNumber(value.wrongAnswers),
  notAttemptedAnswers: normalizeNumber(value.notAttemptedAnswers),
});

const normalizeStatsPayload = (value) => {
  const defaultStats = createDefaultStats();
  const sourceStats =
    value?.stats && typeof value.stats === 'object' ? value.stats : value;

  const stats = TOPIC_ORDER.reduce((acc, key) => {
    acc[key] = normalizeTopicStats(sourceStats?.[key] ?? defaultStats[key]);
    return acc;
  }, {});

  return {
    dateKey: typeof value?.dateKey === 'string' ? value.dateKey : null,
    stats,
  };
};

const normalizeSessionsPayload = (value) => {
  const sourceSessions =
    value?.sessions && typeof value.sessions === 'object' ? value.sessions : value;

  const sessions =
    sourceSessions && typeof sourceSessions === 'object'
      ? Object.entries(sourceSessions).reduce((acc, [key, sessionValue]) => {
          acc[key] = normalizeSessionStats(sessionValue);
          return acc;
        }, {})
      : {};

  return {
    dateKey: typeof value?.dateKey === 'string' ? value.dateKey : null,
    sessions,
  };
};

export const readQuizTopicStats = () => {
  try {
    const storedValue = STORAGE.getString(STORAGE_ID);
    const todayDateKey = getTodayDateKey();

    if (!storedValue) {
      const defaultStats = createDefaultStats();
      writeQuizTopicStats(defaultStats, todayDateKey);
      return defaultStats;
    }

    const parsedValue = normalizeStatsPayload(JSON.parse(storedValue));

    if (parsedValue.dateKey !== todayDateKey) {
      const defaultStats = createDefaultStats();
      writeQuizTopicStats(defaultStats, todayDateKey);
      writeQuizProgressSessions({}, todayDateKey);
      return defaultStats;
    }

    return parsedValue.stats;
  } catch (error) {
    console.warn('Failed to read quiz topic stats:', error);
    return createDefaultStats();
  }
};

const readQuizProgressSessions = () => {
  try {
    const storedValue = STORAGE.getString(SESSION_STORAGE_ID);
    const todayDateKey = getTodayDateKey();

    if (!storedValue) {
      writeQuizProgressSessions({}, todayDateKey);
      return {};
    }

    const parsedValue = normalizeSessionsPayload(JSON.parse(storedValue));

    if (parsedValue.dateKey !== todayDateKey) {
      writeQuizProgressSessions({}, todayDateKey);
      return {};
    }

    return parsedValue.sessions;
  } catch (error) {
    console.warn('Failed to read quiz progress sessions:', error);
    return {};
  }
};

const writeQuizTopicStats = (stats, dateKey = getTodayDateKey()) => {
  STORAGE.set(STORAGE_ID, JSON.stringify(createStatsPayload(dateKey, stats)));
};

const writeQuizProgressSessions = (sessions, dateKey = getTodayDateKey()) => {
  STORAGE.set(SESSION_STORAGE_ID, JSON.stringify(createSessionsPayload(dateKey, sessions)));
};

export const recordQuizResult = ({
  quizType,
  totalQuestions = 0,
  correctAnswers = 0,
  wrongAnswers = 0,
  notAttemptedAnswers = 0,
}) => {
  const topicKey = normalizeQuizType(quizType);
  const currentStats = readQuizTopicStats();
  const topicStats = currentStats[topicKey] ?? createEmptyTopicStats();

  const total = normalizeNumber(totalQuestions);
  const correct = normalizeNumber(correctAnswers);
  const failed = normalizeNumber(wrongAnswers);
  const unattempted = normalizeNumber(notAttemptedAnswers);
  const attempted = correct + failed;

  const nextStats = {
    ...currentStats,
    [topicKey]: {
      ...topicStats,
      totalQuestions: topicStats.totalQuestions + Math.max(total, attempted + unattempted),
      attempted: topicStats.attempted + attempted,
      correct: topicStats.correct + correct,
      failed: topicStats.failed + failed,
      unattempted: topicStats.unattempted + unattempted,
      quizzesPlayed: topicStats.quizzesPlayed + 1,
      lastUpdatedAt: new Date().toISOString(),
    },
  };

  writeQuizTopicStats(nextStats);

  return nextStats;
};

export const syncQuizProgress = ({
  sessionId,
  quizType,
  totalQuestions = 0,
  correctAnswers = 0,
  wrongAnswers = 0,
  notAttemptedAnswers = 0,
  isComplete = false,
}) => {
  if (!sessionId) {
    return readQuizTopicStats();
  }

  const topicKey = normalizeQuizType(quizType);
  const currentStats = readQuizTopicStats();
  const sessionStats = readQuizProgressSessions();
  const previousSession = sessionStats[sessionId] ?? normalizeSessionStats({ quizType });
  const topicStats = currentStats[topicKey] ?? createEmptyTopicStats();

  const nextSession = normalizeSessionStats({
    quizType,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    notAttemptedAnswers,
  });

  const previousAttempted = previousSession.correctAnswers + previousSession.wrongAnswers;
  const nextAttempted = nextSession.correctAnswers + nextSession.wrongAnswers;

  const deltaTotalQuestions = Math.max(0, nextSession.totalQuestions - previousSession.totalQuestions);
  const deltaCorrect = Math.max(0, nextSession.correctAnswers - previousSession.correctAnswers);
  const deltaWrong = Math.max(0, nextSession.wrongAnswers - previousSession.wrongAnswers);
  const deltaUnattempted = Math.max(
    0,
    nextSession.notAttemptedAnswers - previousSession.notAttemptedAnswers
  );
  const deltaAttempted = Math.max(0, nextAttempted - previousAttempted);

  const nextStats = {
    ...currentStats,
    [topicKey]: {
      ...topicStats,
      totalQuestions: topicStats.totalQuestions + deltaTotalQuestions,
      attempted: topicStats.attempted + deltaAttempted,
      correct: topicStats.correct + deltaCorrect,
      failed: topicStats.failed + deltaWrong,
      unattempted: topicStats.unattempted + deltaUnattempted,
      quizzesPlayed:
        topicStats.quizzesPlayed +
        (isComplete && previousSession.totalQuestions > 0 ? 1 : 0),
      lastUpdatedAt: new Date().toISOString(),
    },
  };

  const nextSessions = { ...sessionStats };

  if (isComplete) {
    delete nextSessions[sessionId];
  } else {
    nextSessions[sessionId] = nextSession;
  }

  writeQuizTopicStats(nextStats);
  writeQuizProgressSessions(nextSessions);

  return nextStats;
};

export const clearQuizTopicStats = () => {
  STORAGE.delete(STORAGE_ID);
  STORAGE.delete(SESSION_STORAGE_ID);
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
      totalQuestions: normalizeNumber(topicStats.totalQuestions),
      attempted: normalizeNumber(topicStats.attempted),
      correct: normalizeNumber(topicStats.correct),
      failed: normalizeNumber(topicStats.failed),
      unattempted: normalizeNumber(topicStats.unattempted),
      score: normalizeNumber(topicStats.correct) * 10,
      quizzesPlayed: normalizeNumber(topicStats.quizzesPlayed),
    };
  });

export const getOverallQuizStats = (stats = readQuizTopicStats()) =>
  TOPIC_ORDER.reduce(
    (acc, key) => {
      const topicStats = stats[key] ?? createEmptyTopicStats();

      acc.totalQuestions += normalizeNumber(topicStats.totalQuestions);
      acc.attempted += normalizeNumber(topicStats.attempted);
      acc.correct += normalizeNumber(topicStats.correct);
      acc.failed += normalizeNumber(topicStats.failed);
      acc.unattempted += normalizeNumber(topicStats.unattempted);
      acc.score += normalizeNumber(topicStats.correct) * 10;
      acc.quizzesPlayed += normalizeNumber(topicStats.quizzesPlayed);

      return acc;
    },
    {
      totalQuestions: 0,
      attempted: 0,
      correct: 0,
      failed: 0,
      unattempted: 0,
      score: 0,
      quizzesPlayed: 0,
    }
  );

export const getQuizTopicMeta = (quizType) => TOPIC_META[normalizeQuizType(quizType)] ?? TOPIC_META.gk;
