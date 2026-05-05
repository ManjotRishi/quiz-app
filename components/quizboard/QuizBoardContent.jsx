import React, { useCallback } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import BottomBanner from '../BottomBanner';
import TimeOverOverlay from '../TimeOverOverlay';
import { EnglishShortcutIcon, HomeIcon } from '../icons';
import { INITIAL_TIME } from '../../util/constants';
import { useAdManager } from '../../hooks/useAdManager';
import { useFavouriteQuestion } from '../../hooks/useFavouriteQuestion';
import { colors } from '../../style/colors';
import { spaceScale } from '../../style/responsive';
import { ROUTES } from '../../navigation/routes';
import { resetToHomeScreen } from '../../util/navigation';
import { quizBoardStyles as styles } from './styles';
import { getQuizBoardLayout } from './layout';
import QuizBoardQuestionCard from './QuizBoardQuestionCard';
import { exportQuestionTextFile } from '../../util/questionExport';

const QuizBoardContent = ({
  navigation,
  currentIndex,
  selectedOption,
  currentCorrect,
  attemptedQuestions,
  feedbackMessage,
  selectedLanguage,
  isSoundMuted,
  isVoiceMuted,
  quizTitle,
  question,
  totalQuestions,
  correctOption,
  isLastQuestion,
  seconds,
  timeProgressColors,
  shakeStyle,
  crossStyle,
  thumbsStyle,
  handleLanguageChange,
  handleSelect,
  handleNext,
  handlePrevious,
  setIsSoundMuted,
  setIsVoiceMuted,
  showTimeOver,
  showLanguageSection = true,
  showEnglishPill = true,
  showBanner = false,
  welcomeTitle = 'Welcome to GK Quiz',
  questionPanelColors,
  questionTextColor,
  panelTitleColor,
  questionCounterColor,
  reverseQuestionMetaRow,
}) => {
  const { width, height } = useWindowDimensions();
  const layout = getQuizBoardLayout(width, height);
  const progressWidth = `${totalQuestions ? (seconds / INITIAL_TIME) * 100 : 0}%`;
  const { showInterstitial } = useAdManager();

  const favouritePayload = useCallback(() => {
    if (!question?.question) {
      return null;
    }

    return {
      quizTitle: quizTitle || welcomeTitle,
      source: 'quiz-board',
      questionText: question.question,
      answerText: correctOption ?? question?.answer ?? '',
      options: question?.options ?? [],
      questionNumber: currentIndex + 1,
      totalQuestions,
    };
  }, [correctOption, currentIndex, question, quizTitle, totalQuestions, welcomeTitle]);

  const { isFavourite, isSavingFavourite, handleSaveFavourite } = useFavouriteQuestion({
    getPayload: favouritePayload,
  });

  const handleExitNavigation = (action) => {
    const didShow = showInterstitial({
      placement: 'quiz_exit',
      attemptedQuestions,
      onClosed: action,
    });

    if (!didShow) {
      action();
    }
  };

  const handleDownload = useCallback(() => {
    exportQuestionTextFile({
      quizTitle: quizTitle || welcomeTitle,
      questionNumber: currentIndex + 1,
      totalQuestions,
      questionText: question?.question ?? '',
      options: question?.options ?? [],
      correctAnswer: correctOption ?? question?.answer ?? '',
    });
  }, [correctOption, currentIndex, question?.answer, question?.options, question?.question, quizTitle, totalQuestions, welcomeTitle]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} translucent={false} />
      <LinearGradient
        colors={[colors.background, colors.panelDark, colors.surfaceLavenderSoft, '#0A1F2B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.screenGradient}
      >
        <View pointerEvents="none" style={styles.backgroundGlowTop} />
        <View pointerEvents="none" style={styles.backgroundGlowBottom} />
        <Animated.View style={[styles.thumbsBurstOverlay, thumbsStyle]} pointerEvents="none">
          <View style={styles.thumbsBurst}>
            <Text style={[styles.thumbEmoji, styles.thumbLeft]}>👍</Text>
            <Text style={styles.thumbEmoji}>👍</Text>
            <Text style={[styles.thumbEmoji, styles.thumbRight]}>👍</Text>
          </View>
        </Animated.View>

        <View
          style={[
            styles.fixedTopSection,
            {
              paddingHorizontal: layout.contentHorizontalPadding,
              paddingTop: layout.sectionTopPadding,
              maxWidth: layout.contentMaxWidth + layout.contentHorizontalPadding * 2,
              alignSelf: 'center',
              width: '100%',
            },
          ]}
        >
          <View style={styles.topBar}>
            <View style={[styles.compactControlsWrap, { maxWidth: layout.contentMaxWidth, alignSelf: 'center' }]}>
              <View style={[styles.compactLauncherRow, { gap: layout.screenActionGap }]}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => handleExitNavigation(() => resetToHomeScreen(navigation, { name: ROUTES.Home }))}
                  style={[styles.navHomeHit, { width: layout.navButtonSize }]}
                >
                  <LinearGradient
                    colors={['rgba(13,34,50,0.96)', 'rgba(20,54,77,0.92)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.navHomeButton,
                      {
                        width: layout.navButtonSize,
                        height: layout.navButtonSize,
                        borderRadius: layout.navButtonSize / 2,
                      },
                    ]}
                  >
                    <HomeIcon color="#F8FBFF" size={layout.navIconSize} />
                  </LinearGradient>
                </TouchableOpacity>

                <View style={[styles.compactScreenActions, { gap: layout.screenActionGap }]}>
                  <TouchableOpacity activeOpacity={0.88} onPress={handlePrevious} style={styles.compactPrevHit}>
                    <LinearGradient
                      colors={['rgba(13,34,50,0.96)', 'rgba(56,189,248,0.84)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.compactPrevButton,
                        {
                          minHeight: layout.topButtonHeight,
                          borderRadius: layout.topButtonRadius,
                          paddingHorizontal: layout.isVeryNarrow ? 8 : 10,
                        },
                      ]}
                    >
                      <Text
                        allowFontScaling={false}
                        adjustsFontSizeToFit
                        minimumFontScale={0.85}
                        numberOfLines={1}
                        style={[styles.compactPrevText, { fontSize: layout.topButtonTextSize }]}
                      >
                        Previous
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.88} onPress={handleNext} style={styles.compactNextHit}>
                    <LinearGradient
                      colors={[colors.gradientStart, colors.accentGold, colors.gradientEnd]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.compactNextButton,
                        {
                          minHeight: layout.topButtonHeight,
                          borderRadius: layout.topButtonRadius,
                          paddingHorizontal: layout.isVeryNarrow ? 8 : 10,
                        },
                      ]}
                    >
                      <Text
                        allowFontScaling={false}
                        adjustsFontSizeToFit
                        minimumFontScale={0.85}
                        numberOfLines={1}
                        style={[styles.compactNextText, { fontSize: layout.topButtonTextSize }]}
                      >
                        {isLastQuestion ? 'Submit' : 'Next'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {showEnglishPill ? (
            <View style={[styles.languageActionRow, { marginTop: layout.sectionGap + 4, maxWidth: layout.contentMaxWidth, alignSelf: 'center' }]}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => resetToHomeScreen(navigation, { name: ROUTES.EnglishQuizz })}
                style={styles.englishPillHit}
              >
                <LinearGradient
                  colors={['rgba(13,34,50,0.96)', 'rgba(20,184,166,0.90)', 'rgba(251,146,60,0.84)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.englishPill,
                    {
                      minWidth: layout.isVeryNarrow ? 104 : 112,
                      paddingHorizontal: layout.isVeryNarrow ? 12 : 14,
                      paddingVertical: layout.isVeryNarrow ? 8 : 10,
                    },
                  ]}
                >
                  <View style={styles.englishPillGlow} />
                  <View style={[styles.shortcutRow, { gap: layout.sectionGap }]}>
                    <View style={styles.shortcutIconWrap}>
                      <EnglishShortcutIcon size={layout.isVeryNarrow ? 20 : 22} />
                    </View>
                    <Text
                      allowFontScaling={false}
                      adjustsFontSizeToFit
                      minimumFontScale={0.9}
                      numberOfLines={1}
                      style={[styles.englishPillText, { fontSize: layout.isVeryNarrow ? 9 : 10 }]}
                    >
                      English Quiz
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: layout.contentHorizontalPadding,
              paddingTop: layout.sectionGap + 8,
              paddingBottom: spaceScale(40),
            },
          ]}
        >
          <QuizBoardQuestionCard
            currentIndex={currentIndex}
            quizTitle={quizTitle}
            question={question}
            totalQuestions={totalQuestions}
            correctOption={correctOption}
            selectedOption={selectedOption}
            currentCorrect={currentCorrect}
            feedbackMessage={feedbackMessage}
            seconds={seconds}
            progressWidth={progressWidth}
            timeProgressColors={timeProgressColors}
            shakeStyle={shakeStyle}
            crossStyle={crossStyle}
            handleSelect={handleSelect}
            handleDownload={handleDownload}
            handleFavourite={handleSaveFavourite}
            handleSoundToggle={() => setIsSoundMuted?.((prev) => !prev)}
            handleVoiceToggle={() => setIsVoiceMuted?.((prev) => !prev)}
            isFavourite={isFavourite}
            isFavouriteLoading={isSavingFavourite}
            isSoundMuted={isSoundMuted}
            isVoiceMuted={isVoiceMuted}
            questionPanelColors={questionPanelColors}
            questionTextColor={questionTextColor}
            panelTitleColor={panelTitleColor}
            questionCounterColor={questionCounterColor}
            reverseQuestionMetaRow={reverseQuestionMetaRow}
            showLanguageSection={showLanguageSection}
            selectedLanguage={selectedLanguage}
            handleLanguageChange={handleLanguageChange}
            layout={layout}
          />
        </ScrollView>

        {showBanner ? <BottomBanner /> : null}
        <TimeOverOverlay visible={showTimeOver} label="Time Over" />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default QuizBoardContent;
