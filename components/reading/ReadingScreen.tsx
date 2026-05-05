import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomBanner from '../BottomBanner';
import LanguageSwitcher from '../LanguageSwitcher';
import { HomeIcon, VoiceIcon } from '../icons';
import { ROUTES } from '../../navigation/routes';
import { colors } from '../../style/colors';
import { fontScale, radiusScale, spaceScale } from '../../style/responsive';
import { speakQuizText, stopQuizVoice } from '../../audioManager/quizTts';
import { CHILD_READING_REWARDED_COOLDOWN_MS } from '../../util/adMobConfig';
import { useRewardedScreenEntryAd } from '../../hooks/useRewardedScreenEntryAd';

export type ReadingLanguage = 'English' | 'Hindi';

type ReadingContent = {
  titleByLanguage: Record<ReadingLanguage, string>;
  subtitle: string;
  badge: string;
  textByLanguage: Record<ReadingLanguage, string>;
};

type ReadingScreenProps = {
  navigation: {
    canGoBack: () => boolean;
    goBack: () => void;
    navigate: (route: string) => void;
  };
  content: ReadingContent;
  entryRewardPlacement?: string;
};

const LANGUAGE_OPTIONS = [
  { key: 'English', label: 'English' },
  { key: 'Hindi', label: 'Hindi' },
] as const;

const SCROLL_SPEED_MS: Record<ReadingLanguage, number> = {
  English: 460,
  Hindi: 520,
};

const SPEECH_RATE: Record<ReadingLanguage, number> = {
  English: 0.42,
  Hindi: 0.4,
};

const countWords = (value: string) => (value.match(/\S+/g) ?? []).length;

const findCharIndexForWordCount = (value: string, targetWordCount: number) => {
  if (targetWordCount <= 0) {
    return 0;
  }

  const matcher = /\S+/g;
  let match: RegExpExecArray | null = null;
  let seen = 0;

  while ((match = matcher.exec(value)) !== null) {
    seen += 1;

    if (seen >= targetWordCount) {
      return match.index + match[0].length;
    }
  }

  return value.length;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const ReadingScreen = ({ navigation, content, entryRewardPlacement }: ReadingScreenProps) => {
  const { height } = useWindowDimensions();
  const [selectedLanguage, setSelectedLanguage] = useState<ReadingLanguage>('English');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [currentWordCount, setCurrentWordCount] = useState(0);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const readerScrollRef = useRef<ScrollView | null>(null);
  const currentWordCountRef = useRef(0);
  const progressStartedAtRef = useRef(0);

  const activeText = content.textByLanguage[selectedLanguage] ?? content.textByLanguage.English;
  const activeTitle = content.titleByLanguage[selectedLanguage] ?? content.titleByLanguage.English;
  const wordCount = useMemo(() => countWords(activeText), [activeText]);

  const cardHeight = clamp(height * 0.64, 410, 600);
  const isFinished = wordCount > 0 && currentWordCount >= wordCount;
  const playbackProgress = wordCount > 0 ? currentWordCount / wordCount : 0;

  useRewardedScreenEntryAd({
    enabled: Boolean(entryRewardPlacement),
    placement: entryRewardPlacement,
    attemptedQuestions: 1,
    cooldownMs: CHILD_READING_REWARDED_COOLDOWN_MS,
  });

  const cleanupProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const syncReaderPosition = useCallback((nextCount: number) => {
    currentWordCountRef.current = nextCount;
    setCurrentWordCount(nextCount);

    if (viewportHeight > 0 && contentHeight > viewportHeight && wordCount > 0) {
      const progress = nextCount / wordCount;
      const nextOffset = Math.max(0, (contentHeight - viewportHeight) * progress);
      readerScrollRef.current?.scrollTo({ y: nextOffset, animated: true });
    }
  }, [contentHeight, viewportHeight, wordCount]);

  const playSpeechFromWordCount = useCallback(async (startingWordCount: number) => {
    if (isVoiceMuted) {
      return true;
    }

    const startCharIndex = findCharIndexForWordCount(activeText, startingWordCount);
    const remainingText = activeText.slice(startCharIndex).trimStart();

    if (!remainingText) {
      return false;
    }

    return speakQuizText(remainingText, {
      interrupt: true,
      appLanguage: selectedLanguage,
      rate: SPEECH_RATE[selectedLanguage],
    });
  }, [activeText, isVoiceMuted, selectedLanguage]);

  const resetPlayback = useCallback(() => {
    cleanupProgressTimer();
    setIsPlaying(false);
    currentWordCountRef.current = 0;
    setCurrentWordCount(0);
    progressStartedAtRef.current = 0;
    readerScrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [cleanupProgressTimer]);

  const startAutoScroll = useCallback((startingWordCount: number) => {
    cleanupProgressTimer();
    progressStartedAtRef.current = Date.now();
    syncReaderPosition(startingWordCount);

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - progressStartedAtRef.current;
      const extraWords = Math.max(0, Math.floor(elapsed / SCROLL_SPEED_MS[selectedLanguage]));
      const nextCount = Math.min(wordCount, startingWordCount + extraWords);
      syncReaderPosition(nextCount);

      if (nextCount >= wordCount) {
        cleanupProgressTimer();
        setIsPlaying(false);
        stopQuizVoice().catch(() => undefined);
      }
    }, 120);
  }, [cleanupProgressTimer, selectedLanguage, syncReaderPosition, wordCount]);

  const stopPlayback = useCallback(async () => {
    cleanupProgressTimer();
    setIsPlaying(false);
    await stopQuizVoice();
  }, [cleanupProgressTimer]);

  const startPlayback = useCallback(async () => {
    await stopQuizVoice();
    setIsPlaying(true);
    currentWordCountRef.current = 0;
    setCurrentWordCount(0);
    readerScrollRef.current?.scrollTo({ y: 0, animated: false });
    startAutoScroll(0);

    const spoken = await playSpeechFromWordCount(0);
    if (!spoken && !isVoiceMuted) {
      await stopQuizVoice();
    }
  }, [isVoiceMuted, playSpeechFromWordCount, startAutoScroll]);

  const resumePlayback = useCallback(async () => {
    if (currentWordCountRef.current >= wordCount) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    startAutoScroll(currentWordCountRef.current);

    const spoken = await playSpeechFromWordCount(currentWordCountRef.current);
    if (!spoken && !isVoiceMuted) {
      await stopQuizVoice();
    }
  }, [isVoiceMuted, playSpeechFromWordCount, startAutoScroll, wordCount]);

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      await stopPlayback();
      return;
    }

    if (isFinished) {
      currentWordCountRef.current = 0;
    }

    if (currentWordCountRef.current > 0 && currentWordCountRef.current < wordCount) {
      await resumePlayback();
      return;
    }

    await startPlayback();
  }, [isFinished, isPlaying, resumePlayback, startPlayback, stopPlayback, wordCount]);

  const handleVoiceMuteToggle = useCallback(async () => {
    const nextMuted = !isVoiceMuted;
    setIsVoiceMuted(nextMuted);

    if (!isPlaying) {
      if (nextMuted) {
        await stopQuizVoice();
      }
      return;
    }

    if (nextMuted) {
      await stopQuizVoice();
      return;
    }

    const spoken = await playSpeechFromWordCount(currentWordCountRef.current);
    if (!spoken) {
      await stopQuizVoice();
    }
  }, [isPlaying, isVoiceMuted, playSpeechFromWordCount]);

  useEffect(() => {
    stopQuizVoice().catch(() => undefined);
    resetPlayback();
  }, [activeText, resetPlayback]);

  const handleContentLayout = (event: LayoutChangeEvent) => {
    setContentHeight(event.nativeEvent.layout.height);
  };

  const handleViewportLayout = (event: LayoutChangeEvent) => {
    setViewportHeight(event.nativeEvent.layout.height);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} translucent={false} />
      <LinearGradient colors={['#071A26', '#113246', '#1B4B61']} style={styles.screenGradient}>
        <View pointerEvents="none" style={styles.backgroundGlowTop} />
        <View pointerEvents="none" style={styles.backgroundGlowBottom} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => navigation.navigate(ROUTES.Home)}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => navigation.navigate(ROUTES.Home)}
              style={styles.iconButton}
            >
              <HomeIcon color="#F4F7FF" size={18} style={undefined} />
            </TouchableOpacity>
          </View>

          <View style={styles.languageSection}>
            <LanguageSwitcher
              value={selectedLanguage}
              style={undefined}
              options={LANGUAGE_OPTIONS as unknown as { key: string; label: string }[]}
              onChange={(language: string) => setSelectedLanguage(language as ReadingLanguage)}
            />
          </View>

          <View style={styles.playerHero}>
            <Text style={styles.readerBadge}>{content.badge}</Text>
            <Text style={styles.readerTitle}>{activeTitle}</Text>
            <Text style={styles.readerSubtitle}>{content.subtitle}</Text>

            <View style={styles.playerInfoRow}>
              <View style={styles.infoChip}>
                <Text style={styles.infoValue}>{selectedLanguage}</Text>
                <Text style={styles.infoLabel}>Language</Text>
              </View>
              <View style={styles.infoChip}>
                <Text style={styles.infoValue}>{wordCount}</Text>
                <Text style={styles.infoLabel}>Words</Text>
              </View>
              <View style={styles.infoChip}>
                <Text style={styles.infoValue}>{isPlaying ? 'On' : 'Off'}</Text>
                <Text style={styles.infoLabel}>Listen Mode</Text>
              </View>
            </View>
          </View>

          <View style={[styles.readerCard, { minHeight: cardHeight, maxHeight: cardHeight }]}>
            <View style={styles.playerControlsRow}>
              <TouchableOpacity activeOpacity={0.9} onPress={togglePlayback} style={styles.playButtonHit}>
                <LinearGradient
                  colors={isPlaying ? ['#0EA5E9', '#14B8A6'] : ['#14B8A6', '#FB923C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.playButton}
                >
                  <Text style={styles.playButtonText}>
                    {isPlaying ? 'Pause TTS' : isFinished ? 'Replay TTS' : 'Start TTS'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.9} onPress={handleVoiceMuteToggle} style={styles.voiceButtonWrap}>
                <LinearGradient
                  colors={isVoiceMuted ? ['#4B5563', '#6B7280'] : ['#38BDF8', '#0EA5E9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.voiceButton}
                >
                  <VoiceIcon muted={isVoiceMuted} color="#F4F7FF" size={42} />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>{isPlaying ? 'Reading in progress' : 'Ready to listen'}</Text>
              <Text style={styles.progressValue}>{Math.round(playbackProgress * 100)}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={['#14B8A6', '#FB923C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${Math.max(4, playbackProgress * 100)}%` }]}
              />
            </View>

            <View style={styles.readerPanel} onLayout={handleViewportLayout}>
              <ScrollView
                ref={readerScrollRef}
                showsVerticalScrollIndicator={false}
                scrollEnabled
                contentContainerStyle={styles.readerPanelContent}
              >
                <Text style={styles.readerText} onLayout={handleContentLayout}>
                  {activeText}
                </Text>
              </ScrollView>
            </View>
          </View>
        </ScrollView>
        <BottomBanner />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ReadingScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenGradient: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundGlowTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(56,189,248,0.16)',
  },
  backgroundGlowBottom: {
    position: 'absolute',
    left: -90,
    bottom: 120,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(245,196,81,0.12)',
  },
  scrollContent: {
    paddingHorizontal: spaceScale(16),
    paddingTop: spaceScale(18),
    paddingBottom: spaceScale(36),
    flexGrow: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spaceScale(12),
  },
  headerButton: {
    minHeight: 42,
    paddingHorizontal: spaceScale(18),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
  },
  headerButtonText: {
    color: '#F4F7FF',
    fontSize: fontScale(13),
    fontWeight: '800',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  languageSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spaceScale(18),
  },
  playerHero: {
    padding: spaceScale(18),
    borderRadius: radiusScale(28),
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  readerBadge: {
    color: '#FDE68A',
    fontSize: fontScale(11),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  readerTitle: {
    marginTop: 8,
    color: '#F8FBFF',
    fontSize: fontScale(28),
    fontWeight: '900',
  },
  readerSubtitle: {
    marginTop: 8,
    color: 'rgba(226,232,240,0.78)',
    fontSize: fontScale(13),
    lineHeight: fontScale(19),
  },
  playerInfoRow: {
    marginTop: spaceScale(14),
    flexDirection: 'row',
    gap: spaceScale(10),
  },
  infoChip: {
    flex: 1,
    borderRadius: radiusScale(18),
    paddingVertical: spaceScale(12),
    paddingHorizontal: spaceScale(10),
    backgroundColor: 'rgba(6,23,34,0.35)',
  },
  infoValue: {
    color: '#F8FBFF',
    fontSize: fontScale(15),
    fontWeight: '900',
  },
  infoLabel: {
    marginTop: spaceScale(4),
    color: 'rgba(214,235,242,0.72)',
    fontSize: fontScale(10),
    fontWeight: '700',
  },
  readerCard: {
    width: '100%',
    marginTop: spaceScale(16),
    marginBottom: spaceScale(12),
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radiusScale(30),
    padding: spaceScale(14),
  },
  playerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceScale(12),
  },
  playButtonHit: {
    flex: 1,
    borderRadius: radiusScale(999),
    overflow: 'hidden',
  },
  playButton: {
    minHeight: 52,
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spaceScale(18),
  },
  playButtonText: {
    color: '#F8FBFF',
    fontSize: fontScale(14),
    fontWeight: '900',
  },
  voiceButtonWrap: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  voiceButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressHeader: {
    marginTop: spaceScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: '#173042',
    fontSize: fontScale(12),
    fontWeight: '800',
  },
  progressValue: {
    color: '#6F8794',
    fontSize: fontScale(12),
    fontWeight: '800',
  },
  progressTrack: {
    marginTop: spaceScale(8),
    height: spaceScale(8),
    borderRadius: radiusScale(999),
    backgroundColor: colors.cardMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radiusScale(999),
  },
  readerPanel: {
    flex: 1,
    marginTop: spaceScale(16),
    borderRadius: radiusScale(24),
    backgroundColor: '#FFF8EF',
    overflow: 'hidden',
  },
  readerPanelContent: {
    paddingHorizontal: spaceScale(18),
    paddingVertical: spaceScale(18),
  },
  readerText: {
    color: '#173042',
    fontSize: fontScale(19),
    lineHeight: fontScale(32),
    fontWeight: '700',
  },
});
