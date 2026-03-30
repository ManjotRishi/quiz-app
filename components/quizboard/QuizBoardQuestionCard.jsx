import React from 'react';
import { Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated from 'react-native-reanimated';
import AnimationListWraper from '../../animation/AnimationListWraper';
import { formatTimer } from '../../util/functions';
import { INITIAL_TIME } from '../../util/constants';
import QuestionClock from '../QuestionClock';
import { OptionTile } from '../OptionTile';
import { quizBoardStyles as styles } from './styles';

const QuizBoardQuestionCard = ({
  currentIndex,
  quizTitle,
  question,
  totalQuestions,
  correctOption,
  selectedOption,
  currentCorrect,
  feedbackMessage,
  seconds,
  progressWidth,
  timeProgressColors,
  shakeStyle,
  crossStyle,
  handleSelect,
}) => (
    <Animated.View style={[styles.quizCard, shakeStyle]}>
    <LinearGradient
      colors={['rgba(27,15,56,0.98)', 'rgba(19,10,34,0.96)', 'rgba(11,7,20,0.98)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.questionPanel}
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
        <Text style={styles.questionTitle}>{question?.question ?? ''}</Text>
      </AnimationListWraper>
    </LinearGradient>

    <View style={styles.timeRow}>
      <View style={styles.timeClockWrap}>
        <QuestionClock size={44} seconds={seconds ?? INITIAL_TIME} totalSeconds={INITIAL_TIME} />
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

    <View style={styles.optionsGroup}>
      {question?.options?.map((option, optionIndex) => (
        <AnimationListWraper key={`${currentIndex}-${option}`} index={optionIndex + 2}>
          <OptionTile
            index={optionIndex}
            option={option}
            onSelect={() => handleSelect(option)}
            isSelected={selectedOption === option}
            isCorrect={option === correctOption}
            showCorrectAnswer={Boolean(selectedOption) && !currentCorrect && option === correctOption}
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

            <Text style={[styles.feedback, currentCorrect ? styles.correct : styles.incorrect]}>
              {feedbackMessage ?? ''}
            </Text>
          </View>

          {!currentCorrect && (
            <Text style={styles.answerText}>
              Correct answer: {correctOption ?? question?.answer ?? ''}
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
);

export default QuizBoardQuestionCard;
