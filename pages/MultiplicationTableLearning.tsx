import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BottomBanner from '../components/BottomBanner';
import SpeakerIcon from '../components/icons/SpeakerIcon';
import { generateTableQuestions, TableQuestion } from '../constants/childLearning';
import { ROUTES } from '../navigation/routes';
import { RootStackParamList } from '../navigation/types';
import { resetQuizVoice, speakQuizText } from '../audioManager/quizTts';
import { colors } from '../style/colors';
import { fontScale, radiusScale, spaceScale } from '../style/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'MultiplicationTableLearning'>;

const AUTO_ADVANCE_DELAY_MS = 4300;
const TABLE_TTS_RATE = 0.32;
const TABLE_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const MultiplicationTableLearning = ({ navigation }: Props) => {
  const tableQuestions = useMemo(() => generateTableQuestions(), []);
  const [selectedTable, setSelectedTable] = useState<number>(2);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredQuestions = useMemo(
    () => tableQuestions.filter((question) => question.table === selectedTable),
    [selectedTable, tableQuestions]
  );
  const totalQuestions = filteredQuestions.length;
  const currentQuestion = filteredQuestions[currentIndex];
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const clearAutoAdvanceTimeout = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
  }, []);

  const speakQuestion = useCallback(
    async (question: TableQuestion = currentQuestion, showUnavailableAlert = true) => {
      if (isMuted || !question) {
        return false;
      }

      const didSpeak = await speakQuizText(question.speechText, {
        interrupt: true,
        appLanguage: 'English',
        rate: TABLE_TTS_RATE,
      });

      if (!didSpeak && showUnavailableAlert) {
        Alert.alert('Voice unavailable', 'Text to speech is not supported on this device right now.');
      }

      return didSpeak;
    },
    [currentQuestion, isMuted]
  );

  const goNext = useCallback(() => {
    clearAutoAdvanceTimeout();
    void resetQuizVoice();
    setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
  }, [clearAutoAdvanceTimeout, totalQuestions]);

  const goPrevious = useCallback(() => {
    clearAutoAdvanceTimeout();
    void resetQuizVoice();
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, [clearAutoAdvanceTimeout]);

  const handleToggleAutomatic = useCallback(() => {
    setIsAutoPlaying((prev) => {
      const nextValue = !prev;

      if (!nextValue) {
        clearAutoAdvanceTimeout();
        void resetQuizVoice();
      }

      return nextValue;
    });
  }, [clearAutoAdvanceTimeout]);

  const handleSelectTable = useCallback(
    (table: number) => {
      clearAutoAdvanceTimeout();
      void resetQuizVoice();
      setIsAutoPlaying(false);
      setSelectedTable(table);
      setCurrentIndex(0);
    },
    [clearAutoAdvanceTimeout]
  );

  useEffect(() => {
    return () => {
      clearAutoAdvanceTimeout();
      void resetQuizVoice();
    };
  }, [clearAutoAdvanceTimeout]);

  useEffect(() => {
    if (!isMuted) {
      return;
    }

    void resetQuizVoice();
  }, [isMuted]);

  useEffect(() => {
    clearAutoAdvanceTimeout();

    if (!isAutoPlaying || !currentQuestion) {
      return;
    }

    let isCancelled = false;

    const runAutomaticPlayback = async () => {
      if (!isMuted) {
        await speakQuestion(currentQuestion, false);

        if (isCancelled) {
          return;
        }
      } else {
        await resetQuizVoice();
      }

      if (currentIndex >= totalQuestions - 1) {
        setIsAutoPlaying(false);
        return;
      }

      autoAdvanceTimeoutRef.current = setTimeout(() => {
        setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
      }, AUTO_ADVANCE_DELAY_MS);
    };

    void runAutomaticPlayback();

    return () => {
      isCancelled = true;
      clearAutoAdvanceTimeout();
    };
  }, [clearAutoAdvanceTimeout, currentIndex, currentQuestion, isAutoPlaying, isMuted, speakQuestion, totalQuestions]);

  useEffect(() => {
    if (!isLastQuestion || !isAutoPlaying) {
      return;
    }

    setIsAutoPlaying(false);
  }, [isAutoPlaying, isLastQuestion]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedTable]);

  const handleManualSpeak = useCallback(() => {
    if (isMuted) {
      return;
    }

    void speakQuestion(currentQuestion);
  }, [currentQuestion, isMuted, speakQuestion]);

  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate(ROUTES.ChildSection);
  }, [navigation]);

  if (!currentQuestion) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#071A26', '#113246', '#1B4B61']} style={styles.container}>
        <View style={styles.glowOne} pointerEvents="none" />
        <View style={styles.glowTwo} pointerEvents="none" />

        <View style={styles.fixedPanelWrap}>
          <View style={styles.topActionRow}>
            <TouchableOpacity activeOpacity={0.9} onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.topTitle}>Table Learning</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.learningCard}>
            <View style={styles.progressRow}>
              <View style={styles.progressChip}>
                <Text style={styles.progressChipText}>
                  {currentIndex + 1}/{totalQuestions}
                </Text>
              </View>

              <View style={styles.progressChip}>
                <Text style={styles.progressChipText}>Table {currentQuestion.table}</Text>
              </View>
            </View>

            <LinearGradient
              colors={['#FDE68A', '#FB7185', '#38BDF8']}
              start={{ x: 0.08, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tableFrame}
            >
              <View style={styles.tableGlowOne} />
              <View style={styles.tableGlowTwo} />

              <TouchableOpacity activeOpacity={0.9} onPress={handleMuteToggle} style={styles.muteButton}>
                <View style={styles.muteButtonInner}>
                  <SpeakerIcon muted={isMuted} size={18} />
                </View>
              </TouchableOpacity>

              <Text
                allowFontScaling={false}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                numberOfLines={1}
                style={styles.expressionText}
              >
                {currentQuestion.displayQuestion}
              </Text>
              <Text style={styles.answerText}>{currentQuestion.answer}</Text>
            </LinearGradient>

            <Text style={styles.wordText}>MULTIPLICATION TABLES</Text>
            <Text style={styles.helperText}>
              Listen, repeat, and move step by step from 2 to 10.
            </Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={isFirstQuestion}
                onPress={goPrevious}
                style={styles.actionButtonTouch}
              >
                <LinearGradient
                  colors={
                    isFirstQuestion
                      ? ['rgba(148,163,184,0.6)', 'rgba(100,116,139,0.6)']
                      : ['rgba(18,52,73,0.96)', 'rgba(56,189,248,0.86)']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButton}
                >
                  <Text numberOfLines={1} adjustsFontSizeToFit style={styles.actionButtonText}>
                    Previous
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.92}
                disabled={isMuted}
                onPress={handleManualSpeak}
                style={styles.actionButtonTouch}
              >
                <LinearGradient
                  colors={
                    isMuted
                      ? ['rgba(148,163,184,0.6)', 'rgba(100,116,139,0.6)']
                      : ['#14B8A6', '#38BDF8']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButton}
                >
                  <Text numberOfLines={1} adjustsFontSizeToFit style={styles.actionButtonText}>
                    Speak
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={isLastQuestion}
                onPress={goNext}
                style={styles.actionButtonTouch}
              >
                <LinearGradient
                  colors={
                    isLastQuestion
                      ? ['rgba(148,163,184,0.6)', 'rgba(100,116,139,0.6)']
                      : ['#FDE047', '#FB7185', '#8B5CF6']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButton}
                >
                  <Text numberOfLines={1} adjustsFontSizeToFit style={styles.actionButtonText}>
                    Next
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.92} onPress={handleToggleAutomatic} style={styles.autoPlayButtonTouch}>
            <LinearGradient
              colors={isAutoPlaying ? ['#0F766E', '#14B8A6'] : ['#1E293B', '#334155']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.autoPlayButton}
            >
              <Text style={styles.autoPlayButtonText}>
                {isAutoPlaying ? 'Stop Automatic' : 'Start Automatic'}
              </Text>
              <Text style={styles.autoPlayHintText}>
                {isAutoPlaying
                  ? 'Speaking each table line and moving forward automatically.'
                  : `Start very slow speaking for table ${selectedTable} from ${selectedTable} x 1 to ${selectedTable} x 10.`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.tablePickerSection}>
            <Text style={styles.tablePickerTitle}>Choose Table</Text>

            <View style={styles.tablePickerGrid}>
              {TABLE_OPTIONS.map((table) => {
                const isSelected = table === selectedTable;

                return (
                  <TouchableOpacity
                    key={table}
                    activeOpacity={0.92}
                    onPress={() => handleSelectTable(table)}
                    style={styles.tablePickerTouch}
                  >
                    <LinearGradient
                      colors={isSelected ? ['#14B8A6', '#38BDF8'] : ['rgba(255,255,255,0.95)', 'rgba(241,245,249,0.92)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.tablePickerChip, isSelected ? styles.tablePickerChipSelected : null]}
                    >
                      <Text style={[styles.tablePickerChipText, isSelected ? styles.tablePickerChipTextSelected : null]}>
                        {table}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <BottomBanner style={styles.bottomBanner} />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  glowOne: {
    position: 'absolute',
    top: -70,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(56,189,248,0.18)',
  },
  glowTwo: {
    position: 'absolute',
    bottom: -60,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(245,196,81,0.16)',
  },
  fixedPanelWrap: {
    paddingHorizontal: spaceScale(18),
    paddingTop: spaceScale(16),
    paddingBottom: spaceScale(10),
  },
  topActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spaceScale(10),
  },
  backButton: {
    minHeight: 42,
    minWidth: 74,
    paddingHorizontal: spaceScale(16),
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  backButtonText: {
    color: '#F8FBFF',
    fontSize: fontScale(13),
    fontWeight: '900',
  },
  topTitle: {
    color: '#F8FBFF',
    fontSize: fontScale(18),
    fontWeight: '900',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spaceScale(18),
    paddingTop: spaceScale(8),
    paddingBottom: spaceScale(20),
  },
  learningCard: {
    marginTop: spaceScale(4),
    borderRadius: radiusScale(30),
    padding: spaceScale(18),
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceScale(10),
  },
  progressChip: {
    minHeight: 34,
    paddingHorizontal: spaceScale(14),
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F7F7',
  },
  progressChipText: {
    color: '#173042',
    fontSize: fontScale(12),
    fontWeight: '900',
  },
  tableFrame: {
    marginTop: spaceScale(16),
    width: '100%',
    minHeight: 220,
    borderRadius: radiusScale(28),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spaceScale(18),
    paddingVertical: spaceScale(24),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  tableGlowOne: {
    position: 'absolute',
    top: -20,
    right: -10,
    width: 90,
    height: 90,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  tableGlowTwo: {
    position: 'absolute',
    bottom: -30,
    left: -16,
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  muteButton: {
    position: 'absolute',
    top: spaceScale(14),
    right: spaceScale(14),
  },
  muteButtonInner: {
    width: 40,
    height: 40,
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  expressionText: {
    color: '#FFFFFF',
    fontSize: fontScale(34),
    lineHeight: fontScale(40),
    fontWeight: '900',
    textAlign: 'center',
    width: '100%',
    textShadowColor: 'rgba(12,25,43,0.28)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  answerText: {
    marginTop: spaceScale(12),
    color: '#FFFFFF',
    fontSize: fontScale(68),
    lineHeight: fontScale(74),
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(12,25,43,0.3)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 10,
  },
  wordText: {
    marginTop: spaceScale(18),
    color: '#173042',
    fontSize: fontScale(24),
    lineHeight: fontScale(28),
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  helperText: {
    marginTop: spaceScale(8),
    color: '#6F8794',
    fontSize: fontScale(13),
    lineHeight: fontScale(20),
    textAlign: 'center',
  },
  actionRow: {
    marginTop: spaceScale(18),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceScale(8),
  },
  actionButtonTouch: {
    flex: 1,
    minWidth: 0,
  },
  actionButton: {
    minHeight: 50,
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spaceScale(8),
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(13),
    fontWeight: '900',
    letterSpacing: 0.2,
    paddingHorizontal: 2,
  },
  autoPlayButtonTouch: {
    marginTop: spaceScale(14),
    marginBottom: spaceScale(8),
  },
  autoPlayButton: {
    width: '100%',
    borderRadius: radiusScale(24),
    paddingHorizontal: spaceScale(18),
    paddingVertical: spaceScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoPlayButtonText: {
    color: '#F8FBFF',
    fontSize: fontScale(16),
    fontWeight: '900',
    textAlign: 'center',
  },
  autoPlayHintText: {
    marginTop: spaceScale(6),
    color: 'rgba(241,245,249,0.82)',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
    fontWeight: '700',
    textAlign: 'center',
  },
  tablePickerSection: {
    marginTop: spaceScale(16),
    marginBottom: spaceScale(10),
  },
  tablePickerTitle: {
    marginBottom: spaceScale(10),
    color: '#F8FBFF',
    fontSize: fontScale(14),
    fontWeight: '900',
    textAlign: 'center',
  },
  tablePickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    rowGap: spaceScale(10),
    columnGap: '3.5%',
  },
  tablePickerTouch: {
    width: '31%',
    minWidth: 84,
  },
  tablePickerChip: {
    minHeight: 46,
    borderRadius: radiusScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spaceScale(6),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  tablePickerChipSelected: {
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },
  tablePickerChipText: {
    color: '#173042',
    fontSize: fontScale(18),
    fontWeight: '900',
    textAlign: 'center',
  },
  tablePickerChipTextSelected: {
    color: '#FFFFFF',
  },
  bottomBanner: {
    paddingTop: 8,
  },
});

export default MultiplicationTableLearning;
