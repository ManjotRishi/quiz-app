import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View, PermissionsAndroid, } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientButton } from '../components/GradientButton';
import { OptionTile } from '../components/OptionTile';
import { colors } from '../style/colors';
import { quizQuestions, INITIAL_TIME, correctMessages, wrongMessages, COLLECTION_NAME } from '../util/constants';
import { useCountdown } from '../hooks/useCountdown';
import { formatTimer, calculateAccuracy } from '../util/functions';
import { RootStackParamList } from '../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import { getUniqueId, getManufacturer } from 'react-native-device-info';
// import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';


import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizBoard'>;


const getRandomMessage = (arr: string[]) =>
  arr[Math.floor(Math.random() * arr.length)];

const QuizBoard = ({ navigation }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentCorrect, setCurrentCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);


  useEffect(() => {
    const init = async () => {
      try {
        await messaging().requestPermission();
        const token = await messaging().getToken();
        const id = await getUniqueId();
        if (!token) return;
        await firestore()
          .collection(COLLECTION_NAME)
          .doc(token)
          .set({
            token,
            platform: Platform.OS,
            updatedAt: new Date(),
          });
        console.log("Token saved successfully");

      } catch (error) {
        console.log("Error saving token:", error);
      }
    };
    init();
  }, []);


  useEffect(() => {
    requestNotificationPermission()
    const unsubscribe = messaging().onTokenRefresh(async token => {
      await firestore()
        .collection(COLLECTION_NAME)
        .doc(token)
        .set({
          token,
          updatedAt: new Date(),
        });
    });

    return unsubscribe;
  }, []);


  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'App needs access to your notifications so you can get updates',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can receive notifications');
        } else {
          console.log('Notification permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };



  // 🔥 Animations
  const shakeX = useSharedValue(0);
  const showCross = useSharedValue(0);

  const totalQuestions = quizQuestions.length;
  const question = quizQuestions[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const finishQuiz = useCallback(
    (finalCorrectCount: number, timeTaken: number) => {
      const accuracy = calculateAccuracy(finalCorrectCount, totalQuestions);
      navigation.replace('Score', {
        totalQuestions,
        correctAnswers: finalCorrectCount,
        timeTakenSeconds: timeTaken,
        accuracy,
      });
    },
    [navigation, totalQuestions],
  );

  const handleExpire = useCallback(() => {
    const finishedCorrect = correctCount + (currentCorrect ? 1 : 0);
    finishQuiz(finishedCorrect, INITIAL_TIME);
  }, [correctCount, currentCorrect, finishQuiz]);

  const { seconds } = useCountdown({
    start: INITIAL_TIME,
    onExpire: handleExpire,
  });

  const handleSelect = (option: string) => {
    setSelectedOption(option);

    const isCorrect = option === question.answer;
    setCurrentCorrect(isCorrect);

    setFeedbackMessage(
      isCorrect
        ? getRandomMessage(correctMessages)
        : getRandomMessage(wrongMessages)
    );

    if (!isCorrect) {
      // 💥 shake animation
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );

      // ❌ pop animation
      showCross.value = 0;
      showCross.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withTiming(1, { duration: 100 })
      );
    }
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const nextCorrectCount = correctCount + (currentCorrect ? 1 : 0);
    setCorrectCount(nextCorrectCount);

    if (isLastQuestion) {
      const timeTaken = INITIAL_TIME - seconds;
      finishQuiz(nextCorrectCount, timeTaken);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setCurrentCorrect(false);
    setFeedbackMessage(null);
    showCross.value = 0;
  };

  const progressPercent = useMemo(
    () => ((currentIndex + 1) / totalQuestions) * 100,
    [currentIndex, totalQuestions]
  );

  // 🎬 Animated styles
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const crossStyle = useAnimatedStyle(() => ({
    transform: [{ scale: showCross.value }],
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <View style={styles.progressWrapper}>
          <Text style={styles.progressText}>
            Question {currentIndex + 1} of {totalQuestions}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* 🔥 Animated Card */}
        <Animated.View style={[styles.card, shakeStyle]}>

          <Text style={styles.questionTitle}>{question.question}</Text>

          {question?.options?.map((option) => (
            <OptionTile
              key={option}
              option={option}
              onSelect={() => handleSelect(option)}
              isSelected={selectedOption === option}
              isCorrect={
                selectedOption === option ? option === question.answer : false
              }
            />
          ))}

          {selectedOption && (
            <View style={styles.feedbackContainer}>

              <View style={styles.feedbackRow}>

                {/* ❌ Inline Icon */}
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
                  {feedbackMessage}
                </Text>

              </View>

              {!currentCorrect && (
                <Text style={styles.answerText}>
                  Correct answer: {question?.answer}
                </Text>
              )}

            </View>
          )}
        </Animated.View>
      </ScrollView>

      <GradientButton
        label={isLastQuestion ? 'Submit' : 'Next'}
        onPress={handleNext}
        disabled={!selectedOption}
        style={styles.nextButton}
      />
    </SafeAreaView>
  );
};

export default QuizBoard;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  progressWrapper: {
    flex: 1,
  },

  progressText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 6,
  },

  progressBar: {
    height: 6,
    backgroundColor: colors.optionBorder,
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.electricBlue,
  },

  timerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: colors.deepPurple,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    bottom: 20,
  },

  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
  },

  scrollContent: {
    paddingBottom: 16,
  },

  card: {
    borderRadius: 28,
    backgroundColor: '#fff',
    padding: 24,
    shadowColor: colors.deepPurple,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },

  questionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 12,
  },

  feedbackContainer: {
    marginTop: 16,
    alignItems: 'center',
  },

  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  crossCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF4D4F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  crossText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },

  feedback: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  correct: {
    color: colors.success,
  },

  incorrect: {
    color: colors.danger,
  },

  answerText: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textMuted,
  },

  nextButton: {
    marginBottom: 12,
  },
});