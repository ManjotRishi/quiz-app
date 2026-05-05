import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { useNetInfo } from '@react-native-community/netinfo';
import { SafeAreaView } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import BottomBanner from '../components/BottomBanner';
import QuizRemotePad from '../components/QuizRemotePad';
import QuestionClock from '../components/QuestionClock';
import TimeOverOverlay from '../components/TimeOverOverlay';
import {
  BackIcon,
  ClockIcon,
  HomeIcon,
  VoiceIcon,
} from '../components/icons';
import { OptionTile } from '../components/OptionTile';
import QuestionExportControls from '../components/QuestionExportControls';
import QuizLoader from '../animation/QuizLoader';
import AnimationListWraper from '../animation/AnimationListWraper';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { colors } from '../style/colors';
import {
  INITIAL_TIME,
  LISTINGDOC,
  PUZZLESCOLLECTION,
  correctMessages,
  wrongMessages,
} from '../util/constants';
import { useCountdown } from '../hooks/useCountdown';
import { useTickingSound } from '../hooks/useTickingSound';
import { calculateAccuracy, formatTimer } from '../util/functions';
import { getAvailableLanguage, getLanguageQuestions } from '../util/language';
import NetworkIssueOverlay from '../components/NetworkIssueOverlay';
import { loadWithTimeout } from '../util/loadWithTimeout';
import { syncQuizProgress } from '../util/quizStats';
import { ROUTES } from '../navigation/routes';
import { resetToHomeScreen } from '../util/navigation';
import { useAdManager } from '../hooks/useAdManager';
import { useFavouriteQuestion } from '../hooks/useFavouriteQuestion';
import { exportQuestionTextFile } from '../util/questionExport';

const getRandomMessage = (arr = []) => arr[Math.floor(Math.random() * arr.length)];

const ANSWER_INDEX = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
};

const getTimeProgressColors = (progressRatio) => {
  if (progressRatio <= 0.33) {
    return ['#FF5C5C', '#FF8A4C'];
  }

  if (progressRatio <= 0.66) {
    return ['#FFB84D', '#FFE06A'];
  }

  return ['#4BE2C5', '#7CE9F8'];
};

const resolveCorrectOption = (question) => {
  const options = question?.options ?? [];
  const answer = question?.answer;

  if (!answer) return null;
  if (options.includes(answer)) return answer;

  const normalizedAnswer = String(answer).trim().toUpperCase();
  const optionIndex = ANSWER_INDEX[normalizedAnswer];

  if (optionIndex !== undefined && options[optionIndex]) {
    return options[optionIndex];
  }

  const prefixedMatch = options.find((option) =>
    option?.trim()?.toUpperCase()?.startsWith(`${normalizedAnswer})`)
  );

  return prefixedMatch ?? null;
};

const LOAD_TIMEOUT_MS = 30000;

const TrickeyQuestions = ({ navigation }) => {
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
  const [showTimeOver, setShowTimeOver] = useState(false);
  const [quizStarted, setQuizStarted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const isFocused = useIsFocused();
  const netInfo = useNetInfo();
  const timeOverHandledRef = useRef(false);
  const autoNextTimerRef = useRef(null);
  const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
  const sessionIdRef = useRef(`tc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
  const lastQuizBreakMilestoneRef = useRef(0);
  const { showInterstitial, showRandomQuizBreakAd } = useAdManager();
  const tickButtonColors = isSoundMuted ? ['#4B5563', '#6B7280'] : ['#0EA5E9', '#14B8A6'];
  const favouritePayload = useCallback(() => {
    if (!question?.question) {
      return null;
    }

    return {
      quizTitle: quizTitle || 'Reasoning',
      source: 'tricky-questions',
      questionText: question.question,
      answerText: correctOption || question?.answer || '',
      options: question?.options || [],
      questionNumber: currentIndex + 1,
      totalQuestions,
    };
  }, [correctOption, currentIndex, question, quizTitle, totalQuestions]);
  const {
    isFavourite,
    isSavingFavourite,
    handleSaveFavourite,
  } = useFavouriteQuestion({ getPayload: favouritePayload });

  const shakeX = useSharedValue(0);
  const showCross = useSharedValue(0);
  const thumbsScale = useSharedValue(0.4);
  const thumbsOpacity = useSharedValue(0);


  const getTodayQuiz = useCallback(async () => {
    try {
      const docSnap = await firestore().collection(PUZZLESCOLLECTION).doc(LISTINGDOC).get();

      if (!docSnap?.exists) {
        return { questions: [], title: '' };
      }

      const data = docSnap?.data() ?? {};

      return {
        questions: data.questions ?? [],
        title: data.title ?? '',
      };
    } catch (error) {
      console.log('Error fetching puzzle questions:', error);
      throw error;
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'App needs access to your notifications so you can get updates',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
      } catch (error) {
        console.warn(error);
      }
    }
  }, []);

  const loadQuiz = useCallback(async () => {
    try {
      setQuizError(null);
      setQuizLoading(true);

      if (isOffline) {
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
      console.log('Failed to load tricky questions:', error);
      setQuizError(error);
      setQuizData([]);
      setQuizTitle('');
    } finally {
      setQuizLoading(false);
    }
  }, [getTodayQuiz, isOffline]);

  useEffect(() => {
    loadQuiz();
    requestNotificationPermission();
  }, [loadQuiz, requestNotificationPermission]);

  useEffect(() => {
    if (isOffline) {
      setQuizError(new Error('No internet connection. Please check your network and try again.'));
      setQuizLoading(false);
    }
  }, [isOffline]);

  useEffect(() => {
    const availableLanguage = getAvailableLanguage(quizData, selectedLanguage);
    if (availableLanguage !== selectedLanguage) {
      setSelectedLanguage(availableLanguage);
    }
  }, [quizData, selectedLanguage]);

  const questions = useMemo(
    () => getLanguageQuestions(quizData, selectedLanguage),
    [quizData, selectedLanguage]
  );
  const totalQuestions = questions.length;
  const question = questions[currentIndex];
  const attemptedQuestions = correctCount + wrongCount + (selectedOption ? 1 : 0);
  const correctOption = resolveCorrectOption(question);
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleLanguageChange = useCallback((language) => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }

    const targetQuestions = getLanguageQuestions(quizData, language);
    const targetTotal = targetQuestions?.length ?? 0;
    const nextIndex = targetTotal > 0 ? Math.min(currentIndex, targetTotal - 1) : 0;

    setSelectedLanguage(language);
    setCurrentIndex(nextIndex);
    setSelectedOption(null);
    setCurrentCorrect(false);
    setFeedbackMessage(null);
  }, [currentIndex, quizData]);

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
        quizType: 'tc',
        totalQuestions,
        correctAnswers: finalCorrectCount,
        wrongAnswers: finalWrongCount,
        notAttemptedAnswers: finalNotAttemptedCount,
        isComplete: true,
      });
      navigation.replace(ROUTES.Score, {
        quizType: 'tc',
        quizLabel: 'Reasoning',
        totalQuestions,
        correctAnswers: finalCorrectCount,
        wrongAnswers: finalWrongCount,
        notAttemptedAnswers: finalNotAttemptedCount,
        timeTakenSeconds: finalTimeTakenSeconds,
        accuracy,
        fromQuizFlow: true,
      });
    },
    [navigation, totalQuestions]
  );

  const handleExitNavigation = useCallback((action) => {
    const didShow = showInterstitial({
      placement: 'quiz_exit',
      attemptedQuestions,
      onClosed: action,
    });

    if (!didShow) {
      action();
    }
  }, [attemptedQuestions, showInterstitial]);

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

  const runThumbsAnimation = () => {
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
  };

  const handleSelect = (option) => {
    if (!quizStarted || selectedOption) {
      return;
    }

    setSelectedOption(option);
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
    }

    const isCorrect = option === correctOption;
    setCurrentCorrect(isCorrect);
    setFeedbackMessage(
      isCorrect ? getRandomMessage(correctMessages) : getRandomMessage(wrongMessages)
    );

    if (isCorrect) {
      runThumbsAnimation();
      showCross.value = 0;
      return;
    }

    shakeX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );

    showCross.value = 0;
    showCross.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withTiming(1, { duration: 100 })
    );

    autoNextTimerRef.current = setTimeout(() => {
      handleNext();
    }, 2000);
  };

  const handleNext = () => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }

    const spentSeconds = INITIAL_TIME - seconds;
    const hasSelection = Boolean(selectedOption);
    const nextCorrectCount = correctCount + (hasSelection && currentCorrect ? 1 : 0);
    const nextWrongCount = wrongCount + (hasSelection && !currentCorrect ? 1 : 0);
    const nextNotAttemptedCount = notAttemptedCount + (hasSelection ? 0 : 1);
    const nextTimeSpentSeconds = timeSpentSeconds + spentSeconds;
    const nextAttemptedQuestions = nextCorrectCount + nextWrongCount;

    syncQuizProgress({
      sessionId: sessionIdRef.current,
      quizType: 'tc',
      totalQuestions,
      correctAnswers: nextCorrectCount,
      wrongAnswers: nextWrongCount,
      notAttemptedAnswers: nextNotAttemptedCount,
    });

    setCorrectCount(nextCorrectCount);
    setWrongCount(nextWrongCount);
    setNotAttemptedCount(nextNotAttemptedCount);
    setTimeSpentSeconds(nextTimeSpentSeconds);

    const milestone =
      nextAttemptedQuestions > 0 && nextAttemptedQuestions % 5 === 0 ? nextAttemptedQuestions : 0;

    if (milestone > 0) {
      const { didShow, milestone: shownMilestone } = showRandomQuizBreakAd({
        attemptedQuestions: milestone,
        lastShownMilestone: lastQuizBreakMilestoneRef.current,
        onClosed: () => {
          if (isLastQuestion) {
            finishQuiz({
              finalCorrectCount: nextCorrectCount,
              finalWrongCount: nextWrongCount,
              finalNotAttemptedCount: nextNotAttemptedCount,
              finalTimeTakenSeconds: nextTimeSpentSeconds,
            });
          }
        },
      });

      if (didShow && shownMilestone) {
        lastQuizBreakMilestoneRef.current = shownMilestone;
      }

      if (isLastQuestion && didShow) {
        return;
      }
    }

    if (isLastQuestion) {
      finishQuiz({
        finalCorrectCount: nextCorrectCount,
        finalWrongCount: nextWrongCount,
        finalNotAttemptedCount: nextNotAttemptedCount,
        finalTimeTakenSeconds: nextTimeSpentSeconds,
      });
      return;
    }

    setCurrentIndex(prev => prev + 1);
    setSelectedOption(null);
    setCurrentCorrect(false);
    setFeedbackMessage(null);
    showCross.value = 0;
    thumbsOpacity.value = 0;
    thumbsScale.value = 0.4;
  };

  const handleStartQuiz = useCallback(() => {
    setQuizStarted(true);
  }, []);

  const handleDownload = useCallback(() => {
    exportQuestionTextFile({
      quizTitle: quizTitle || 'Reasoning',
      questionNumber: currentIndex + 1,
      totalQuestions,
      questionText: question?.question || '',
      options: question?.options || [],
      correctAnswer: correctOption || question?.answer || '',
    });
  }, [correctOption, currentIndex, question?.answer, question?.options, question?.question, quizTitle, totalQuestions]);

  const timeProgressColors = getTimeProgressColors(seconds / INITIAL_TIME);

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

  if (quizLoading) {
    return (
      <SafeAreaView style={styles.loadingSafeArea}>
        <QuizLoader isLoading={quizLoading} />
      </SafeAreaView>
    );
  }

  if (quizError) {
    const errorMessage = isOffline
      ? 'You are offline right now. Please reconnect to continue.'
      : 'The quiz is taking too long to load. Please try again.';

    return (
      <SafeAreaView style={styles.loadingSafeArea}>
        <NetworkIssueOverlay
          visible
          title="Unable to load Tricky Questions"
          message={errorMessage}
          actionLabel="Try Again"
          onRetry={loadQuiz}
        />
      </SafeAreaView>
    );
  }

  if (!totalQuestions) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No tricky questions available yet</Text>
          <Text style={styles.emptyText}>Come back later for today&apos;s puzzels set.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} translucent={false} />

      <LinearGradient
        colors={['#04020A', '#1A0B33', '#250D4A', '#09102A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.screenGradient}
      >
        <View style={styles.bubbleOne} />
        <View style={styles.bubbleTwo} />
        <View style={styles.bubbleThree} />
        <Animated.View style={[styles.thumbsBurstOverlay, thumbsStyle]} pointerEvents="none">
          <View style={styles.thumbsBurst}>
            <Text style={[styles.thumbEmoji, styles.thumbLeft]}>👍</Text>
            <Text style={styles.thumbEmoji}>👍</Text>
            <Text style={[styles.thumbEmoji, styles.thumbRight]}>👍</Text>
          </View>
        </Animated.View>

        <View style={styles.fixedTopSection}>
          <View style={styles.topBar}>
            <View style={styles.compactControlsWrap}>
              <View style={styles.compactLauncherRow}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() =>
                    handleExitNavigation(() => resetToHomeScreen(navigation, { name: ROUTES.Home }))
                  }
                  style={styles.compactControlsButtonHit}
                >
                  <LinearGradient
                    colors={['rgba(19,25,54,0.96)', 'rgba(37,99,235,0.90)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.compactControlsButton}
                  >
                    <HomeIcon color="#F4F7FF" size={18} />
                    <Text style={styles.compactControlsButtonText}>{showControls ? '×' : '☰'}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.compactScreenActions}>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => {
                      if (autoNextTimerRef.current) {
                        clearTimeout(autoNextTimerRef.current);
                        autoNextTimerRef.current = null;
                      }
                      if (currentIndex <= 0) {
                        return;
                      }
                      setSelectedOption(null);
                      setCurrentCorrect(false);
                      setFeedbackMessage(null);
                      setCurrentIndex((prev) => Math.max(prev - 1, 0));
                      setShowTimeOver(false);
                      timeOverHandledRef.current = false;
                    }}
                    style={styles.compactPrevHit}
                  >
                    <LinearGradient
                      colors={['rgba(19,25,54,0.96)', 'rgba(56,189,248,0.88)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.compactPrevButton}
                    >
                      <Text numberOfLines={1} style={styles.compactPrevText}>Previous</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.88} onPress={handleNext} style={styles.compactNextHit}>
                    <LinearGradient
                      colors={['#F97316', '#FB7185', '#7C3AED']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.compactNextButton}
                    >
                      <Text numberOfLines={1} style={styles.compactNextText}>{isLastQuestion ? 'Submit' : 'Next'}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>

              {showControls ? (
                <View style={styles.compactControlsPanel}>
                  <QuizRemotePad
                    singleRow
                    left={{
                      onPress: () =>
                        handleExitNavigation(() => resetToHomeScreen(navigation, { name: ROUTES.Home })),
                      children: <HomeIcon color="#F4F7FF" size={20} />,
                    }}
                    top={{
                      onPress: () => {},
                      active: false,
                      colors: ['#4B5563', '#6B7280'],
                      children: <VoiceIcon muted color="#F4F7FF" size={20} />,
                    }}
                    center={{
                      onPress: () => setIsSoundMuted((prev) => !prev),
                      colors: tickButtonColors,
                      children: <ClockIcon muted={isSoundMuted} color="#F4F7FF" size={20} />,
                    }}
                  />
                </View>
              ) : null}
            </View>
          </View>

        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.quizCard, shakeStyle]}>
            <LinearGradient
              colors={['#F2FFF4', '#EBFAEF', '#F8FFF8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.questionPanel}
              key={currentIndex}
            >
              <AnimationListWraper key={`q-${currentIndex}`} index={0}>
                <View style={styles.questionMetaRow}>
                  {quizTitle ? <Text style={styles.panelTitle}>{quizTitle}</Text> : <View />}
                  <Text style={styles.questionCounterText}>
                    {currentIndex + 1}/{totalQuestions}
                  </Text>
                </View>
              </AnimationListWraper>
              <AnimationListWraper key={`qt-${currentIndex}`} index={1}>
                <Text style={styles.questionTitle}>{question?.question || ''}</Text>
              </AnimationListWraper>

              <View style={styles.questionActionRow}>
                <QuestionExportControls
                  onPressSound={() => setIsSoundMuted((prev) => !prev)}
                  onPressDownload={handleDownload}
                  onPressFavourite={handleSaveFavourite}
                  favourited={isFavourite}
                  favouriteLoading={isSavingFavourite}
                  soundMuted={isSoundMuted}
                  voiceMuted
                  showSound
                  showVoice
                  voiceDisabled
                  variant="lightPanel"
                />
              </View>

              <AnimationListWraper key={`ql-${currentIndex}`} index={2}>
                <View style={styles.questionLanguageSection}>
                  <LanguageSwitcher value={selectedLanguage} onChange={handleLanguageChange} />
                </View>
              </AnimationListWraper>
            </LinearGradient>

            <View style={styles.timeRow}>
              <View style={styles.timeClockWrap}>
                <QuestionClock size={40} seconds={seconds} totalSeconds={INITIAL_TIME} />
              </View>
              <View style={styles.timeBar}>
                <LinearGradient
                  colors={timeProgressColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.timeFill, { width: `${(seconds / INITIAL_TIME) * 100}%` }]}
                />
              </View>
              <Text style={styles.timeValue}>{formatTimer(seconds)}</Text>
            </View>

            <View style={styles.optionsGroup}>
              {question?.options?.map((option, optionIndex) => (
                <AnimationListWraper key={`${currentIndex}-${option}`} index={optionIndex + 3}>
                  <OptionTile
                    index={optionIndex}
                    option={option}
                    onSelect={() => handleSelect(option)}
                    isSelected={selectedOption === option}
                    isCorrect={option === correctOption}
                    showCorrectAnswer={
                      Boolean(selectedOption) && !currentCorrect && option === correctOption
                    }
                  />
                </AnimationListWraper>
              ))}
            </View>

            <View style={styles.feedbackSection}>
              {selectedOption ? (
                <View style={styles.feedbackCard}>
                  <View style={styles.feedbackRow}>
                    {!currentCorrect && (
                      <Animated.View style={[styles.crossCircle, crossStyle]}>
                        <Text style={styles.crossText}>✕</Text>
                      </Animated.View>
                    )}

                    <Text
                      style={[
                        styles.feedback,
                        currentCorrect ? styles.correct : styles.incorrect,
                      ]}
                    >
                      {feedbackMessage || ''}
                    </Text>
                  </View>

                  {!currentCorrect && (
                    <Text style={styles.answerText}>
                      Correct answer: {correctOption || question?.answer || ''}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={styles.feedbackPlaceholder}>
                  <Text style={styles.feedbackPlaceholderText}>
                    Pick the clever answer and move to the next puzzle.
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        </ScrollView>
        <BottomBanner />
        <TimeOverOverlay visible={showTimeOver} label="Time Over" />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default TrickeyQuestions;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenGradient: {
    flex: 1,
  },
  bubbleOne: {
    position: 'absolute',
    top: -110,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(84,150,255,0.10)',
  },
  bubbleTwo: {
    position: 'absolute',
    top: 180,
    left: -30,
    width: 76,
    height: 76,
    borderRadius: 76,
    backgroundColor: 'rgba(255,214,102,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  bubbleThree: {
    position: 'absolute',
    bottom: 140,
    right: '16%',
    width: 28,
    height: 28,
    borderRadius: 28,
    backgroundColor: 'rgba(84,150,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(84,150,255,0.14)',
  },
  fixedTopSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  compactControlsWrap: {
    position: 'relative',
    alignItems: 'flex-start',
    width: '100%',
  },
  compactLauncherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  compactControlsButtonHit: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
  },
  compactControlsButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  compactControlsButtonText: {
    color: 'transparent',
    fontSize: 0,
    fontWeight: '900',
    lineHeight: 0,
  },
  compactScreenActions: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactEnglishHit: {
    flex: 1,
    minWidth: 0,
  },
  compactEnglishButton: {
    minHeight: 42,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    shadowColor: '#E953B8',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  compactEnglishText: {
    color: '#F8F4FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  compactNextHit: {
    flex: 1,
    minWidth: 0,
  },
  compactPrevHit: {
    flex: 1,
    minWidth: 0,
  },
  compactPrevButton: {
    minHeight: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  compactPrevText: {
    color: '#F8FBFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  compactNextButton: {
    minHeight: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  compactNextText: {
    color: '#F8F4FF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  compactControlsPanel: {
    marginTop: 10,
    width: '100%',
  },
  compactClockGlyph: {
    color: '#F4F7FF',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 20,
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  headerEyebrow: {
    color: 'rgba(220,232,255,0.90)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  headerTitle: {
    marginTop: 2,
    color: '#F4F7FF',
    fontSize: 20,
    fontWeight: '800',
  },
  remoteEmoji: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F4F7FF',
  },
  remoteLabel: {
    color: '#F4F7FF',
    fontSize: 16,
    fontWeight: '900',
  },
  speakerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    marginLeft: 8,
  },
  speakerGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNextButton: {
    width: 92,
    marginLeft: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockWrap: {
    width: 58,
    alignItems: 'flex-start',
  },
  clockFace: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(124,233,248,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  clockTick: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: 'rgba(124,233,248,0.7)',
    top: 4,
  },
  clockHandWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
  },
  minuteHand: {
    width: 2.5,
    height: 18,
    borderRadius: 999,
    backgroundColor: colors.gradientStart,
    marginTop: 10,
  },
  secondHand: {
    width: 1.5,
    height: 22,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    marginTop: 6,
  },
  clockCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gradientStart,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 10,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  quizCard: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 32,
    padding: 12,
    shadowColor: '#0A102E',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
    overflow: 'hidden',
  },
  thumbsBurstOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  thumbsBurst: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  thumbEmoji: {
    fontSize: 40,
    marginHorizontal: 4,
  },
  thumbLeft: {
    transform: [{ rotate: '-18deg' }],
  },
  thumbRight: {
    transform: [{ rotate: '16deg' }],
  },
  questionPanel: {
 minHeight: 100,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    backgroundColor: '#F2FFF4',
    position: 'relative',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.12)',
  },
  questionCounterText: {
    color: '#1B3B2C',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.3,
    alignSelf: 'flex-end',
    textAlign: 'right',
  },
  panelTitle: {
    color: '#5C7D66',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    flex: 1,
    marginRight: 10,
  },
  questionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionTitle: {
    color: '#183728',
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '700',
  },
  questionActionRow: {
    marginTop: 14,
    alignItems: 'flex-end',
  },
  questionLanguageSection: {
    marginTop: 12,
  },
  timeRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeClockWrap: {
    width: 44,
    height: 44,
    marginRight: 8,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBar: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  timeFill: {
    height: '100%',
    borderRadius: 999,
  },
  timeValue: {
    marginLeft: 8,
    color: '#F4F7FF',
    fontSize: 13,
    fontWeight: '700',
    minWidth: 52,
    textAlign: 'right',
    lineHeight: 16,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  optionsGroup: {
    marginTop: 16,
  },
  feedbackSection: {
    marginTop: 16,
  },
  feedbackCard: {
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crossCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF7F63',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  crossText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  feedback: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  correct: {
    color: colors.success,
  },
  incorrect: {
    color: '#FF7F63',
  },
  answerText: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackPlaceholder: {
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(124,233,248,0.18)',
  },
  feedbackPlaceholderText: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
