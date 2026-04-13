import React, { useEffect, useRef } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientButton } from '../components/GradientButton';
import Advertisement from '../components/Advertisement';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import { ROUTES } from '../navigation/routes';
import { colors } from '../style/colors';
import { fontScale, radiusScale, spaceScale, verticalScale } from '../style/responsive';
import { formatTimer, getScoreMessage } from '../util/functions';
import {
  getOverallQuizStats,
  getQuizTopicMeta,
  getTopicStatsSummary,
  readQuizTopicStats,
} from '../util/quizStats';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Score'>;

const Score = ({ navigation, route }: Props) => {
  const { prepareAdv, startAdv } = useInterstitialAd();
  const hasShownThisVisitRef = useRef(false);
  const showAdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const adWatchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTopRoute = useNavigationState((state) => state.routes[state.index]?.key === route.key);
  const {
    quizType,
    quizLabel,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    notAttemptedAnswers,
    timeTakenSeconds,
    accuracy,
  } = route.params;

  const currentTopicMeta = getQuizTopicMeta(quizType);
  const currentCategoryLabel = quizLabel ?? currentTopicMeta.label;
  const reportTitle = 'Learning Report';
  const currentRunLabel = `${currentCategoryLabel} Run`;
  const wrongAnswerCount = wrongAnswers;
  const scorePoints = correctAnswers * 10;
  const message = getScoreMessage(accuracy);
  const attemptedAnswers = totalQuestions - notAttemptedAnswers;

  useEffect(() => {
    prepareAdv();
  }, [prepareAdv]);

  useEffect(() => {
    if (!isTopRoute) {
      hasShownThisVisitRef.current = false;
      if (showAdTimerRef.current) {
        clearTimeout(showAdTimerRef.current);
        showAdTimerRef.current = null;
      }
      if (adWatchdogTimerRef.current) {
        clearTimeout(adWatchdogTimerRef.current);
        adWatchdogTimerRef.current = null;
      }
      return;
    }

    if (hasShownThisVisitRef.current) {
      return;
    }

    hasShownThisVisitRef.current = true;

    if (showAdTimerRef.current) {
      clearTimeout(showAdTimerRef.current);
    }

    showAdTimerRef.current = setTimeout(() => {
      if (adWatchdogTimerRef.current) {
        clearTimeout(adWatchdogTimerRef.current);
      }

      adWatchdogTimerRef.current = setTimeout(() => {
        adWatchdogTimerRef.current = null;
      }, 20000);

      const started = startAdv({
        placementKey: 'score-screen-visit',
        cooldownMs: 0,
        onClosed: () => {
          if (adWatchdogTimerRef.current) {
            clearTimeout(adWatchdogTimerRef.current);
            adWatchdogTimerRef.current = null;
          }
        },
      });

      if (!started && adWatchdogTimerRef.current) {
        clearTimeout(adWatchdogTimerRef.current);
        adWatchdogTimerRef.current = null;
      }
    }, 650);

    return () => {
      if (showAdTimerRef.current) {
        clearTimeout(showAdTimerRef.current);
        showAdTimerRef.current = null;
      }
      if (adWatchdogTimerRef.current) {
        clearTimeout(adWatchdogTimerRef.current);
        adWatchdogTimerRef.current = null;
      }
    };
  }, [isTopRoute, startAdv]);

  useEffect(() => () => {
    if (showAdTimerRef.current) {
      clearTimeout(showAdTimerRef.current);
    }
    if (adWatchdogTimerRef.current) {
      clearTimeout(adWatchdogTimerRef.current);
    }
  }, []);

  const storedTopicStats = readQuizTopicStats();
  const topicReport = getTopicStatsSummary(storedTopicStats).sort(
    (a, b) => b.focusRate - a.focusRate || b.failed - a.failed || b.attempted - a.attempted
  );
  const overallStats = getOverallQuizStats(storedTopicStats);
  const trackedTopics = topicReport.filter((item) => item.attempted > 0);
  const totalTrackedAttempts = overallStats.attempted;

  const overallChips = [
    { label: 'Attempted', value: overallStats.attempted, color: currentTopicMeta.accent },
    { label: 'Correct', value: overallStats.correct, color: '#1F9D67' },
    { label: 'Wrong', value: overallStats.failed, color: '#D94C4C' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} translucent={false} />

      <LinearGradient
        colors={['#04020A', '#1A0B33', '#250D4A', '#09102A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.bannerWrap}>
          <Advertisement banner containerStyle={styles.banner} />
        </View>
        <View style={styles.bubbleOne} />
        <View style={styles.bubbleTwo} />
        <View style={styles.bubbleThree} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.topLabelRow}>
            <View style={styles.topLabel}>
              <Text style={styles.topLabelText}>{reportTitle}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.replace(ROUTES.Home)}
              style={styles.topArrowButton}
            >
              <Text style={styles.topArrowText}>Home</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroCard}>
            <LinearGradient
              colors={['#1B1D34', '#24253D', '#2C2A44']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.heroSurface}
            >
              <View style={styles.heroHeaderRow}>
                <View
                  style={[
                    styles.heroBadge,
                    {
                      borderColor: currentTopicMeta.accent,
                      backgroundColor: currentTopicMeta.glow,
                    },
                  ]}
                >
                  <Text style={styles.heroBadgeText}>{currentRunLabel}</Text>
                </View>

                <View style={styles.heroMiniPill}>
                  <Text style={styles.heroMiniText}>{currentTopicMeta.title}</Text>
                </View>
              </View>

              <Text style={styles.headline}>{message}</Text>
              <Text style={styles.subline}>
                Latest run: {currentCategoryLabel} total {totalQuestions}. {correctAnswers} correct,{' '}
                {wrongAnswerCount} wrong, {notAttemptedAnswers} unattempted.
              </Text>

              <View style={styles.scoreBlock}>
                <Text style={styles.rankValue}>{scorePoints}</Text>
                <Text style={styles.rankLabel}>Points Earned</Text>
              </View>
            </LinearGradient>

            <View style={styles.summaryStrip}>
              <View style={styles.summaryChip}>
                <Text style={styles.summaryNumber}>{accuracy}%</Text>
                <Text style={styles.summaryLabel}>Accuracy</Text>
              </View>
              <View style={styles.summaryChip}>
                <Text style={styles.summaryNumber}>{formatTimer(timeTakenSeconds)}</Text>
                <Text style={styles.summaryLabel}>Time</Text>
              </View>
              <View style={styles.summaryChip}>
                <Text style={styles.summaryNumber}>{attemptedAnswers}</Text>
                <Text style={styles.summaryLabel}>Attempted</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Overall Totals</Text>
                <Text style={styles.sectionSubtitle}>
                  {trackedTopics.length} topics tracked, {totalTrackedAttempts} total attempts.
                </Text>
              </View>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{overallStats.attempted}</Text>
              </View>
            </View>

            <View style={styles.overallStrip}>
              {overallChips.map((item) => (
                <View key={item.label} style={styles.overallChip}>
                  <Text style={[styles.overallValue, { color: item.color }]}>{item.value}</Text>
                  <Text style={styles.overallLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Topic Breakdown</Text>
            <Text style={styles.sectionSubtitle}>
              Topics with higher failed rate appear first so users know where to focus.
            </Text>

            <View style={styles.topicList}>
              {topicReport.map((item, index) => {
                const barWidth: `${number}%` | 0 = item.attempted
                  ? `${Math.min(100, Math.max(10, item.focusRate || 0))}%`
                  : 0;
                const highlightColor =
                  index === 0 && item.attempted > 0 ? item.accent : 'rgba(255,255,255,0.20)';

                return (
                  <View key={item.key} style={styles.topicCard}>
                    <View style={styles.topicTopRow}>
                      <View
                        style={[
                          styles.topicBadge,
                          {
                            borderColor: item.accent,
                            backgroundColor: item.glow,
                          },
                        ]}
                      >
                        <Text style={styles.topicBadgeText}>{item.label}</Text>
                      </View>

                      <Text style={styles.topicAccuracy}>{item.attempted ? `${item.accuracy}% accuracy` : 'No attempts yet'}</Text>
                    </View>

                    <Text style={styles.topicTitle}>{item.title}</Text>

                    <View style={styles.topicStatsRow}>
                      <View style={styles.topicStat}>
                        <Text style={styles.topicStatValue}>{item.attempted}</Text>
                        <Text style={styles.topicStatLabel}>Attempted</Text>
                      </View>
                      <View style={styles.topicStat}>
                        <Text style={styles.topicStatValue}>{item.failed}</Text>
                        <Text style={styles.topicStatLabel}>Failed</Text>
                      </View>
                      <View style={styles.topicStat}>
                        <Text style={styles.topicStatValue}>{item.correct}</Text>
                        <Text style={styles.topicStatLabel}>Correct</Text>
                      </View>
                    </View>

                    <View style={styles.topicTrack}>
                      <View
                        style={[
                          styles.topicFill,
                          {
                            width: barWidth,
                            backgroundColor: highlightColor,
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.topicHint}>
                      {item.attempted
                        ? `Failed ${item.failed} out of ${item.attempted} attempts`
                        : 'Attempt this quiz to start building the report.'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <GradientButton
            label="Explore More"
            onPress={() => navigation.replace(ROUTES.QuizBoard)}
            style={styles.playButton}
          />

          <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate(ROUTES.Home)}>
            <Text style={styles.homeText}>Back Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Score;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#04020A',
  },
  container: {
    flex: 1,
    paddingHorizontal: spaceScale(20),
    paddingTop: spaceScale(18),
    position: 'relative',
  },
  scrollContent: {
    paddingTop: spaceScale(90),
    paddingBottom: spaceScale(28),
  },
  bannerWrap: {
    position: 'absolute',
    top: spaceScale(-20),
    left: spaceScale(20),
    right: spaceScale(20),
    zIndex: 30,
    elevation: 30,
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
  topLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spaceScale(18),
    gap: spaceScale(10),
  },
  topLabel: {
    paddingHorizontal: spaceScale(14),
    paddingVertical: spaceScale(10),
    borderRadius: radiusScale(20),
    backgroundColor: 'rgba(8,11,22,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(84,150,255,0.18)',
    alignSelf: 'flex-start',
  },
  topLabelText: {
    color: '#F4F7FF',
    fontSize: fontScale(14),
    fontWeight: '700',
  },
  topArrowButton: {
    minWidth: spaceScale(72),
    height: spaceScale(42),
    paddingHorizontal: spaceScale(14),
    borderRadius: spaceScale(21),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8,11,22,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(84,150,255,0.18)',
  },
  topArrowText: {
    color: '#F4F7FF',
    fontSize: fontScale(15),
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  heroCard: {
    backgroundColor: 'rgba(7,10,18,0.72)',
    borderRadius: radiusScale(34),
    paddingHorizontal: spaceScale(18),
    paddingTop: spaceScale(18),
    paddingBottom: spaceScale(18),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.34,
    shadowRadius: 22,
    elevation: 10,
  },
  heroSurface: {
    borderRadius: radiusScale(28),
    paddingHorizontal: spaceScale(18),
    paddingTop: spaceScale(18),
    paddingBottom: spaceScale(20),
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceScale(10),
  },
  heroBadge: {
    minHeight: spaceScale(38),
    paddingHorizontal: spaceScale(14),
    borderRadius: radiusScale(999),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeText: {
    color: '#F4F7FF',
    fontSize: fontScale(13),
    fontWeight: '800',
  },
  heroMiniPill: {
    minHeight: spaceScale(34),
    paddingHorizontal: spaceScale(12),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMiniText: {
    color: '#F4F7FF',
    fontSize: fontScale(12),
    fontWeight: '700',
  },
  headline: {
    marginTop: spaceScale(24),
    textAlign: 'center',
    color: '#F4F7FF',
    fontSize: fontScale(22),
    lineHeight: fontScale(32),
    fontWeight: '700',
  },
  subline: {
    marginTop: spaceScale(8),
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: fontScale(16),
    lineHeight: fontScale(24),
  },
  scoreBlock: {
    marginTop: spaceScale(22),
    alignItems: 'center',
  },
  rankValue: {
    color: '#F4F7FF',
    fontSize: fontScale(48),
    fontWeight: '800',
  },
  rankLabel: {
    marginTop: spaceScale(4),
    color: 'rgba(220,232,255,0.84)',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
  summaryStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spaceScale(16),
    gap: 10,
  },
  summaryChip: {
    flex: 1,
    borderRadius: radiusScale(20),
    paddingVertical: spaceScale(14),
    paddingHorizontal: spaceScale(12),
    backgroundColor: 'rgba(7,10,18,0.72)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(84,150,255,0.16)',
  },
  summaryNumber: {
    color: '#F4F7FF',
    fontSize: fontScale(17),
    fontWeight: '800',
  },
  summaryLabel: {
    marginTop: spaceScale(4),
    color: colors.textMuted,
    fontSize: fontScale(12),
    fontWeight: '600',
  },
  sectionCard: {
    marginTop: spaceScale(16),
    backgroundColor: 'rgba(7,10,18,0.72)',
    borderRadius: radiusScale(28),
    padding: spaceScale(18),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(84,150,255,0.12)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spaceScale(12),
  },
  sectionTitle: {
    color: '#F4F7FF',
    fontSize: fontScale(18),
    fontWeight: '800',
  },
  sectionSubtitle: {
    marginTop: spaceScale(6),
    color: colors.textMuted,
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
    fontWeight: '600',
  },
  sectionBadge: {
    minWidth: spaceScale(44),
    height: spaceScale(34),
    borderRadius: radiusScale(17),
    paddingHorizontal: spaceScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(84,150,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(84,150,255,0.18)',
  },
  sectionBadgeText: {
    color: '#F4F7FF',
    fontSize: fontScale(14),
    fontWeight: '800',
  },
  overallStrip: {
    flexDirection: 'row',
    gap: spaceScale(10),
    marginTop: spaceScale(16),
  },
  overallChip: {
    flex: 1,
    borderRadius: radiusScale(20),
    paddingVertical: spaceScale(14),
    paddingHorizontal: spaceScale(12),
    alignItems: 'center',
    backgroundColor: 'rgba(8,11,22,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  overallValue: {
    fontSize: fontScale(18),
    fontWeight: '800',
  },
  overallLabel: {
    marginTop: spaceScale(4),
    color: colors.textMuted,
    fontSize: fontScale(12),
    fontWeight: '600',
  },
  topicList: {
    marginTop: spaceScale(14),
    gap: spaceScale(12),
  },
  topicCard: {
    borderRadius: radiusScale(24),
    padding: spaceScale(16),
    backgroundColor: 'rgba(8,11,22,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  topicTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spaceScale(10),
  },
  topicBadge: {
    minHeight: spaceScale(34),
    paddingHorizontal: spaceScale(12),
    borderRadius: radiusScale(999),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicBadgeText: {
    color: '#F4F7FF',
    fontSize: fontScale(12),
    fontWeight: '800',
  },
  topicAccuracy: {
    color: colors.textMuted,
    fontSize: fontScale(12),
    fontWeight: '700',
    textAlign: 'right',
    flexShrink: 1,
  },
  topicTitle: {
    marginTop: spaceScale(12),
    color: '#F4F7FF',
    fontSize: fontScale(17),
    fontWeight: '800',
  },
  topicStatsRow: {
    flexDirection: 'row',
    gap: spaceScale(10),
    marginTop: spaceScale(14),
  },
  topicStat: {
    flex: 1,
    borderRadius: radiusScale(18),
    paddingVertical: spaceScale(12),
    paddingHorizontal: spaceScale(10),
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  topicStatValue: {
    color: '#F4F7FF',
    fontSize: fontScale(16),
    fontWeight: '800',
  },
  topicStatLabel: {
    marginTop: spaceScale(3),
    color: colors.textMuted,
    fontSize: fontScale(11),
    fontWeight: '600',
  },
  topicTrack: {
    height: verticalScale(10),
    borderRadius: 999,
    marginTop: spaceScale(14),
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  topicFill: {
    height: '100%',
    borderRadius: 999,
  },
  topicHint: {
    marginTop: spaceScale(10),
    color: colors.textMuted,
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
    fontWeight: '600',
  },
  playButton: {
    marginTop: spaceScale(28),
  },
  homeButton: {
    alignItems: 'center',
    paddingVertical: spaceScale(14),
    marginTop: spaceScale(8),
  },
  homeText: {
    color: '#F4F7FF',
    fontSize: fontScale(15),
    fontWeight: '600',
  },
  bubbleOne: {
    position: 'absolute',
    top: -48,
    right: -42,
    width: 160,
    height: 160,
    borderRadius: 160,
    backgroundColor: 'rgba(84,150,255,0.10)',
  },
  bubbleTwo: {
    position: 'absolute',
    top: 190,
    left: -26,
    width: 64,
    height: 64,
    borderRadius: 64,
    backgroundColor: 'rgba(255,214,102,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  bubbleThree: {
    position: 'absolute',
    bottom: 160,
    right: '18%',
    width: 24,
    height: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(84,150,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(84,150,255,0.14)',
  },
});
