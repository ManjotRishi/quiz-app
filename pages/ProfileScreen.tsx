import React, { useMemo } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackIcon } from '../components/icons';
import TopBanner from '../components/TopBanner';
import { ROUTES } from '../navigation/routes';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../style/colors';
import { fontScale, isCompactScreen, radiusScale, spaceScale } from '../style/responsive';
import { getOverallQuizStats, getTopicStatsSummary } from '../util/quizStats';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getProfileTopicGridMetrics = (width: number) => {
  const compact = width < 350;
  const spacious = width >= 430;
  const contentPadding = compact ? 16 : 18;
  const sectionPadding = compact ? 16 : 18;
  const cardGap = compact ? 10 : spacious ? 14 : 12;
  const cardPaddingHorizontal = compact ? 12 : spacious ? 15 : 14;
  const cardPaddingVertical = compact ? 12 : spacious ? 15 : 14;
  const cardMinHeight = compact ? 160 : spacious ? 176 : 168;
  const badgeHeight = compact ? 26 : 28;
  const availableGridWidth = Math.max(width - contentPadding * 2 - sectionPadding * 2, 0);
  const cardWidth = clamp(Math.floor((availableGridWidth - cardGap) / 2), 0, availableGridWidth);

  return {
    contentPadding,
    sectionPadding,
    cardGap,
    cardWidth,
    cardPaddingHorizontal,
    cardPaddingVertical,
    cardMinHeight,
    badgeHeight,
    badgeFontSize: fontScale(compact ? 9 : 10),
    percentFontSize: fontScale(compact ? 11 : 12),
    titleFontSize: fontScale(compact ? 12 : spacious ? 14 : 13),
    titleLineHeight: fontScale(compact ? 16 : spacious ? 19 : 18),
    scoreFontSize: fontScale(compact ? 24 : spacious ? 30 : 28),
    scoreLineHeight: fontScale(compact ? 26 : spacious ? 32 : 30),
    miniMetaFontSize: fontScale(compact ? 9 : 10),
    progressHeight: compact ? 7 : 8,
  };
};

const ProfileScreen = () => {
  const navigation = useNavigation<RootNav>();
  const { width } = useWindowDimensions();
  const overall = useMemo(() => getOverallQuizStats(), []);
  const topics = useMemo(() => getTopicStatsSummary(), []);
  const topicRows = useMemo(() => {
    const rows = [];
    for (let index = 0; index < topics.length; index += 2) {
      rows.push(topics.slice(index, index + 2));
    }
    return rows;
  }, [topics]);
  const accuracy = overall.attempted ? Math.round((overall.correct / overall.attempted) * 100) : 0;
  const compact = width < 370 || isCompactScreen;
  const topicGrid = useMemo(() => getProfileTopicGridMetrics(width), [width]);
  const learnerName = useAppStore((state) => state.learnerName);
  const displayName = learnerName?.trim() || 'Learner';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#061722', '#0D2433', '#14384A']} style={styles.container}>
        <TopBanner />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: topicGrid.contentPadding }]}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(ROUTES.Home)} style={styles.backButton}>
              <BackIcon color="#F8FBFF" size={16} style={undefined} />
            </TouchableOpacity>
            <View style={styles.headerCopy}>
              <View style={styles.kickerRow}>
                <Text style={styles.kicker}>Profile</Text>
                <Text style={styles.kickerName}>{displayName}</Text>
              </View>
              <Text style={styles.title}>Your learning rhythm</Text>
            </View>
          </View>

          <View style={[styles.heroCard, compact ? styles.heroCardCompact : null]}>
            <View style={styles.ringWrap}>
              <LinearGradient colors={['#14B8A6', '#FB923C']} style={styles.ringOuter}>
                <View style={styles.ringInner}>
                  <Text style={styles.ringValue}>{accuracy}%</Text>
                  <Text style={styles.ringLabel}>Avg Accuracy</Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.heroStats}>
              <View style={styles.statColumn}>
                <Text style={styles.statValue}>{overall.attempted}</Text>
                <Text style={styles.statLabel}>Qn</Text>
              </View>
              <View style={styles.statColumn}>
                <Text style={styles.statValue}>{overall.quizzesPlayed}</Text>
                <Text style={styles.statLabel}>Runs</Text>
              </View>
              <View style={styles.statColumn}>
                <Text style={styles.statValue}>{overall.score}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
            </View>
          </View>

          <View style={[styles.sectionCard, { padding: topicGrid.sectionPadding }]}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderCopy}>
                <Text style={styles.sectionEyebrow}>Today&apos;s Deck</Text>
                <Text style={styles.sectionTitle}>Topic Performance</Text>
                <Text style={styles.sectionText}>A compact snapshot of where your strongest momentum is building.</Text>
              </View>
              <View style={styles.sectionOrbit}>
                <View style={styles.sectionOrbitDot} />
              </View>
            </View>

            <View style={styles.topicGrid}>
              {topicRows.map((row, rowIndex) => (
                <View
                  key={`row-${rowIndex}`}
                  style={[
                    styles.topicGridRow,
                    {
                      marginBottom: rowIndex === topicRows.length - 1 ? 0 : topicGrid.cardGap,
                    },
                  ]}
                >
                  {row.map((topic, columnIndex) => (
                    <LinearGradient
                      key={topic.key}
                      colors={['rgba(8,24,36,0.98)', 'rgba(15,49,66,0.96)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.topicCard,
                        {
                          flex: 1,
                          minHeight: topicGrid.cardMinHeight,
                          paddingHorizontal: topicGrid.cardPaddingHorizontal,
                          paddingVertical: topicGrid.cardPaddingVertical,
                          marginRight: columnIndex === 0 ? topicGrid.cardGap : 0,
                        },
                      ]}
                    >
                      <View style={styles.topicGlowLayer}>
                        <View style={[styles.topicGlowBlob, { backgroundColor: topic.glow }]} />
                      </View>

                      <View style={styles.topicCardTop}>
                        <LinearGradient
                          colors={[topic.accent, '#F5C451']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[styles.topicBadge, { minHeight: topicGrid.badgeHeight }]}
                        >
                          <Text numberOfLines={1} style={[styles.topicBadgeText, { fontSize: topicGrid.badgeFontSize }]}>
                            {topic.label}
                          </Text>
                        </LinearGradient>
                        <Text
                          style={[
                            styles.topicPercent,
                            {
                              color: topic.accent,
                              fontSize: topicGrid.percentFontSize,
                            },
                          ]}
                        >
                          {topic.accuracy}%
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.topicTitle,
                          {
                            fontSize: topicGrid.titleFontSize,
                            lineHeight: topicGrid.titleLineHeight,
                          },
                        ]}
                      >
                        {topic.title}
                      </Text>

                      <View style={styles.topicScoreRow}>
                        <Text
                          style={[
                            styles.topicScoreValue,
                            {
                              fontSize: topicGrid.scoreFontSize,
                              lineHeight: topicGrid.scoreLineHeight,
                            },
                          ]}
                        >
                          {topic.correct}
                        </Text>
                        <Text style={styles.topicScoreLabel}>Correct</Text>
                      </View>

                      <View style={styles.topicMiniMeta}>
                        <Text style={[styles.topicMiniMetaText, { fontSize: topicGrid.miniMetaFontSize }]}>
                          {topic.attempted} attempts
                        </Text>
                        <Text style={[styles.topicMiniMetaText, { fontSize: topicGrid.miniMetaFontSize }]}>
                          {topic.failed} wrong
                        </Text>
                      </View>

                      <View style={[styles.progressTrack, { height: topicGrid.progressHeight }]}>
                        <LinearGradient
                          colors={[topic.accent, '#F5C451']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.progressFill, { width: `${Math.max(12, topic.accuracy)}%` }]}
                        />
                      </View>
                    </LinearGradient>
                  ))}

                  {row.length === 1 ? <View style={styles.topicCardSpacer} /> : null}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: spaceScale(18),
    paddingTop: spaceScale(18),
    paddingBottom: spaceScale(110),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceScale(12),
  },
  headerCopy: {
    flex: 1,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceScale(12),
  },
  backButton: {
    width: spaceScale(40),
    height: spaceScale(40),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    color: 'rgba(214,235,242,0.72)',
    fontSize: fontScale(11),
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  kickerName: {
    color: '#F8FBFF',
    fontSize: fontScale(12),
    fontWeight: '800',
  },
  title: {
    marginTop: spaceScale(8),
    color: '#F8FBFF',
    fontSize: fontScale(28),
    fontWeight: '900',
  },
  heroCard: {
    marginTop: spaceScale(18),
    padding: spaceScale(18),
    borderRadius: radiusScale(28),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceScale(16),
  },
  heroCardCompact: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    width: spaceScale(106),
    height: spaceScale(106),
    borderRadius: radiusScale(999),
    padding: 6,
  },
  ringInner: {
    flex: 1,
    borderRadius: radiusScale(999),
    backgroundColor: '#0D2232',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    color: '#F8FBFF',
    fontSize: fontScale(24),
    fontWeight: '900',
  },
  ringLabel: {
    marginTop: spaceScale(3),
    color: 'rgba(214,235,242,0.72)',
    fontSize: fontScale(10),
    fontWeight: '700',
  },
  heroStats: {
    flex: 1,
    flexDirection: 'row',
    gap: spaceScale(10),
  },
  statColumn: {
    flex: 1,
    borderRadius: radiusScale(20),
    paddingVertical: spaceScale(16),
    paddingHorizontal: spaceScale(10),
    backgroundColor: 'rgba(6,23,34,0.42)',
    alignItems: 'center',
  },
  statValue: {
    color: '#F8FBFF',
    fontSize: fontScale(18),
    fontWeight: '900',
  },
  statLabel: {
    marginTop: spaceScale(4),
    color: 'rgba(214,235,242,0.72)',
    fontSize: fontScale(11),
    fontWeight: '700',
  },
  sectionCard: {
    marginTop: spaceScale(16),
    padding: spaceScale(18),
    borderRadius: radiusScale(32),
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.12)',
    overflow: 'hidden',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spaceScale(12),
  },
  sectionHeaderCopy: {
    flex: 1,
  },
  sectionEyebrow: {
    color: '#F5C451',
    fontSize: fontScale(11),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionOrbit: {
    width: spaceScale(42),
    height: spaceScale(42),
    borderRadius: radiusScale(999),
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  sectionOrbitDot: {
    width: spaceScale(14),
    height: spaceScale(14),
    borderRadius: radiusScale(999),
    backgroundColor: '#14B8A6',
  },
  sectionTitle: {
    marginTop: spaceScale(6),
    color: '#F8FBFF',
    fontSize: fontScale(18),
    fontWeight: '900',
  },
  sectionText: {
    marginTop: spaceScale(6),
    color: 'rgba(214,235,242,0.72)',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
  },
  topicGrid: {
    marginTop: spaceScale(14),
  },
  topicGridRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  topicCard: {
    borderRadius: radiusScale(24),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  topicCardSpacer: {
    flex: 1,
  },
  topicGlowLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  topicGlowBlob: {
    position: 'absolute',
    right: -18,
    top: -12,
    width: spaceScale(90),
    height: spaceScale(90),
    borderRadius: radiusScale(999),
    opacity: 0.18,
  },
  topicCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceScale(8),
  },
  topicBadge: {
    maxWidth: '62%',
    borderRadius: radiusScale(999),
    paddingHorizontal: spaceScale(10),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  topicBadgeText: {
    color: '#06202E',
    fontWeight: '900',
  },
  topicTitle: {
    marginTop: spaceScale(12),
    color: '#F8FBFF',
    fontWeight: '800',
  },
  topicPercent: {
    fontWeight: '900',
  },
  topicScoreRow: {
    marginTop: spaceScale(16),
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spaceScale(6),
  },
  topicScoreValue: {
    color: '#F8FBFF',
    fontWeight: '900',
  },
  topicScoreLabel: {
    color: 'rgba(214,235,242,0.68)',
    fontSize: fontScale(10),
    fontWeight: '700',
    marginBottom: spaceScale(3),
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  topicMiniMeta: {
    marginTop: spaceScale(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spaceScale(8),
  },
  topicMiniMetaText: {
    color: 'rgba(214,235,242,0.68)',
    fontWeight: '700',
  },
  progressTrack: {
    marginTop: spaceScale(14),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radiusScale(999),
  },
});

export default ProfileScreen;
