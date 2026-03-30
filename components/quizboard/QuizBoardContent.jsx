import React, { useState } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import QuizRemotePad from '../QuizRemotePad';
import TimeOverOverlay from '../TimeOverOverlay';
import StartQuizOverlay from '../StartQuizOverlay';
import { CurrentAffairsIcon, HomeIcon, SpeakerIcon, VoiceIcon } from '../icons';
import LanguageSwitcher from '../LanguageSwitcher';
import { INITIAL_TIME } from '../../util/constants';
import { colors } from '../../style/colors';
import { ROUTES } from '../../navigation/routes';
import { quizBoardStyles as styles } from './styles';
import QuizBoardQuestionCard from './QuizBoardQuestionCard';

const QuizBoardContent = ({
  navigation,
  currentIndex,
  selectedOption,
  currentCorrect,
  feedbackMessage,
  selectedLanguage,
  isSoundMuted,
  isVoiceMuted,
  quizStarted,
  quizTitle,
  question,
  totalQuestions,
  correctOption,
  isLastQuestion,
  seconds,
  timeProgressColors,
  shakeStyle,
  crossStyle,
  handleLanguageChange,
  handleSelect,
  handleNext,
  handleStartQuiz,
  setIsSoundMuted,
  setIsVoiceMuted,
  showTimeOver,
  showLanguageSection = true,
  showEnglishPill = true,
  showCompactEnglishButton = true,
  showEnglishTutorialButton = true,
  compactControls = false,
  welcomeTitle = 'Welcome to GK Quiz',
}) => {
  const progressWidth = `${totalQuestions ? (seconds / INITIAL_TIME) * 100 : 0}%`;
  const [showControls, setShowControls] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} translucent={false} />
      <LinearGradient
        colors={['#04020A', '#1A0B33', '#250D4A', '#09102A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.screenGradient}
      >
        <View pointerEvents="none" style={styles.backgroundGlowTop} />
        <View pointerEvents="none" style={styles.backgroundGlowBottom} />

        <View style={styles.fixedTopSection}>
          <View style={styles.topBar}>
            {compactControls ? (
              <>
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
                      {showCompactEnglishButton ? (
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
                      ) : null}

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
                        top={{
                          onPress: () => setIsSoundMuted?.((prev) => !prev),
                          children: <SpeakerIcon muted={isSoundMuted} color="#F4F7FF" size={20} />,
                        }}
                        extra={{
                          onPress: () => setIsVoiceMuted?.((prev) => !prev),
                          label: '',
                          children: <VoiceIcon muted={isVoiceMuted} color="#F4F7FF" size={45} />,
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
                          onPress: () => navigation.navigate(ROUTES.GkBoard),
                          children: <CurrentAffairsIcon color="#F4F7FF" size={18} />,
                        }}
                      />
                    </View>
                  ) : null}
                </View>
              </>
            ) : (
              <QuizRemotePad
                top={{
                  onPress: () => setIsSoundMuted?.((prev) => !prev),
                  children: <SpeakerIcon muted={isSoundMuted} color="#F4F7FF" size={20} />,
                }}
                extra={{
                  onPress: () => setIsVoiceMuted?.((prev) => !prev),
                  label: '',
                  children: <VoiceIcon muted={isVoiceMuted} color="#F4F7FF" size={45} />,
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
                  onPress: () => navigation.navigate(ROUTES.GkBoard),
                  children: <CurrentAffairsIcon color="#F4F7FF" size={18} />,
                }}
              />
            )}
          </View>

          {showLanguageSection ? (
            <View style={styles.languageActionRow}>
              {showEnglishPill ? (
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => navigation.navigate(ROUTES.EnglishQuizz)}
                  style={styles.englishPillHit}
                >
                  <LinearGradient
                    colors={['rgba(19,25,54,0.96)', 'rgba(139,92,246,0.88)', 'rgba(244,114,182,0.82)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.englishPill}
                  >
                    <View style={styles.englishPillGlow} />
                    <Text style={styles.englishPillText}>English Quizz</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : null}

              <View style={styles.languageSection}>
                <LanguageSwitcher value={selectedLanguage} onChange={handleLanguageChange} />
              </View>

            </View>
          ) : null}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
          />
        </ScrollView>

        <TimeOverOverlay visible={showTimeOver} label="Time Over" />
        <StartQuizOverlay
          visible={!quizStarted}
          title={welcomeTitle}
          subtitle="Tap Start when you are ready. The timer, sound, and auto-advance will begin after that."
          onStart={handleStartQuiz}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default QuizBoardContent;
