import React, { useMemo } from 'react';
import {
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
import TopBanner from '../components/TopBanner';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import {
  BackIcon,
  ChildTopicIcon,
  CurrentAffairsTopicIcon,
  EnglishTopicIcon,
  GkTopicIcon,
  MathTopicIcon,
  PuzzleTopicIcon,
} from '../components/icons';
import { RootStackParamList } from '../navigation/types';
import { ROUTES } from '../navigation/routes';
import { colors } from '../style/colors';
import { fontScale, radiusScale, spaceScale } from '../style/responsive';
import { getTopicStatsSummary } from '../util/quizStats';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getTestsLayoutMetrics = (width: number) => {
  const compact = width < 350;
  const spacious = width >= 430;
  const horizontalPadding = compact ? 12 : spacious ? 18 : 16;
  const topPadding = compact ? 14 : 18;
  const bottomPadding = compact ? 104 : 110;
  const cardGap = compact ? 10 : spacious ? 14 : 12;
  const cardPaddingHorizontal = compact ? 12 : spacious ? 15 : 14;
  const cardPaddingVertical = compact ? 12 : spacious ? 15 : 14;
  const titlePillHeight = compact ? 34 : spacious ? 38 : 36;
  const iconWrapSize = compact ? 34 : spacious ? 40 : 38;
  const iconSize = compact ? 18 : 20;
  const cardMinHeight = compact ? 176 : spacious ? 194 : 186;
  const progressHeight = compact ? 5 : 6;
  const availableWidth = Math.max(width - horizontalPadding * 2, 0);
  const cardWidth = clamp(Math.floor((availableWidth - cardGap) / 2), 0, availableWidth);

  return {
    horizontalPadding,
    topPadding,
    bottomPadding,
    cardGap,
    cardWidth,
    cardPaddingHorizontal,
    cardPaddingVertical,
    titlePillHeight,
    iconWrapSize,
    iconSize,
    cardMinHeight,
    progressHeight,
    headerTitleFontSize: fontScale(compact ? 23 : spacious ? 29 : 26),
    headerTitleLineHeight: fontScale(compact ? 30 : spacious ? 36 : 33),
    kickerFontSize: fontScale(compact ? 10 : 11),
    pillFontSize: fontScale(compact ? 9 : spacious ? 12 : 10),
    subtitleFontSize: fontScale(compact ? 10 : spacious ? 12 : 11),
    subtitleLineHeight: fontScale(compact ? 14 : spacious ? 17 : 16),
    heroMetricFontSize: fontScale(compact ? 24 : spacious ? 29 : 27),
    heroMetricLineHeight: fontScale(compact ? 27 : spacious ? 32 : 30),
    heroMetricLabelFontSize: fontScale(compact ? 9 : 10),
    sideMetricFontSize: fontScale(compact ? 15 : spacious ? 18 : 17),
    sideMetricLabelFontSize: fontScale(compact ? 9 : 10),
    bottomMetaFontSize: fontScale(compact ? 9 : 10),
  };
};

const TOPIC_CARDS = [
  {
    key: 'gk',
    title: 'General Knowledge',
    subtitle: 'Clean question-first practice',
    route: ROUTES.QuizBoard,
    accent: '#14B8A6',
    colors: ['#14B8A6', '#38BDF8'],
    Icon: GkTopicIcon,
  },
  {
    key: 'ca',
    title: 'Current Affairs',
    subtitle: 'Daily update challenge',
    route: ROUTES.GkBoard,
    accent: '#FB923C',
    colors: ['#FB923C', '#F97316'],
    Icon: CurrentAffairsTopicIcon,
  },
  {
    key: 'math',
    title: 'Math Quiz',
    subtitle: 'Numbers, speed and accuracy',
    route: ROUTES.MathQuizz,
    accent: '#14B8A6',
    colors: ['#14B8A6', '#0EA5E9'],
    Icon: MathTopicIcon,
  },
  {
    key: 'english',
    title: 'English',
    subtitle: 'Grammar, vocabulary and speed',
    route: ROUTES.EnglishQuizz,
    accent: '#38BDF8',
    colors: ['#0EA5E9', '#2563EB'],
    Icon: EnglishTopicIcon,
  },
  {
    key: 'child',
    title: 'Kids Zone',
    subtitle: 'Story and quiz hub',
    route: ROUTES.ChildSection,
    accent: '#F5C451',
    colors: ['#F5C451', '#FB923C'],
    Icon: ChildTopicIcon,
  },
  {
    key: 'tc',
    title: 'Reasoning',
    subtitle: 'Logic and tricky practice',
    route: ROUTES.TrickeyQuestions,
    accent: '#7DD3FC',
    colors: ['#38BDF8', '#14B8A6'],
    Icon: PuzzleTopicIcon,
  },
];

const TestsScreen = () => {
  const navigation = useNavigation<RootNav>();
  const { width } = useWindowDimensions();
  const stats = getTopicStatsSummary();
  const layout = useMemo(() => getTestsLayoutMetrics(width), [width]);

  const cards = useMemo(
    () =>
      TOPIC_CARDS.map((item) => {
        const topicStats = stats.find((entry) => entry.key === item.key);
        const totalQuestions = topicStats?.totalQuestions ?? 0;
        const attempted = topicStats?.attempted ?? 0;
        const accuracy = topicStats?.accuracy ?? 0;
        const progress = totalQuestions > 0 ? Math.min(1, attempted / totalQuestions) : 0;

        return {
          ...item,
          accuracy,
          totalQuestions,
          attempted,
          progress,
        };
      }),
    [stats]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#061722', '#0D2433', '#13384D']} style={styles.container}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
        <TopBanner />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: layout.horizontalPadding,
              paddingTop: layout.topPadding,
              paddingBottom: layout.bottomPadding,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate(ROUTES.Home)}
              style={styles.backButton}
            >
              <BackIcon color="#F8FBFF" size={16} style={undefined} />
            </TouchableOpacity>
            <View style={styles.headerCopy}>
              <Text style={[styles.kicker, { fontSize: layout.kickerFontSize }]}>Test Library</Text>
              <Text
                style={[
                  styles.headerTitle,
                  {
                    fontSize: layout.headerTitleFontSize,
                    lineHeight: layout.headerTitleLineHeight,
                  },
                ]}
              >
                Pick the track you want to practice today
              </Text>
            </View>
          </View>

          <View style={[styles.topicList, styles.topicGrid, { marginTop: layout.cardGap + 4 }]}>
            {cards.map((card, index) => (
              <TouchableOpacity
                key={card.key}
                activeOpacity={0.92}
                style={[
                  styles.topicCardShell,
                  {
                    width: layout.cardWidth,
                    marginBottom: layout.cardGap,
                    marginRight: index % 2 === 0 ? layout.cardGap : 0,
                  },
                ]}
                onPress={() => navigation.navigate(card.route)}
              >
                <LinearGradient
                  colors={['rgba(8,24,36,0.98)', 'rgba(14,41,58,0.98)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.topicCard,
                    {
                      minHeight: layout.cardMinHeight,
                      paddingHorizontal: layout.cardPaddingHorizontal,
                      paddingVertical: layout.cardPaddingVertical,
                    },
                  ]}
                >
                  <View style={styles.cardTopRow}>
                    <LinearGradient
                      colors={card.colors as unknown as string[]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.topicTitlePill, { minHeight: layout.titlePillHeight }]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[styles.topicTitlePillText, { fontSize: layout.pillFontSize }]}
                      >
                        {card.title}
                      </Text>
                    </LinearGradient>

                    <View
                      style={[
                        styles.topicIconWrap,
                        {
                          width: layout.iconWrapSize,
                          height: layout.iconWrapSize,
                          backgroundColor: `${card.accent}18`,
                        },
                      ]}
                    >
                      <card.Icon color={card.accent} size={layout.iconSize} />
                    </View>
                  </View>

                  <Text
                    numberOfLines={2}
                    style={[
                      styles.topicSubtitle,
                      {
                        fontSize: layout.subtitleFontSize,
                        lineHeight: layout.subtitleLineHeight,
                      },
                    ]}
                  >
                    {card.subtitle}
                  </Text>

                  <View style={styles.metricRow}>
                    <View style={styles.heroMetric}>
                      <Text
                        style={[
                          styles.heroMetricValue,
                          {
                            fontSize: layout.heroMetricFontSize,
                            lineHeight: layout.heroMetricLineHeight,
                          },
                        ]}
                      >
                        {card.totalQuestions}
                      </Text>
                      <Text
                        style={[styles.heroMetricLabel, { fontSize: layout.heroMetricLabelFontSize }]}
                      >
                        Questions
                      </Text>
                    </View>

                    <View style={styles.sideMetric}>
                      <Text
                        style={[
                          styles.sideMetricValue,
                          {
                            color: card.accent,
                            fontSize: layout.sideMetricFontSize,
                          },
                        ]}
                      >
                        {card.accuracy}%
                      </Text>
                      <Text
                        style={[styles.sideMetricLabel, { fontSize: layout.sideMetricLabelFontSize }]}
                      >
                        Accuracy
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bottomMetaRow}>
                    <Text style={[styles.bottomMetaText, { fontSize: layout.bottomMetaFontSize }]}>
                      Attempted {card.attempted}
                    </Text>
                    <Text style={[styles.bottomMetaText, { fontSize: layout.bottomMetaFontSize }]}>
                      Open
                    </Text>
                  </View>

                  <View style={[styles.progressTrack, { height: layout.progressHeight }]}>
                    <LinearGradient
                      colors={card.colors as unknown as string[]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.progressFill,
                        {
                          width: `${card.progress > 0 ? Math.max(card.progress * 100, 12) : 12}%`,
                        },
                      ]}
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
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
  glowTop: {
    position: 'absolute',
    top: -90,
    right: -50,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(20,184,166,0.16)',
  },
  glowBottom: {
    position: 'absolute',
    left: -70,
    bottom: 120,
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: 'rgba(251,146,60,0.12)',
  },
  scrollContent: {
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceScale(12),
  },
  headerCopy: {
    flex: 1,
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
  headerTitle: {
    marginTop: spaceScale(8),
    color: '#F8FBFF',
    fontWeight: '900',
  },
  topicList: {
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topicCardShell: {
    borderRadius: radiusScale(28),
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.12)',
    shadowColor: '#04141F',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
  topicCard: {
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceScale(10),
  },
  topicTitlePill: {
    flex: 1,
    borderRadius: radiusScale(999),
    paddingHorizontal: spaceScale(12),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  topicTitlePillText: {
    color: '#F8FBFF',
    fontSize: fontScale(11),
    fontWeight: '800',
  },
  topicIconWrap: {
    borderRadius: radiusScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  topicSubtitle: {
    marginTop: spaceScale(12),
    color: 'rgba(214,235,242,0.72)',
    minHeight: spaceScale(32),
    fontWeight: '600',
  },
  metricRow: {
    marginTop: spaceScale(14),
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spaceScale(10),
  },
  heroMetric: {
    flex: 1,
  },
  heroMetricValue: {
    color: '#F8FBFF',
    fontWeight: '900',
  },
  heroMetricLabel: {
    marginTop: spaceScale(2),
    color: 'rgba(214,235,242,0.64)',
    fontSize: fontScale(10),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sideMetric: {
    alignItems: 'flex-end',
  },
  sideMetricValue: {
    fontWeight: '900',
  },
  sideMetricLabel: {
    marginTop: spaceScale(2),
    color: 'rgba(214,235,242,0.64)',
    fontSize: fontScale(10),
    fontWeight: '700',
  },
  bottomMetaRow: {
    marginTop: spaceScale(14),
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spaceScale(8),
  },
  bottomMetaText: {
    color: 'rgba(214,235,242,0.66)',
    fontSize: fontScale(10),
    fontWeight: '700',
  },
  progressTrack: {
    marginTop: spaceScale(8),
    borderRadius: radiusScale(999),
    overflow: 'hidden',
    backgroundColor: 'rgba(125,211,252,0.14)',
  },
  progressFill: {
    height: '100%',
    borderRadius: radiusScale(999),
  },
});

export default TestsScreen;
