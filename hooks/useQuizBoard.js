import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { useNetInfo } from '@react-native-community/netinfo';
import { INITIAL_TIME, correctMessages, wrongMessages, COLLECTION_NAME, GKCOLLECTION, LISTINGDOC } from '../util/constants';
import { QUIZ_AD_MILESTONES } from '../util/adMobConfig';
import { useCountdown } from './useCountdown';
import { useTickingSound } from './useTickingSound';
import { useAdManager } from './useAdManager';
import { calculateAccuracy } from '../util/functions';
import { getAvailableLanguage, getLanguageQuestions } from '../util/language';
import { getQuizAdMilestone } from '../util/adHelpers';
import { getRandomMessage, getTimeProgressColors, resolveCorrectOption } from '../util/quizHelpers';
import { syncQuizProgress } from '../util/quizStats';
import { loadWithTimeout } from '../util/loadWithTimeout';
import { ROUTES } from '../navigation/routes';
import {
  buildFeedbackSpeech,
  buildQuestionSpeech,
  ensureQuizVoiceReady,
  resetQuizVoice,
  speakQuizText,
} from '../audioManager/quizTts';

const CLOCK_SPEED_MULTIPLIER = 1.75;
const LOAD_TIMEOUT_MS = 30000;
const FEEDBACK_AUTO_NEXT_DELAY_MS = 3200;
const NOTIFICATION_BOOTSTRAP_TIMEOUT_MS = 4000;

export const useQuizBoard = ({
  navigation,
  collectionName = GKCOLLECTION,
  quizType = 'gk',
  quizLabel = 'GK',
  quizBreakMilestones = QUIZ_AD_MILESTONES,
  quizBreakAdType = 'random',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentCorrect, setCurrentCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [notAttemptedCount, setNotAttemptedCount] = useState(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [quizData, setQuizData] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [quizLoading, setQuizLoading] = useState(true);
  const [quizError, setQuizError] = useState(null);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [showTimeOver, setShowTimeOver] = useState(false);
  const [quizStarted, setQuizStarted] = useState(true);
  const isFocused = useIsFocused();
  const netInfo = useNetInfo();
  const timeOverHandledRef = useRef(false);
  const autoNextTimerRef = useRef(null);
  const lastSpokenQuestionRef = useRef('');
  const sessionIdRef = useRef(`${quizType}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
  const lastQuizBreakMilestoneRef = useRef(0);
  const { showRandomQuizBreakAd, showRewarded } = useAdManager();

  const shakeX = useSharedValue(0);
  const showCross = useSharedValue(0);
  const thumbsScale = useSharedValue(0.4);
  const thumbsOpacity = useSharedValue(0);

  const runThumbsAnimation = useCallback(() => {
    thumbsScale.value = 0.45;
    thumbsOpacity.value = 0;
    thumbsOpacity.value = withSequence(
      withTiming(1, { duration: 180 }),
      withTiming(1, { duration: 1500 }),
      withTiming(0, { duration: 320 })
    );
    thumbsScale.value = withSequence(
      withTiming(1.2, { duration: 220 }),
      withTiming(1, { duration: 120 }),
      withTiming(1, { duration: 1340 }),
      withTiming(0.82, { duration: 320 })
    );
  }, [thumbsOpacity, thumbsScale]);

  const toError = useCallback((error, fallbackMessage) => {
    if (error instanceof Error) {
      return error;
    }

    return new Error(fallbackMessage ?? 'Something went wrong. Please try again.');
  }, []);

  const getTodayQuiz = useCallback(async () => {
    const docSnap = await firestore().collection(collectionName).doc(LISTINGDOC).get();

    if (!docSnap?.exists) {
      return { questions: [], title: '' };
    }

    const data = docSnap?.data?.() ?? {};

    return {
      questions: data?.questions ?? [],
      title: data?.title ?? '',
    };
  }, [collectionName]);

  const requestNotificationPermission = useCallback(async () => {
    if (Platform.OS !== 'android' || Platform.Version < 33) {
      return;
    }

    try {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS, {
        title: 'Notification Permission',
        message: 'App needs access to your notifications so you can get updates',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });
    } catch (error) {
      console.warn('Notification permission request failed:', error);
    }
  }, []);

  const loadQuiz = useCallback(async () => {
    try {
      setQuizError(null);
      setQuizLoading(true);

      if (netInfo.isConnected === false || netInfo.isInternetReachable === false) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      const todayQuiz = await loadWithTimeout(
        getTodayQuiz(),
        LOAD_TIMEOUT_MS,
        'Loading the quiz is taking too long. Please try again.'
      );

      setQuizData(todayQuiz?.questions ?? []);
      setQuizTitle(todayQuiz?.title ?? '');
    } catch (error) {
      console.error('Failed to load today quiz:', error);
      setQuizError(toError(error, 'Unable to load the quiz right now.'));
      setQuizData([]);
      setQuizTitle('');
    } finally {
      setQuizLoading(false);
    }
  }, [getTodayQuiz, netInfo.isConnected, netInfo.isInternetReachable, toError]);

  useEffect(() => {
    if (netInfo.isConnected === false || netInfo.isInternetReachable === false) {
      setQuizError(new Error('No internet connection. Please check your network and try again.'));
      setQuizLoading(false);
    }
  }, [netInfo.isConnected, netInfo.isInternetReachable]);

  useEffect(() => {
    let isActive = true;

    const init = async () => {
      try {
        await Promise.race([
          messaging().requestPermission(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Notification permission timed out.')),
              NOTIFICATION_BOOTSTRAP_TIMEOUT_MS
            )
          ),
        ]);
        const token = await Promise.race([
          messaging().getToken(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Notification token request timed out.')),
              NOTIFICATION_BOOTSTRAP_TIMEOUT_MS
            )
          ),
        ]);

        if (isActive && token) {
          await firestore().collection(COLLECTION_NAME).doc(token).set({
            token,
            platform: Platform.OS,
            updatedAt: new Date(),
          });
        }
      } catch (error) {
        console.log('Error saving token:', error);
      }
    };

    const bootstrap = async () => {
      try {
        await loadQuiz();

        if (!isActive) {
          return;
        }

        requestNotificationPermission().catch((error) => {
          console.warn('Notification permission request failed:', error);
        });

        init().catch((error) => {
          console.warn('Quiz notification bootstrap failed:', error);
        });
      } catch (error) {
        console.warn('Quiz bootstrap failed:', error);
      }
    };

    bootstrap().catch((error) => {
      console.warn('Quiz bootstrap start failed:', error);
    });

    let unsubscribe = () => {};

    try {
      unsubscribe = messaging().onTokenRefresh(async (token) => {
        if (!isActive || !token) return;

        try {
          await firestore().collection(COLLECTION_NAME).doc(token).set({
            token,
            platform: Platform.OS,
            updatedAt: new Date(),
          });
        } catch (error) {
          console.warn('Failed to refresh quiz messaging token:', error);
        }
      });
    } catch (error) {
      console.warn('Failed to subscribe to token refresh:', error);
    }

    return () => {
      isActive = false;
      try {
        unsubscribe?.();
      } catch (error) {
        console.warn('Failed to unsubscribe token refresh listener:', error);
      }
    };
  }, [loadQuiz, requestNotificationPermission]);

  useEffect(() => {
    if (!isFocused || !quizStarted || quizLoading || !question?.question || selectedOption) {
      return;
    }

    const spokenKey = `${currentIndex}:${question.question}`;

    if (isVoiceMuted) {
      return;
    }

    if (lastSpokenQuestionRef.current === spokenKey) {
      return;
    }

    let isActive = true;
    const timeoutId = setTimeout(() => {
      const readQuestion = async () => {
        try {
          const spoken = await speakQuizText(
            buildQuestionSpeech(currentIndex + 1, question.question, selectedLanguage),
            { interrupt: false, appLanguage: selectedLanguage }
          );

          if (spoken) {
            lastSpokenQuestionRef.current = spokenKey;
          }
        } catch (error) {
          console.warn('Failed to speak quiz question:', error);
        }
      };

      readQuestion();
    }, 150);

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [currentIndex, isFocused, isVoiceMuted, quizLoading, quizStarted, question?.question, selectedLanguage, selectedOption]);

  useEffect(() => {
    if (!isVoiceMuted) {
      return;
    }

    resetQuizVoice().catch((error) => {
      console.warn('Failed to stop quiz voice after muting:', error);
    });
  }, [isVoiceMuted]);

  useEffect(() => {
    if (isVoiceMuted) {
      return;
    }

    if (!isFocused) {
      return;
    }

    ensureQuizVoiceReady(selectedLanguage).catch((error) => {
      console.warn('Failed to prepare quiz voice for selected language:', error);
    });
  }, [isFocused, isVoiceMuted, selectedLanguage]);

  useEffect(() => {
    if (isFocused) {
      return;
    }

    resetQuizVoice().catch((error) => {
      console.warn('Failed to stop quiz voice after leaving screen:', error);
    });
  }, [isFocused]);

  useEffect(() => {
    return () => {
      resetQuizVoice().catch((error) => {
        console.warn('Failed to stop quiz voice during cleanup:', error);
      });
    };
  }, []);

  useEffect(() => {
    const availableLanguage = getAvailableLanguage(quizData, selectedLanguage);

    if (availableLanguage !== selectedLanguage) {
      setSelectedLanguage(availableLanguage);
    }
  }, [quizData, selectedLanguage]);

  const activeQuestions = useMemo(
    () => getLanguageQuestions(quizData, selectedLanguage),
    [quizData, selectedLanguage]
  );

  const totalQuestions = activeQuestions?.length ?? 0;
  const question = activeQuestions?.[currentIndex];
  const correctOption = resolveCorrectOption(question);
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const finishQuiz = useCallback(
    ({
      finalCorrectCount,
      finalWrongCount,
      finalNotAttemptedCount,
      finalTimeTakenSeconds,
    }) => {
      const accuracy = calculateAccuracy(finalCorrectCount, totalQuestions);
      syncQuizProgress({
        sessionId: sessionIdRef.current,
        quizType,
        totalQuestions,
        correctAnswers: finalCorrectCount,
        wrongAnswers: finalWrongCount,
        notAttemptedAnswers: finalNotAttemptedCount,
        isComplete: true,
      });
      navigation.replace(ROUTES.Score, {
        quizType,
        quizLabel,
        totalQuestions,
        correctAnswers: finalCorrectCount,
        wrongAnswers: finalWrongCount,
        notAttemptedAnswers: finalNotAttemptedCount,
        timeTakenSeconds: finalTimeTakenSeconds,
        accuracy,
        fromQuizFlow: true,
      });
    },
    [navigation, quizLabel, quizType, totalQuestions]
  );

  const { seconds } = useCountdown({
    start: quizStarted ? INITIAL_TIME : 0,
    resetKey: currentIndex,
  });

  useEffect(() => {
    return () => {
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!quizStarted) {
      timeOverHandledRef.current = false;
      setShowTimeOver(false);
      return;
    }

    if (seconds > 0) {
      timeOverHandledRef.current = false;
      setShowTimeOver(false);
      return;
    }

    if (
      seconds !== 0 ||
      quizLoading ||
      !totalQuestions ||
      timeOverHandledRef.current ||
      selectedOption
    ) {
      return;
    }

    timeOverHandledRef.current = true;
    setShowTimeOver(true);

    const timeout = setTimeout(() => {
      setShowTimeOver(false);
      handleNext();
    }, 1200);

    return () => clearTimeout(timeout);
  }, [seconds, quizLoading, totalQuestions, quizStarted, selectedOption]);

  useTickingSound({
    seconds,
    active: quizStarted && isFocused && !quizLoading && totalQuestions > 0,
    muted: isSoundMuted,
    resetKey: currentIndex,
    startAfterElapsedSeconds: 6,
  });

  const handleLanguageChange = useCallback((language) => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }

    resetQuizVoice().catch((error) => {
      console.warn('Failed to stop quiz voice during language change:', error);
    });

    ensureQuizVoiceReady(language).catch((error) => {
      console.warn('Failed to switch quiz voice language:', error);
    });

    lastSpokenQuestionRef.current = '';
    const targetQuestions = getLanguageQuestions(quizData, language);
    const targetTotal = targetQuestions?.length ?? 0;
    const nextIndex = targetTotal > 0 ? Math.min(currentIndex, targetTotal - 1) : 0;

    setSelectedLanguage(language);
    setCurrentIndex(nextIndex);
    setSelectedOption(null);
    setCurrentCorrect(false);
    setFeedbackMessage(null);
    showCross.value = 0;
    thumbsOpacity.value = 0;
    thumbsScale.value = 0.4;
  }, [currentIndex, quizData, showCross, thumbsOpacity, thumbsScale]);

  const handleNext = useCallback(() => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }

    resetQuizVoice().catch((error) => {
      console.warn('Failed to stop quiz voice before moving to next question:', error);
    });

    const spentSeconds = INITIAL_TIME - seconds;
    const hasSelection = Boolean(selectedOption);
    const nextCorrectCount = correctCount + (hasSelection && currentCorrect ? 1 : 0);
    const nextWrongCount = wrongCount + (hasSelection && !currentCorrect ? 1 : 0);
    const nextNotAttemptedCount = notAttemptedCount + (hasSelection ? 0 : 1);
    const nextTimeSpentSeconds = timeSpentSeconds + spentSeconds;
    const nextAttemptedQuestions = nextCorrectCount + nextWrongCount;
    const onQuizFinish = () => {
      finishQuiz({
        finalCorrectCount: nextCorrectCount,
        finalWrongCount: nextWrongCount,
        finalNotAttemptedCount: nextNotAttemptedCount,
        finalTimeTakenSeconds: nextTimeSpentSeconds,
      });
    };

    syncQuizProgress({
      sessionId: sessionIdRef.current,
      quizType,
      totalQuestions,
      correctAnswers: nextCorrectCount,
      wrongAnswers: nextWrongCount,
      notAttemptedAnswers: nextNotAttemptedCount,
    });

    setCorrectCount(nextCorrectCount);
    setWrongCount(nextWrongCount);
    setNotAttemptedCount(nextNotAttemptedCount);
    setTimeSpentSeconds(nextTimeSpentSeconds);

    const milestone = getQuizAdMilestone(nextAttemptedQuestions, quizBreakMilestones);

    if (milestone > 0) {
      let didShow = false;
      let shownMilestone = 0;

      if (milestone !== lastQuizBreakMilestoneRef.current) {
        if (quizBreakAdType === 'rewarded') {
          didShow = showRewarded({
            placement: `${quizType}_quiz_break_rewarded_${milestone}`,
            attemptedQuestions: milestone,
            force: true,
            onClosed: () => {
              if (isLastQuestion) {
                onQuizFinish();
              }
            },
          });
          shownMilestone = didShow ? milestone : 0;
        } else {
          const randomBreakAd = showRandomQuizBreakAd({
            attemptedQuestions: milestone,
            lastShownMilestone: lastQuizBreakMilestoneRef.current,
            onClosed: () => {
              if (isLastQuestion) {
                onQuizFinish();
              }
            },
          });

          didShow = randomBreakAd.didShow;
          shownMilestone = randomBreakAd.milestone;
        }
      }

      if (didShow && shownMilestone) {
        lastQuizBreakMilestoneRef.current = shownMilestone;
      }

      if (isLastQuestion && didShow) {
        return;
      }
    }

    if (isLastQuestion) {
      onQuizFinish();
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setCurrentCorrect(false);
    setFeedbackMessage(null);
    showCross.value = 0;
    thumbsOpacity.value = 0;
    thumbsScale.value = 0.4;
  }, [
    correctCount,
    currentCorrect,
    finishQuiz,
    isLastQuestion,
    notAttemptedCount,
    selectedOption,
    seconds,
    showCross,
    thumbsOpacity,
    thumbsScale,
    timeSpentSeconds,
    wrongCount,
    quizBreakAdType,
    quizBreakMilestones,
    quizType,
    showRewarded,
    showRandomQuizBreakAd,
  ]);

  const handlePrevious = useCallback(() => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }

    resetQuizVoice().catch((error) => {
      console.warn('Failed to stop quiz voice before moving to previous question:', error);
    });

    if (currentIndex <= 0) {
      return;
    }

    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    setSelectedOption(null);
    setCurrentCorrect(false);
    setFeedbackMessage(null);
    showCross.value = 0;
    thumbsOpacity.value = 0;
    thumbsScale.value = 0.4;
    timeOverHandledRef.current = false;
    setShowTimeOver(false);
  }, [currentIndex, showCross, thumbsOpacity, thumbsScale]);

  const handleSelect = useCallback(
    (option) => {
      if (!quizStarted || selectedOption) {
        return;
      }

      setSelectedOption(option);

      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }

      const isCorrect = option === correctOption;
      setCurrentCorrect(isCorrect);
      const message = isCorrect ? getRandomMessage(correctMessages) : getRandomMessage(wrongMessages);
      setFeedbackMessage(message);

      if (!isVoiceMuted && isFocused) {
        const spokenFeedback = buildFeedbackSpeech({
          isCorrect,
          feedbackMessage: message,
          correctAnswer: correctOption ?? question?.answer ?? '',
          appLanguage: selectedLanguage,
        });

        speakQuizText(spokenFeedback, { interrupt: true, appLanguage: selectedLanguage }).catch((error) => {
          console.warn('Failed to speak quiz feedback:', error);
        });
      }

      if (isCorrect) {
        runThumbsAnimation();
        showCross.value = 0;
      } else {
        shakeX.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );

        showCross.value = 0;
        showCross.value = withSequence(withTiming(1.2, { duration: 150 }), withTiming(1, { duration: 100 }));
      }

      autoNextTimerRef.current = setTimeout(() => {
        handleNext();
      }, FEEDBACK_AUTO_NEXT_DELAY_MS);
    },
    [
      correctOption,
      handleNext,
      isFocused,
      isVoiceMuted,
      question?.answer,
      quizStarted,
      selectedLanguage,
      selectedOption,
      runThumbsAnimation,
      shakeX,
      showCross,
    ]
  );

  const handleStartQuiz = useCallback(() => {
    setQuizStarted(true);
  }, []);

  const elapsedSeconds = INITIAL_TIME - seconds;
  const analogMinuteRotation = `${((elapsedSeconds / INITIAL_TIME) * 360) * CLOCK_SPEED_MULTIPLIER}deg`;
  const analogSecondRotation = `${((elapsedSeconds % 60) * 6) * CLOCK_SPEED_MULTIPLIER}deg`;
  const timeProgressColors = getTimeProgressColors(seconds / INITIAL_TIME);
  const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const crossStyle = useAnimatedStyle(() => ({
    transform: [{ scale: showCross.value }],
  }));

  const thumbsStyle = useAnimatedStyle(() => ({
    opacity: thumbsOpacity.value,
    transform: [{ scale: thumbsScale.value }],
  }));

  const requestRetry = useCallback(() => {
    setQuizLoading(true);
    setQuizError(null);
    loadQuiz();
  }, [loadQuiz]);

  const attemptedQuestions = correctCount + wrongCount + (selectedOption ? 1 : 0);

  return {
    currentIndex,
    selectedOption,
    currentCorrect,
    correctCount,
    wrongCount,
    notAttemptedCount,
    timeSpentSeconds,
    feedbackMessage,
    quizData,
    quizTitle,
    selectedLanguage,
    quizLoading,
    quizError,
    isOffline,
    isSoundMuted,
    isVoiceMuted,
    attemptedQuestions,
    showTimeOver,
    quizStarted,
    totalQuestions,
    question,
    correctOption,
    isLastQuestion,
    seconds,
    elapsedSeconds,
    analogMinuteRotation,
    analogSecondRotation,
    timeProgressColors,
    shakeStyle,
    crossStyle,
    thumbsStyle,
    handleLanguageChange,
    handleSelect,
    handleNext,
    handlePrevious,
    handleStartQuiz,
    setIsSoundMuted,
    setIsVoiceMuted,
    requestRetry,
  };
};
