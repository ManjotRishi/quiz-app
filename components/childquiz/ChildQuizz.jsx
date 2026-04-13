import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Advertisement from '../Advertisement';
import TimeOverOverlay from '../TimeOverOverlay';
import QuestionClock from '../QuestionClock';
import { BackIcon, HomeIcon } from '../icons';
import {
  ChildQuizBunnyIllustration,
  ChildQuizDinoIllustration,
  ChildQuizPlaygroundIllustration,
  ChildQuizRobotIllustration,
} from '../svg';
import { ROUTES } from '../../navigation/routes';
import { INITIAL_TIME } from '../../util/constants';
import { formatTimer } from '../../util/functions';
import { fontScale, radiusScale, spaceScale } from '../../style/responsive';

const optionPalette = [
  ['#F97316', '#FB7185'],
  ['#14B8A6', '#22C55E'],
  ['#8B5CF6', '#EC4899'],
  ['#3B82F6', '#06B6D4'],
];

const stylesSeed = StyleSheet.create({
  cartoonBubbleWarm: {
    backgroundColor: 'rgba(255,214,153,0.14)',
  },
  cartoonBubbleSky: {
    backgroundColor: 'rgba(147,197,253,0.16)',
  },
  cartoonBubbleCandy: {
    backgroundColor: 'rgba(249,168,212,0.16)',
  },
  cartoonBubbleMint: {
    backgroundColor: 'rgba(134,239,172,0.14)',
  },
  cartoonArtPlayground: {
    transform: [{ translateX: -20 }, { translateY: -3 }, { rotate: '-4deg' }],
  },
  cartoonArtBright: {
    width: '138%',
    height: '138%',
    transform: [{ translateX: 10 }, { translateY: 0 }, { rotate: '6deg' }],
  },
  cartoonArtSoft: {
    width: '136%',
    height: '136%',
    transform: [{ translateX: -8 }, { translateY: 4 }, { rotate: '-5deg' }],
  },
  cartoonArtPlayful: {
    width: '142%',
    height: '142%',
    transform: [{ translateX: 4 }, { translateY: -6 }, { rotate: '3deg' }],
  },
});

const cartoonPool = [
  {
    Illustration: ChildQuizPlaygroundIllustration,
    bubbleStyle: stylesSeed.cartoonBubbleWarm,
    artStyle: stylesSeed.cartoonArtPlayground,
  },
  {
    bubbleStyle: stylesSeed.cartoonBubbleSky,
    artStyle: stylesSeed.cartoonArtBright,
    Illustration: ChildQuizDinoIllustration,
  },
  {
    bubbleStyle: stylesSeed.cartoonBubbleCandy,
    artStyle: stylesSeed.cartoonArtSoft,
    Illustration: ChildQuizBunnyIllustration,
  },
  {
    bubbleStyle: stylesSeed.cartoonBubbleMint,
    artStyle: stylesSeed.cartoonArtPlayful,
    Illustration: ChildQuizRobotIllustration,
  },
];

const pickRandomCartoons = () => {
  const shuffled = [...cartoonPool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((variant, index) => ({
    Illustration: variant.Illustration,
    bubbleStyle: variant.bubbleStyle,
    artStyle: variant.artStyle,
    index,
  }));
};

const ChildQuizz = ({
  navigation,
  currentIndex,
  selectedOption,
  currentCorrect,
  feedbackMessage,
  quizStarted,
  quizTitle,
  question,
  totalQuestions,
  correctOption,
  isLastQuestion,
  seconds,
  timeProgressColors,
  shakeStyle,
  handleSelect,
  handleNext,
  handleStartQuiz,
  showTimeOver,
}) => {
  const progressWidth = `${totalQuestions ? (seconds / INITIAL_TIME) * 100 : 0}%`;
  const thumbsScale = useSharedValue(0.4);
  const thumbsOpacity = useSharedValue(0);
  const [cartoons, setCartoons] = useState(() => pickRandomCartoons());

  useEffect(() => {
    if (!quizStarted) {
      handleStartQuiz();
    }
  }, [handleStartQuiz, quizStarted]);

  useEffect(() => {
    setCartoons(pickRandomCartoons());
  }, [currentIndex]);

  useEffect(() => {
    if (!selectedOption) {
      thumbsOpacity.value = 0;
      thumbsScale.value = 0.4;
      return;
    }

    thumbsOpacity.value = 0;
    thumbsScale.value = 0.4;
    thumbsOpacity.value = withSequence(
      withTiming(1, { duration: 180 }),
      withTiming(1, { duration: 1450 }),
      withTiming(0, { duration: 370 })
    );
    thumbsScale.value = withSequence(
      withTiming(1.16, { duration: 220 }),
      withTiming(1, { duration: 160 }),
      withTiming(1, { duration: 1250 }),
      withTiming(0.84, { duration: 370 })
    );
  }, [currentCorrect, selectedOption, thumbsOpacity, thumbsScale]);

  const thumbsStyle = useAnimatedStyle(() => ({
    opacity: thumbsOpacity.value,
    transform: [{ scale: thumbsScale.value }],
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#120A25" translucent={false} />

      <LinearGradient
        colors={['#11081F', '#22104B', '#10213E', '#071421']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View pointerEvents="none" style={styles.glowTop} />
        <View pointerEvents="none" style={styles.glowBottom} />
        <View pointerEvents="none" style={styles.starOne} />
        <View pointerEvents="none" style={styles.starTwo} />
        <View pointerEvents="none" style={styles.starThree} />

        <Animated.View style={[styles.thumbsBurstOverlay, thumbsStyle]} pointerEvents="none">
          <View style={styles.thumbsBurst}>
            <Text style={[styles.thumbEmoji, styles.thumbLeft]}>{currentCorrect ? '\uD83D\uDC4D' : '\uD83D\uDC4E'}</Text>
            <Text style={styles.thumbEmoji}>{currentCorrect ? '\uD83D\uDC4D' : '\uD83D\uDC4E'}</Text>
            <Text style={[styles.thumbEmoji, styles.thumbRight]}>{currentCorrect ? '\uD83D\uDC4D' : '\uD83D\uDC4E'}</Text>
          </View>
        </Animated.View>

        <View style={styles.bannerWrap}>
          <Advertisement banner containerStyle={styles.banner} />
        </View>

        <View style={styles.fixedPanelWrap}>
          <View style={styles.topActionRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate(ROUTES.Home))}
              style={styles.topIconButton}
            >
              <BackIcon color="#F8FAFC" size={18} />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={handleNext} style={styles.topNextButton}>
              <LinearGradient
                colors={['#FDE047', '#FB7185', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.topNextButtonFill}
              >
                <Text style={styles.topNextButtonText}>{isLastQuestion ? 'Finish' : 'Next'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate(ROUTES.Home)}
              style={styles.topIconButton}
            >
              <HomeIcon color="#F8FAFC" size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cartoonStrip}
          >
            {cartoons?.map((variant, index) => (
              <View key={`cartoon-${index}`} style={[styles.cartoonBubble, variant.bubbleStyle]}>
                <variant.Illustration style={[styles.cartoonIllustration, variant.artStyle]} />
              </View>
            ))}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.quizCard, shakeStyle]}>
            <View style={styles.progressHeader}>
              <View style={styles.progressTextWrap}>
                <Text style={styles.progressLabel}>{quizTitle || 'Little Learners Quiz'}</Text>
                <Text style={styles.progressTitle}>
                  Question {currentIndex + 1} of {totalQuestions}
                </Text>
              </View>

              <View style={styles.mascotChip}>
                <Text style={styles.mascotChipText}>{question?.mascot || 'Fun Time'}</Text>
              </View>
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeClockWrap}>
                <QuestionClock size={42} seconds={seconds ?? INITIAL_TIME} totalSeconds={INITIAL_TIME} />
              </View>
              <View style={styles.timeBar}>
                <LinearGradient
                  colors={timeProgressColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.timeFill, { width: progressWidth }]}
                />
              </View>
              <Text style={styles.timeValue}>{formatTimer(seconds ?? INITIAL_TIME)}</Text>
            </View>

            <View style={styles.questionPanel}>
              <Text style={styles.questionText}>{question?.question || ''}</Text>
              {question?.helper ? <Text style={styles.helperText}>{question.helper}</Text> : null}
            </View>

            <View style={styles.optionsGrid}>
              {question?.options?.map((option, index) => {
                const isSelected = selectedOption === option;
                const showRightAnswer = Boolean(selectedOption) && option === correctOption;
                const showWrongAnswer = Boolean(selectedOption) && isSelected && option !== correctOption;

                return (
                  <TouchableOpacity
                    key={`${currentIndex}-${option}`}
                    activeOpacity={0.9}
                    onPress={() => handleSelect(option)}
                    style={styles.optionTouchable}
                  >
                    <LinearGradient
                      colors={
                        showRightAnswer
                          ? ['#22C55E', '#14B8A6']
                          : showWrongAnswer
                            ? ['#FB7185', '#F97316']
                            : optionPalette[index % optionPalette.length]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.optionCard, isSelected ? styles.optionCardSelected : null]}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.feedbackSection}>
              {selectedOption ? (
                <View style={styles.feedbackCard}>
                  <View style={styles.feedbackRow}>
                    <Text style={[styles.feedbackTitle, currentCorrect ? styles.correctText : styles.incorrectText]}>
                      {feedbackMessage || ''}
                    </Text>
                  </View>
                  {!currentCorrect ? (
                    <Text style={styles.answerText}>Correct answer: {correctOption || question?.answer || ''}</Text>
                  ) : null}
                </View>
              ) : (
                <View style={styles.feedbackPlaceholder}>
                  <Text style={styles.feedbackPlaceholderText}>Choose one answer and keep the fun going.</Text>
                </View>
              )}
            </View>

         
          </Animated.View>
        </ScrollView>

        <TimeOverOverlay visible={showTimeOver} label="Time Over" />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#11081F',
  },
  container: {
    flex: 1,
  },
  glowTop: {
    position: 'absolute',
    top: -80,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(255,223,128,0.18)',
  },
  glowBottom: {
    position: 'absolute',
    right: -90,
    bottom: 40,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(96,165,250,0.15)',
  },
  starOne: {
    position: 'absolute',
    top: 88,
    right: 42,
    width: 12,
    height: 12,
    borderRadius: 12,
    backgroundColor: '#FDE68A',
  },
  starTwo: {
    position: 'absolute',
    top: 148,
    left: 28,
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#F9A8D4',
  },
  starThree: {
    position: 'absolute',
    top: 210,
    right: 80,
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#93C5FD',
  },
  thumbsBurstOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  thumbsBurst: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,14,28,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  thumbEmoji: {
    fontSize: fontScale(34),
    marginHorizontal: 4,
  },
  thumbLeft: {
    transform: [{ rotate: '-18deg' }],
  },
  thumbRight: {
    transform: [{ rotate: '16deg' }],
  },
  fixedPanelWrap: {
    paddingHorizontal: spaceScale(18),
    paddingTop: spaceScale(68),
    paddingBottom: spaceScale(10),
  },
  bannerWrap: {
    position: 'absolute',
    top: spaceScale(-20),
    left: spaceScale(18),
    right: spaceScale(18),
    zIndex: 20,
    elevation: 20,
  },
  banner: {
    paddingVertical: spaceScale(10),
    borderRadius: radiusScale(22),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(9, 7, 19, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  topActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceScale(10),
    marginBottom: spaceScale(12),
  },
  topIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNextButton: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
  topNextButtonFill: {
    minHeight: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  topNextButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  cartoonStrip: {
    paddingRight: spaceScale(12),
    gap: spaceScale(10),
  },
  scrollContent: {
    paddingHorizontal: spaceScale(18),
    paddingTop: spaceScale(10),
    paddingBottom: spaceScale(28),
  },
  cartoonBubble: {
    width: 108,
    height: 84,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  cartoonIllustration: {
    width: '150%',
    height: '150%',
  },
  quizCard: {
    marginTop: spaceScale(10),
    padding: spaceScale(16),
    borderRadius: radiusScale(30),
    backgroundColor: 'rgba(11,18,32,0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressTextWrap: {
    flex: 1,
  },
  progressLabel: {
    color: '#FBBF24',
    fontSize: fontScale(11),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  progressTitle: {
    marginTop: 4,
    color: '#FFFFFF',
    fontSize: fontScale(17),
    fontWeight: '800',
  },
  mascotChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  mascotChipText: {
    color: '#F8FAFC',
    fontSize: fontScale(12),
    fontWeight: '800',
  },
  questionPanel: {
    marginTop: spaceScale(16),
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: radiusScale(24),
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: fontScale(18),
    lineHeight: fontScale(25),
    fontWeight: '900',
    textAlign: 'center',
  },
  helperText: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.72)',
    fontSize: fontScale(13),
    lineHeight: fontScale(20),
    textAlign: 'center',
  },
  optionsGrid: {
    marginTop: spaceScale(16),
    gap: 12,
  },
  optionTouchable: {
    width: '100%',
  },
  optionCard: {
    minHeight: 62,
    borderRadius: radiusScale(20),
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: fontScale(17),
    fontWeight: '900',
    textAlign: 'center',
  },
  feedbackCard: {
    marginTop: spaceScale(4),
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radiusScale(20),
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackTitle: {
    fontSize: fontScale(13),
    lineHeight: fontScale(20),
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  correctText: {
    color: '#86EFAC',
  },
  incorrectText: {
    color: '#FECACA',
  },
  answerText: {
    marginTop: 8,
    color: '#FDE68A',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
    textAlign: 'center',
    fontWeight: '700',
  },
  feedbackSection: {
    marginTop: spaceScale(16),
  },
  feedbackPlaceholder: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radiusScale(20),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  feedbackPlaceholderText: {
    color: '#E2E8F0',
    fontSize: fontScale(13),
    lineHeight: fontScale(20),
    textAlign: 'center',
    fontWeight: '700',
  },
  actionTouchable: {
    marginTop: spaceScale(18),
  },
  actionButton: {
    minHeight: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: fontScale(15),
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  timeRow: {
    marginTop: 14,
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
  },
  timeFill: {
    height: '100%',
    borderRadius: 999,
  },
  timeValue: {
    marginLeft: 8,
    color: '#F8FAFC',
    fontSize: fontScale(13),
    fontWeight: '800',
    minWidth: 52,
    textAlign: 'right',
  },
});

export default ChildQuizz;
