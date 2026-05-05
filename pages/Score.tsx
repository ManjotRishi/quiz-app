import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientButton } from '../components/GradientButton';
import BottomBanner from '../components/BottomBanner';
import TopBanner from '../components/TopBanner';
import { useAdManager } from '../hooks/useAdManager';
import { useRewardedScreenEntryAd } from '../hooks/useRewardedScreenEntryAd';
import { ROUTES } from '../navigation/routes';
import { colors } from '../style/colors';
import { fontScale, radiusScale, spaceScale } from '../style/responsive';
import { formatTimer, getScoreMessage } from '../util/functions';
import {
  getOverallQuizStats,
  getQuizTopicMeta,
  getTopicStatsSummary,
  readQuizTopicStats,
} from '../util/quizStats';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Score'>;
type TopicStatsShape = {
  totalQuestions: number;
  attempted: number;
  correct: number;
  failed: number;
  unattempted: number;
  quizzesPlayed: number;
  lastUpdatedAt: string | null;
};

const Score = ({ navigation, route }: Props) => {
  const isFocused = useIsFocused();
  const {
    preloadRewarded,
    rewardedLoaded,
    showRewarded,
  } = useAdManager();
  const safeParams = route?.params ?? {
    quizType: 'gk' as const,
    quizLabel: 'GK' as const,
    totalQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    notAttemptedAnswers: 0,
    timeTakenSeconds: 0,
    accuracy: 0,
    fromQuizFlow: false,
  };
  const {
    quizType,
    quizLabel,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    notAttemptedAnswers,
    timeTakenSeconds,
    accuracy,
    fromQuizFlow = false,
  } = safeParams;

  const currentTopicMeta = getQuizTopicMeta(quizType);
  const currentCategoryLabel = quizLabel ?? currentTopicMeta.label;
  const baseScorePoints = correctAnswers * 10;
  const message = getScoreMessage(accuracy);
  const attemptedAnswers = Math.max(0, totalQuestions - notAttemptedAnswers);
  const [isScoreDoubled, setIsScoreDoubled] = useState(false);
  const [rewardFeedback, setRewardFeedback] = useState('');

  const storedTopicStats = readQuizTopicStats() as Record<string, TopicStatsShape>;
  const currentTopicAttempted = Math.max(0, correctAnswers + wrongAnswers);
  const currentTopicTotals = Math.max(totalQuestions, currentTopicAttempted + notAttemptedAnswers);
  const currentTopicKey = currentTopicMeta.key;
  const currentStoredTopic = storedTopicStats[currentTopicKey] ?? {
    totalQuestions: 0,
    attempted: 0,
    correct: 0,
    failed: 0,
    unattempted: 0,
    quizzesPlayed: 0,
    lastUpdatedAt: null,
  };
  const hydratedTopicStats = {
    ...storedTopicStats,
    [currentTopicKey]: {
      ...currentStoredTopic,
      totalQuestions: Math.max(currentStoredTopic.totalQuestions, currentTopicTotals),
      attempted: Math.max(currentStoredTopic.attempted, currentTopicAttempted),
      correct: Math.max(currentStoredTopic.correct, correctAnswers),
      failed: Math.max(currentStoredTopic.failed, wrongAnswers),
      unattempted: Math.max(currentStoredTopic.unattempted, notAttemptedAnswers),
      quizzesPlayed: Math.max(currentStoredTopic.quizzesPlayed, totalQuestions > 0 ? 1 : 0),
    },
  };
  const topicReport = getTopicStatsSummary(hydratedTopicStats);
  const overallStats = getOverallQuizStats(hydratedTopicStats);
  const shouldShowRewardButton = fromQuizFlow && attemptedAnswers >= 1;
  const displayedScorePoints = isScoreDoubled ? baseScorePoints * 2 : baseScorePoints;

  useEffect(() => {
    preloadRewarded();
  }, [preloadRewarded]);

  useRewardedScreenEntryAd({
    enabled: fromQuizFlow && isFocused && !isScoreDoubled,
    placement: 'score_entry_reward',
    attemptedQuestions: Math.max(attemptedAnswers, 1),
    onRewardEarned: () => {
      setIsScoreDoubled(true);
      setRewardFeedback('Reward earned. Your score has been doubled.');
    },
    onClosed: ({ rewardEarned } = {}) => {
      if (!rewardEarned) {
        setRewardFeedback('Reward ad closed before reward was earned. You can still use the button below.');
      }
    },
  });

  const rewardedButtonLabel = useMemo(() => {
    if (isScoreDoubled) {
      return 'Score Doubled';
    }

    if (!rewardedLoaded) {
      return 'Loading Reward';
    }

    return 'Watch Ad to Double Score';
  }, [isScoreDoubled, rewardedLoaded]);

  const handleDoubleScore = () => {
    if (isScoreDoubled || !shouldShowRewardButton) {
      return;
    }

    const didStart = showRewarded({
      placement: 'double_score',
      attemptedQuestions: attemptedAnswers,
      onRewardEarned: () => {
        setIsScoreDoubled(true);
        setRewardFeedback('Reward earned. Your score has been doubled.');
      },
      onClosed: ({ rewardEarned } = {}) => {
        if (!rewardEarned) {
          setRewardFeedback('Ad closed before reward was earned.');
        }
      },
    });

    if (!didStart) {
      setRewardFeedback('Reward ad is not ready yet. Please try again in a moment.');
    }
  };

  const runMetrics = [
    { label: 'Accuracy', value: `${accuracy}%` },
    { label: 'Time', value: formatTimer(timeTakenSeconds) },
    { label: 'Attempted', value: attemptedAnswers },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} translucent={false} />
      <LinearGradient colors={['#061722', '#0D2433', '#14384A']} style={styles.container}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
        <TopBanner />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.topRow}>
            <Text style={styles.topLabel}>Test Complete</Text>
            <TouchableOpacity activeOpacity={0.88} onPress={() => navigation.replace(ROUTES.Home)} style={styles.topButton}>
              <Text style={styles.topButtonText}>Home</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroCard}>
            <Text style={styles.heroKicker}>{currentCategoryLabel}</Text>
            <Text style={styles.heroTitle}>{message}</Text>
            <Text style={styles.heroSubtitle}>
              {correctAnswers} correct, {wrongAnswers} wrong, {notAttemptedAnswers} unattempted from {totalQuestions} questions.
            </Text>

            <View style={styles.scoreRingShell}>
              <LinearGradient colors={['#14B8A6', '#FB923C']} style={styles.scoreRing}>
                <View style={styles.scoreRingInner}>
                  <Text style={styles.scoreValue}>{accuracy}%</Text>
                  <Text style={styles.scoreLabel}>Score</Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.metricRow}>
              {runMetrics.map((item) => (
                <View key={item.label} style={styles.metricCard}>
                  <Text style={styles.metricValue}>{item.value}</Text>
                  <Text style={styles.metricLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Points Earned</Text>
              <View style={[styles.topicBadge, { backgroundColor: currentTopicMeta.glow }]}>
                <Text style={[styles.topicBadgeText, { color: currentTopicMeta.accent }]}>{currentTopicMeta.label}</Text>
              </View>
            </View>
            <Text style={styles.pointsValue}>{displayedScorePoints}</Text>
            <Text style={styles.sectionText}>This keeps your reward flow intact. If the user watches a rewarded ad, the score doubles once.</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Topic Breakdown</Text>
            <Text style={styles.sectionText}>A quick view of today&apos;s running progress across the whole app.</Text>

            <View style={styles.topicList}>
              {topicReport.map((item) => (
                <View key={item.key} style={styles.topicCard}>
                  <View style={styles.topicTopRow}>
                    <Text style={styles.topicTitle}>{item.title}</Text>
                    <Text style={styles.topicAccuracy}>{item.accuracy}%</Text>
                  </View>
                  <Text style={styles.topicMeta}>
                    {item.correct} correct • {item.failed} wrong • {item.unattempted} skipped
                  </Text>
                  <View style={styles.progressTrack}>
                    <LinearGradient
                      colors={[item.accent, '#FFFFFF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${Math.max(10, item.accuracy)}%` }]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Daily Totals</Text>
            <View style={styles.overviewRow}>
              <View style={styles.overviewChip}>
                <Text style={styles.overviewValue}>{overallStats.attempted}</Text>
                <Text style={styles.overviewLabel}>Attempted</Text>
              </View>
              <View style={styles.overviewChip}>
                <Text style={styles.overviewValue}>{overallStats.correct}</Text>
                <Text style={styles.overviewLabel}>Correct</Text>
              </View>
              <View style={styles.overviewChip}>
                <Text style={styles.overviewValue}>{overallStats.score}</Text>
                <Text style={styles.overviewLabel}>Score</Text>
              </View>
            </View>
          </View>

          {shouldShowRewardButton ? (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Bonus Reward</Text>
              <Text style={styles.sectionText}>Rewarded ads are still optional. Watch once to double this run&apos;s score.</Text>
              <GradientButton
                label={rewardedButtonLabel}
                onPress={handleDoubleScore}
                style={styles.rewardButton}
                disabled={isScoreDoubled || !rewardedLoaded}
              />
              {rewardFeedback ? <Text style={styles.rewardText}>{rewardFeedback}</Text> : null}
            </View>
          ) : null}

          <GradientButton
            label="Explore More"
            onPress={() => navigation.replace(ROUTES.QuizBoard)}
            style={styles.playButton}
          />

          <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate(ROUTES.Home)}>
            <Text style={styles.homeText}>Back Home</Text>
          </TouchableOpacity>
        </ScrollView>
        <BottomBanner />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Score;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  glowTop: {
    position: 'absolute',
    top: -90,
    right: -60,
    width: 230,
    height: 230,
    borderRadius: 230,
    backgroundColor: 'rgba(20,184,166,0.18)',
  },
  glowBottom: {
    position: 'absolute',
    left: -70,
    bottom: 160,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(251,146,60,0.14)',
  },
  scrollContent: {
    paddingHorizontal: spaceScale(18),
    paddingTop: spaceScale(18),
    paddingBottom: spaceScale(28),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spaceScale(10),
  },
  topLabel: {
    color: '#F8FBFF',
    fontSize: fontScale(15),
    fontWeight: '800',
  },
  topButton: {
    minWidth: spaceScale(76),
    minHeight: spaceScale(42),
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  topButtonText: {
    color: '#F8FBFF',
    fontSize: fontScale(13),
    fontWeight: '800',
  },
  heroCard: {
    marginTop: spaceScale(16),
    padding: spaceScale(20),
    borderRadius: radiusScale(30),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  heroKicker: {
    color: '#FDE68A',
    fontSize: fontScale(11),
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: spaceScale(10),
    color: '#F8FBFF',
    fontSize: fontScale(28),
    fontWeight: '900',
    textAlign: 'center',
  },
  heroSubtitle: {
    marginTop: spaceScale(8),
    color: 'rgba(214,235,242,0.78)',
    fontSize: fontScale(13),
    lineHeight: fontScale(19),
    textAlign: 'center',
  },
  scoreRingShell: {
    marginTop: spaceScale(20),
  },
  scoreRing: {
    width: spaceScale(170),
    height: spaceScale(170),
    borderRadius: radiusScale(999),
    padding: spaceScale(10),
  },
  scoreRingInner: {
    flex: 1,
    borderRadius: radiusScale(999),
    backgroundColor: '#0D2232',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    color: '#F8FBFF',
    fontSize: fontScale(36),
    fontWeight: '900',
  },
  scoreLabel: {
    marginTop: spaceScale(4),
    color: 'rgba(214,235,242,0.72)',
    fontSize: fontScale(14),
    fontWeight: '700',
  },
  metricRow: {
    width: '100%',
    marginTop: spaceScale(18),
    flexDirection: 'row',
    gap: spaceScale(10),
  },
  metricCard: {
    flex: 1,
    borderRadius: radiusScale(18),
    paddingVertical: spaceScale(14),
    paddingHorizontal: spaceScale(10),
    backgroundColor: 'rgba(6,23,34,0.36)',
    alignItems: 'center',
  },
  metricValue: {
    color: '#F8FBFF',
    fontSize: fontScale(16),
    fontWeight: '900',
  },
  metricLabel: {
    marginTop: spaceScale(4),
    color: 'rgba(214,235,242,0.72)',
    fontSize: fontScale(10),
    fontWeight: '700',
  },
  sectionCard: {
    marginTop: spaceScale(16),
    padding: spaceScale(18),
    borderRadius: radiusScale(28),
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceScale(12),
  },
  sectionTitle: {
    color: '#163042',
    fontSize: fontScale(18),
    fontWeight: '900',
  },
  sectionText: {
    marginTop: spaceScale(6),
    color: '#6F8794',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
  },
  topicBadge: {
    paddingHorizontal: spaceScale(12),
    paddingVertical: spaceScale(8),
    borderRadius: radiusScale(999),
  },
  topicBadgeText: {
    fontSize: fontScale(11),
    fontWeight: '900',
  },
  pointsValue: {
    marginTop: spaceScale(14),
    color: '#163042',
    fontSize: fontScale(42),
    fontWeight: '900',
  },
  topicList: {
    marginTop: spaceScale(12),
    gap: spaceScale(12),
  },
  topicCard: {
    borderRadius: radiusScale(22),
    padding: spaceScale(14),
    backgroundColor: colors.cardMuted,
  },
  topicTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spaceScale(12),
  },
  topicTitle: {
    color: '#163042',
    fontSize: fontScale(14),
    fontWeight: '800',
    flex: 1,
  },
  topicAccuracy: {
    color: '#163042',
    fontSize: fontScale(12),
    fontWeight: '900',
  },
  topicMeta: {
    marginTop: spaceScale(5),
    color: '#6F8794',
    fontSize: fontScale(12),
    fontWeight: '600',
  },
  progressTrack: {
    marginTop: spaceScale(10),
    height: spaceScale(8),
    borderRadius: radiusScale(999),
    backgroundColor: '#DDE8ED',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radiusScale(999),
  },
  overviewRow: {
    marginTop: spaceScale(14),
    flexDirection: 'row',
    gap: spaceScale(10),
  },
  overviewChip: {
    flex: 1,
    borderRadius: radiusScale(18),
    paddingVertical: spaceScale(14),
    paddingHorizontal: spaceScale(10),
    backgroundColor: colors.cardMuted,
    alignItems: 'center',
  },
  overviewValue: {
    color: '#163042',
    fontSize: fontScale(18),
    fontWeight: '900',
  },
  overviewLabel: {
    marginTop: spaceScale(4),
    color: '#6F8794',
    fontSize: fontScale(11),
    fontWeight: '700',
  },
  rewardButton: {
    marginTop: spaceScale(18),
  },
  rewardText: {
    marginTop: spaceScale(10),
    color: '#6F8794',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
  },
  playButton: {
    marginTop: spaceScale(26),
  },
  homeButton: {
    alignItems: 'center',
    paddingVertical: spaceScale(14),
    marginTop: spaceScale(8),
  },
  homeText: {
    color: '#F8FBFF',
    fontSize: fontScale(15),
    fontWeight: '700',
  },
});
