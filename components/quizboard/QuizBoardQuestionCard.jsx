import React from 'react';
import { Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated from 'react-native-reanimated';
import AnimationListWraper from '../../animation/AnimationListWraper';
import { formatTimer } from '../../util/functions';
import { INITIAL_TIME } from '../../util/constants';
import QuestionClock from '../QuestionClock';
import { OptionTile } from '../OptionTile';
import QuestionExportControls from '../QuestionExportControls';
import LanguageSwitcher from '../LanguageSwitcher';
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
  handleDownload,
  handleFavourite,
  handleSoundToggle,
  handleVoiceToggle,
  isFavourite,
  isFavouriteLoading,
  isSoundMuted,
  isVoiceMuted,
  questionPanelColors,
  questionTextColor,
  panelTitleColor,
  questionCounterColor,
  reverseQuestionMetaRow,
  showLanguageSection,
  selectedLanguage,
  handleLanguageChange,
  layout,
}) => {
  const questionText = question?.question ?? '';
  const useCompactQuestionText = questionText.length > 120;
  const questionTitleStyle = layout
    ? {
        fontSize: useCompactQuestionText ? layout.longQuestionTitleFontSize : layout.questionTitleFontSize,
        lineHeight: useCompactQuestionText ? layout.longQuestionTitleLineHeight : layout.questionTitleLineHeight,
      }
    : null;

  return (
    <Animated.View
      style={[
        styles.quizCard,
        shakeStyle,
        layout
          ? {
              marginTop: layout.questionCardMarginTop,
              padding: layout.questionCardPadding,
              maxWidth: layout.contentMaxWidth,
              alignSelf: 'center',
              width: '100%',
            }
          : null,
      ]}
    >
      <LinearGradient
        colors={questionPanelColors ?? ['#F6FCFF', '#EFFAF8', '#FFF8EF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.questionPanel,
          layout
            ? {
                borderRadius: layout.questionPanelRadius,
                paddingHorizontal: layout.questionPanelPaddingHorizontal,
                paddingTop: layout.questionPanelPaddingTop,
                paddingBottom: layout.questionPanelPaddingBottom,
              }
            : null,
        ]}
      >
        <AnimationListWraper key={`q-${currentIndex}`} index={0}>
          <View
            style={[
              styles.questionMetaRow,
              reverseQuestionMetaRow ? styles.questionMetaRowReversed : null,
            ]}
          >
            {quizTitle ? (
              <Text
                allowFontScaling={false}
                style={[
                  styles.panelTitle,
                  reverseQuestionMetaRow ? styles.panelTitleRight : null,
                  panelTitleColor ? { color: panelTitleColor } : null,
                  layout ? { fontSize: layout.panelTitleFontSize } : null,
                ]}
              >
                {quizTitle}
              </Text>
            ) : <View />}
            <Text
              allowFontScaling={false}
              style={[
                styles.questionCounterText,
                questionCounterColor ? { color: questionCounterColor } : null,
                layout ? { fontSize: layout.questionCounterFontSize } : null,
              ]}
            >
              {currentIndex + 1}/{totalQuestions}
            </Text>
          </View>
        </AnimationListWraper>

        <AnimationListWraper key={`qt-${currentIndex}`} index={1}>
          <Text
            allowFontScaling={false}
            style={[
              styles.questionTitle,
              questionTextColor ? { color: questionTextColor } : null,
              questionTitleStyle,
            ]}
          >
            {questionText}
          </Text>
        </AnimationListWraper>

        <View style={[styles.questionActionRow, layout ? { marginTop: layout.questionActionsMarginTop } : null]}>
          <QuestionExportControls
            onPressSound={handleSoundToggle}
            onPressVoice={handleVoiceToggle}
            onPressDownload={handleDownload}
            onPressFavourite={handleFavourite}
            favourited={isFavourite}
            favouriteLoading={isFavouriteLoading}
            soundMuted={isSoundMuted}
            voiceMuted={isVoiceMuted}
            showSound
            showVoice
            variant="lightPanel"
            compact={layout?.isVeryNarrow}
            buttonSize={layout?.questionControlButtonSize}
            iconSize={layout?.questionControlIconSize}
            gap={layout?.questionControlGap}
          />
        </View>

        {showLanguageSection ? (
          <AnimationListWraper key={`ql-${currentIndex}`} index={2}>
            <View style={[styles.questionLanguageSection, layout ? { marginTop: layout.questionLanguageMarginTop } : null]}>
              <View style={styles.questionLanguageHeaderRow}>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.questionLanguageHeading,
                    layout ? { fontSize: layout.languageHeadingFontSize } : null,
                  ]}
                >
                  Read question in
                </Text>
              </View>
              <LanguageSwitcher
                value={selectedLanguage}
                onChange={handleLanguageChange}
                layout={layout}
                variant="segmentedLight"
              />
            </View>
          </AnimationListWraper>
        ) : null}
      </LinearGradient>

      <View style={[styles.timeRow, layout ? { marginTop: layout.timeRowMarginTop } : null]}>
        <View
          style={[
            styles.timeClockWrap,
            layout ? { width: layout.timeClockSize, height: layout.timeClockSize } : null,
          ]}
        >
          <QuestionClock size={layout?.timeClockSize ?? 44} seconds={seconds ?? INITIAL_TIME} totalSeconds={INITIAL_TIME} />
        </View>
        <View style={[styles.timeBar, layout ? { height: layout.timeBarHeight } : null]}>
          <LinearGradient
            colors={timeProgressColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.timeFill, { width: progressWidth }]}
          />
        </View>
        <Text
          allowFontScaling={false}
          style={[
            styles.timeValue,
            layout
              ? {
                  fontSize: layout.timeValueFontSize,
                  minWidth: layout.timeValueMinWidth,
                }
              : null,
          ]}
        >
          {formatTimer(seconds ?? INITIAL_TIME)}
        </Text>
      </View>

      <View style={[styles.optionsGroup, layout ? { marginTop: layout.optionsMarginTop } : null]}>
        {question?.options?.map((option, optionIndex) => (
          <AnimationListWraper key={`${currentIndex}-${option}`} index={optionIndex + 3}>
            <OptionTile
              index={optionIndex}
              option={option}
              onSelect={() => handleSelect(option)}
              isSelected={selectedOption === option}
              isCorrect={option === correctOption}
              showCorrectAnswer={Boolean(selectedOption) && !currentCorrect && option === correctOption}
              layout={layout}
            />
          </AnimationListWraper>
        ))}
      </View>

      <View style={[styles.feedbackSection, layout ? { marginTop: layout.feedbackMarginTop } : null]}>
        {selectedOption ? (
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackRow}>
              {!currentCorrect && (
                <Animated.View style={[styles.crossCircle, crossStyle]}>
                  <Text style={styles.crossText}>x</Text>
                </Animated.View>
              )}

              <Text
                allowFontScaling={false}
                style={[
                  styles.feedback,
                  currentCorrect ? styles.correct : styles.incorrect,
                  layout
                    ? {
                        fontSize: layout.feedbackFontSize,
                        lineHeight: layout.feedbackLineHeight,
                      }
                    : null,
                ]}
              >
                {feedbackMessage ?? ''}
              </Text>
            </View>

            {!currentCorrect && (
              <Text
                allowFontScaling={false}
                style={[
                  styles.answerText,
                  layout
                    ? {
                        fontSize: layout.answerTextFontSize,
                        lineHeight: layout.answerTextLineHeight,
                      }
                    : null,
                ]}
              >
                Correct answer: {correctOption ?? question?.answer ?? ''}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.feedbackPlaceholder}>
            <Text allowFontScaling={false} style={styles.feedbackPlaceholderText}>
              Choose your answer, then tap next.
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export default QuizBoardQuestionCard;
