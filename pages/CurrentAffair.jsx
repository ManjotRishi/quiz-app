import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
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
import QuizRemotePad from '../components/QuizRemotePad';
import QuestionClock from '../components/QuestionClock';
import TimeOverOverlay from '../components/TimeOverOverlay';
import StartQuizOverlay from '../components/StartQuizOverlay';
import { BackIcon, EnglishQuizIcon, HomeIcon, SpeakerIcon } from '../components/icons';
import { OptionTile } from '../components/OptionTile';
import QuizLoader from '../animation/QuizLoader';
import AnimationListWraper from '../animation/AnimationListWraper';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { colors } from '../style/colors';
import { CURRENTAFFAIRCOLLECTION, INITIAL_TIME, LISTINGDOC, correctMessages, wrongMessages } from '../util/constants';
import { useCountdown } from '../hooks/useCountdown';
import { useTickingSound } from '../hooks/useTickingSound';
import { calculateAccuracy, formatTimer } from '../util/functions';
import { getAvailableLanguage, getLanguageQuestions } from '../util/language';
import NetworkIssueOverlay from '../components/NetworkIssueOverlay';
import { loadWithTimeout } from '../util/loadWithTimeout';
import { recordQuizResult } from '../util/quizStats';
import { ROUTES } from '../navigation/routes';

const getRandomMessage = (arr = []) =>
  arr[Math.floor(Math.random() * arr.length)];

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

const LOAD_TIMEOUT_MS = 15000;

const CurrentAffairs = ({ navigation }) => {
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
  const [quizStarted, setQuizStarted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const isFocused = useIsFocused();
  const netInfo = useNetInfo();
  const timeOverHandledRef = useRef(false);
  const autoNextTimerRef = useRef(null);
  const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;


  const getTodayQuiz = useCallback(async () => {
    try {
      const docSnap = await firestore()
        .collection(CURRENTAFFAIRCOLLECTION)
        .doc(LISTINGDOC)
        .get();

      if (!docSnap?.exists) {
        return { questions: [], title: '' };
      }

      const data = docSnap?.data() ?? {};

      return {
        questions: data.questions ?? [],
        title: data.title ?? '',
      };
    } catch (error) {
      console.log('Error fetching GK quiz:', error);
      throw error;
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
      console.log('Failed to load GK quiz:', error);
      setQuizError(error);
      setQuizData([]);
      setQuizTitle('');
    } finally {
      setQuizLoading(false);
    }
  }, [getTodayQuiz, isOffline]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

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

  const shakeX = useSharedValue(0);
  const showCross = useSharedValue(0);
  const thumbsScale = useSharedValue(0.4);
  const thumbsOpacity = useSharedValue(0);

  const questions = useMemo(
    () => getLanguageQuestions(quizData, selectedLanguage),
    [quizData, selectedLanguage]
  );
  const totalQuestions = questions.length;
  const question = questions[currentIndex];
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
    showCross.value = 0;
    thumbsOpacity.value = 0;
    thumbsScale.value = 0.4;
  }, [currentIndex, quizData, showCross, thumbsOpacity, thumbsScale]);

  const finishQuiz = useCallback(
    ({
      finalCorrectCount,
      finalWrongCount,
      finalNotAttemptedCount,
      finalTimeTakenSeconds,
    }) => {
      const accuracy = calculateAccuracy(finalCorrectCount, totalQuestions);
      recordQuizResult({
        quizType: 'ca',
        correctAnswers: finalCorrectCount,
        wrongAnswers: finalWrongCount,
      });
      navigation.replace(ROUTES.Score, {
        quizType: 'ca',
        quizLabel: 'CA',
        totalQuestions,
        correctAnswers: finalCorrectCount,
        wrongAnswers: finalWrongCount,
        notAttemptedAnswers: finalNotAttemptedCount,
        timeTakenSeconds: finalTimeTakenSeconds,
        accuracy,
      });
    },
    [navigation, totalQuestions]
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
      isCorrect
        ? getRandomMessage(correctMessages)
        : getRandomMessage(wrongMessages)
    );

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
      showCross.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withTiming(1, { duration: 100 })
      );
    }

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

    setCorrectCount(nextCorrectCount);
    setWrongCount(nextWrongCount);
    setNotAttemptedCount(nextNotAttemptedCount);
    setTimeSpentSeconds(nextTimeSpentSeconds);

    if (isLastQuestion) {
      finishQuiz({
        finalCorrectCount: nextCorrectCount,
        finalWrongCount: nextWrongCount,
        finalNotAttemptedCount: nextNotAttemptedCount,
        finalTimeTakenSeconds: nextTimeSpentSeconds,
      });
      return;
    }

    setCurrentIndex((prev) => prev + 1);
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

  const progressPercent = useMemo(
    () => (totalQuestions ? ((currentIndex + 1) / totalQuestions) * 100 : 0),
    [currentIndex, totalQuestions]
  );

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
          title="Unable to load Current Affairs"
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
          <Text style={styles.emptyTitle}>No quiz available yet</Text>
          <Text style={styles.emptyText}>Come back later for today&apos;s set of questions.</Text>
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
                  activeOpacity={0.86}
                  onPress={() => setShowControls((prev) => !prev)}
                  style={styles.compactControlsButtonHit}
                >
                  <LinearGradient
                    colors={
                      showControls
                        ? ['#8B5CF6', '#60A5FA']
                        : ['rgba(19,25,54,0.96)', 'rgba(37,99,235,0.90)']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.compactControlsButton}
                  >
                    <Text style={styles.compactControlsButtonText}>{showControls ? '×' : '☰'}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.compactScreenActions}>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => navigation.navigate(ROUTES.EnglishQuizz)}
                    style={styles.compactEnglishHit}
                  >
                    <LinearGradient
                      colors={['rgba(19,25,54,0.96)', 'rgba(139,92,246,0.88)', 'rgba(244,114,182,0.82)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.compactEnglishButton}
                    >
                      <Text style={styles.compactEnglishText}>English Quizz</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.88} onPress={handleNext} style={styles.compactNextHit}>
                    <LinearGradient
                      colors={['#F97316', '#FB7185', '#7C3AED']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.compactNextButton}
                    >
                      <Text style={styles.compactNextText}>{isLastQuestion ? 'Submit' : 'Next'}</Text>
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
                        (navigation.canGoBack() ? navigation.goBack() : navigation.navigate(ROUTES.Home)),
                      children: <BackIcon color="#F4F7FF" size={20} />,
                    }}
                    top={{
                      onPress: () => setIsSoundMuted((prev) => !prev),
                      children: <SpeakerIcon muted={isSoundMuted} color="#F4F7FF" size={20} />,
                    }}
                    center={{
                      onPress: () => navigation.navigate(ROUTES.Home),
                      children: <HomeIcon color="#F4F7FF" size={20} />,
                    }}
                    right={{
                      onPress: () => navigation.navigate(ROUTES.TrickeyQuestions),
                      children: <Text style={styles.remoteEmoji}>💡</Text>,
                    }}
                    bottom={{
                      onPress: () => navigation.navigate(ROUTES.QuizBoard),
                      children: <Text style={styles.remoteLabel}>Q</Text>,
                    }}
                    extra={{
                      onPress: () => navigation.navigate(ROUTES.EnglishQuizz),
                      children: <EnglishQuizIcon color="#F4F7FF" size={18} />,
                    }}
                  />
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.languageSection}>
            <LanguageSwitcher value={selectedLanguage} onChange={handleLanguageChange} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={[styles.quizCard, shakeStyle]}>
            <LinearGradient
              colors={['rgba(27,15,56,0.98)', 'rgba(19,10,34,0.96)', 'rgba(11,7,20,0.98)']}
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
                <AnimationListWraper key={`${currentIndex}-${option}`} index={optionIndex + 1}>
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
                    Choose your answer, then tap next.
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          <View style={styles.progressShell}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </ScrollView>
        <TimeOverOverlay visible={showTimeOver} label="Time Over" />
        <StartQuizOverlay
          visible={!quizStarted}
          title="Welcome to Current Affairs"
          subtitle="Press Start to begin the CA timer, sound, and question flow."
          onStart={handleStartQuiz}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default CurrentAffairs;

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
  fixedTopSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
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
    color: '#F8F4FF',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 20,
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
    height: 42,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  compactNextHit: {
    flex: 1,
    minWidth: 0,
  },
  compactNextButton: {
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  compactControlsPanel: {
    marginTop: 10,
    width: '100%',
  },
  languageSection: {
    marginTop: 16,
    alignItems: 'center',
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
  headerIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    shadowColor: '#0A102E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 2,
  },
  headerIconGradient: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  topNextButton: {
    minWidth: 92,
  },
  clockWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#0A102E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  clockFace: {
    flex: 1,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,233,248,0.55)',
  },
  clockTick: {
    position: 'absolute',
    width: 2,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(124,233,248,0.7)',
    top: 4,
  },
  clockHandWrap: {
    position: 'absolute',
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  minuteHand: {
    width: 4,
    height: 18,
    borderRadius: 999,
    backgroundColor: colors.gradientStart,
    marginTop: 10,
  },
  secondHand: {
    width: 2,
    height: 22,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    marginTop: 6,
  },
  clockCenter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gradientStart,
  },
  quizCard: {
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 32,
    padding: 12,
    shadowColor: '#0A102E',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
  questionPanel: {
    borderRadius: 32,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    backgroundColor: colors.panelDark,
    position: 'relative',
    shadowColor: '#0A102E',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 5,
  },
  questionCounterText: {
    color: '#F4F7FF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.3,
    alignSelf: 'flex-end',
    textAlign: 'right',
  },
  panelTitle: {
    color: 'rgba(244,247,255,0.72)',
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
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '800',
    color: '#F4F7FF',
    letterSpacing: -0.5,
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
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignSelf: 'center',
  },
  timeFill: {
    height: '100%',
    borderRadius: 999,
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F4F7FF',
    marginLeft: 8,
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
    minHeight: 112,
    justifyContent: 'center',
    marginTop: 12,
  },
  feedbackCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crossCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7F63',
    marginRight: 12,
  },
  crossText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  feedback: {
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '700',
  },
  correct: {
    color: '#48D0A6',
  },
  incorrect: {
    color: '#FF7F63',
  },
  answerText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    fontWeight: '600',
  },
  feedbackPlaceholder: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(124,233,248,0.18)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  feedbackPlaceholderText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  progressShell: {
    marginTop: 26,
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.gradientStart,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F4F7FF',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
