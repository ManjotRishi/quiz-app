import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../style/colors';

const QUESTION_ROWS = [
  {
    index: '01',
    titleWidth: '78%',
    metaWidth: '42%',
    options: ['74%', '58%', '64%'],
  },
  {
    index: '02',
    titleWidth: '66%',
    metaWidth: '38%',
    options: ['52%', '70%', '60%'],
  },
  {
    index: '03',
    titleWidth: '83%',
    metaWidth: '46%',
    options: ['62%', '55%', '76%'],
  },
  {
    index: '04',
    titleWidth: '71%',
    metaWidth: '34%',
    options: ['68%', '51%', '57%'],
  },
];

const STEP_LABELS = ['Framing', 'Writing', 'Balancing', 'Polishing'];

const StepChip = ({ label, index, phase }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const start = index * 0.18;
    const end = start + 0.24;
    const rawProgress = (phase.value - start) / (end - start);
    const localProgress = Math.max(0, Math.min(1, rawProgress));

    return {
      backgroundColor: interpolateColor(
        localProgress,
        [0, 1],
        ['rgba(255,255,255,0.04)', 'rgba(94, 228, 245, 0.12)']
      ),
      borderColor: interpolateColor(
        localProgress,
        [0, 1],
        ['rgba(255,255,255,0.08)', 'rgba(94, 228, 245, 0.28)']
      ),
      transform: [
        { scale: interpolate(localProgress, [0, 1], [1, 1.04], Extrapolate.CLAMP) },
      ],
    };
  });

  return (
    <Animated.View style={[styles.stepChip, animatedStyle]}>
      <Text style={styles.stepText}>{label}</Text>
    </Animated.View>
  );
};

const QuestionRow = ({ item, rowIndex, phase, shimmer, beacon }) => {
  const rowStyle = useAnimatedStyle(() => {
    const start = rowIndex * 0.18;
    const end = start + 0.28;
    const rawProgress = (phase.value - start) / (end - start);
    const localProgress = Math.max(0, Math.min(1, rawProgress));
    const settled = phase.value > end ? 1 : 0;

    return {
      opacity: interpolate(localProgress, [0, 1], [0.38, 1], Extrapolate.CLAMP),
      transform: [
        { translateX: interpolate(localProgress, [0, 1], [20, 0], Extrapolate.CLAMP) },
        { scale: interpolate(localProgress, [0, 1], [0.97, 1], Extrapolate.CLAMP) },
      ],
      borderColor: interpolateColor(
        localProgress,
        [0, 1],
        ['rgba(255,255,255,0.08)', 'rgba(94, 228, 245, 0.25)']
      ),
      backgroundColor: interpolateColor(
        settled ? 1 : localProgress,
        [0, 1],
        ['rgba(255,255,255,0.05)', 'rgba(43, 49, 124, 0.88)']
      ),
    };
  });

  const badgeStyle = useAnimatedStyle(() => {
    const start = rowIndex * 0.18;
    const end = start + 0.28;
    const rawProgress = (phase.value - start) / (end - start);
    const localProgress = Math.max(0, Math.min(1, rawProgress));

    return {
      backgroundColor: interpolateColor(
        localProgress,
        [0, 1],
        ['rgba(255,255,255,0.08)', 'rgba(94, 228, 245, 0.9)']
      ),
      transform: [
        { scale: interpolate(localProgress, [0, 1], [0.88, 1], Extrapolate.CLAMP) },
      ],
    };
  });

  const titleFillStyle = useAnimatedStyle(() => {
    const start = rowIndex * 0.18;
    const end = start + 0.24;
    const rawProgress = (phase.value - start) / (end - start);
    const localProgress = Math.max(0, Math.min(1, rawProgress));

    return {
      transform: [{ scaleX: localProgress }],
      opacity: interpolate(localProgress, [0, 1], [0.2, 1], Extrapolate.CLAMP),
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    const start = rowIndex * 0.18;
    const end = start + 0.28;
    const active = phase.value >= start && phase.value <= end + 0.04;
    const translateDistance = 320;

    return {
      opacity: active ? 1 : 0,
      transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-120, translateDistance]) }],
    };
  });

  const beaconStyle = useAnimatedStyle(() => {
    const start = rowIndex * 0.18;
    const end = start + 0.28;
    const active = phase.value >= start && phase.value <= end + 0.04;

    return {
      opacity: active ? 1 : 0.35,
      transform: [{ scale: active ? beacon.value : 1 }],
    };
  });

  return (
    <Animated.View style={[styles.rowCard, rowStyle]}>
      <LinearGradient
        colors={['rgba(94, 228, 245, 0.22)', 'rgba(43, 49, 124, 0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.rowBorderGlow}
      />
      <Animated.View style={[styles.rowShimmer, shimmerStyle]} />

      <Animated.View style={[styles.rowBadge, badgeStyle]}>
        <Text style={styles.rowBadgeText}>{item.index}</Text>
      </Animated.View>

      <View style={styles.rowContent}>
        <View style={styles.rowHeader}>
          <View style={styles.textTrack}>
            <Animated.View
              style={[
                styles.textFillPrimary,
                { width: item.titleWidth },
                titleFillStyle,
              ]}
            />
          </View>
          <Animated.View style={[styles.statusBeacon, beaconStyle]} />
        </View>

        <View style={[styles.textTrack, styles.metaTrack]}>
          <Animated.View
            style={[
              styles.textFillSecondary,
              { width: item.metaWidth },
              titleFillStyle,
            ]}
          />
        </View>

        <View style={styles.optionStack}>
          {item.options.map((width, optionIndex) => (
            <View key={`${item.index}-${optionIndex}`} style={styles.optionRow}>
              <View style={styles.optionBullet} />
              <View style={styles.optionTrack}>
                <Animated.View
                  style={[
                    styles.optionFill,
                    { width },
                    titleFillStyle,
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const QuizLoader = ({ isLoading }) => {
  const phase = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const pulse = useSharedValue(0);
  const beacon = useSharedValue(1);

  React.useEffect(() => {
    if (!isLoading) {
      phase.value = 0;
      shimmer.value = 0;
      pulse.value = 0;
      beacon.value = 1;
      return;
    }

    phase.value = withRepeat(
      withTiming(1, {
        duration: 3600,
        easing: Easing.inOut(Easing.cubic),
      }),
      -1,
      false
    );

    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1400,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    beacon.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 700, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [beacon, isLoading, phase, pulse, shimmer]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.35, 0.8], Extrapolate.CLAMP),
    transform: [
      { scale: interpolate(pulse.value, [0, 1], [0.92, 1.08], Extrapolate.CLAMP) },
    ],
  }));

  const railFillStyle = useAnimatedStyle(() => ({
    width: `${18 + phase.value * 72}%`,
  }));

  if (!isLoading) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} translucent={false} />
      <LinearGradient
        colors={[colors.background, colors.panelDark, colors.panelDarkSoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <Animated.View style={[styles.ambientOrbLarge, haloStyle]} />
        <Animated.View style={[styles.ambientOrbSmall, haloStyle]} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.topBlock}>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.livePillText}>AI is building today&apos;s quiz</Text>
            </View>

            <Text style={styles.title}>Real-time quiz, quietly coming together.</Text>
            <Text style={styles.subtitle}>
              Fresh questions, cleaner structure, balanced difficulty.
            </Text>

            <View style={styles.progressRail}>
              <Animated.View style={[styles.progressFill, railFillStyle]} />
            </View>

            <View style={styles.stepRow}>
              {STEP_LABELS?.map((label, index) => (
                <StepChip key={label} label={label} index={index} phase={phase} />
              ))}
            </View>
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelEyebrow}>QUESTION STACK</Text>
              <Text style={styles.panelTitle}>Drafting answer-ready cards</Text>
            </View>

            <View style={styles.listWrap}>
              {QUESTION_ROWS.map((item, rowIndex) => (
                <QuestionRow
                  key={item.index}
                  item={item}
                  rowIndex={rowIndex}
                  phase={phase}
                  shimmer={shimmer}
                  beacon={beacon}
                />
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
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 18,
  },
  ambientOrbLarge: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(94, 228, 245, 0.14)',
  },
  ambientOrbSmall: {
    position: 'absolute',
    bottom: 120,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(122, 148, 255, 0.14)',
  },
  topBlock: {
    paddingTop: 6,
  },
  livePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(94, 228, 245, 0.32)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.electricBlue,
    marginRight: 8,
  },
  livePillText: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  title: {
    marginTop: 14,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: colors.textDark,
    maxWidth: 280,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    maxWidth: 270,
  },
  progressRail: {
    marginTop: 18,
    height: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.gradientStart,
  },
  stepRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  stepChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  stepText: {
    color: colors.textDark,
    fontSize: 11,
    fontWeight: '600',
  },
  panel: {
    marginTop: 8,
    borderRadius: 24,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  panelHeader: {
    marginBottom: 16,
  },
  panelEyebrow: {
    color: colors.electricBlue,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  panelTitle: {
    marginTop: 6,
    color: colors.textDark,
    fontSize: 18,
    fontWeight: '700',
  },
  listWrap: {
    marginTop: 2,
  },
  rowCard: {
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  rowBorderGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  rowShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 84,
    backgroundColor: 'rgba(94, 228, 245, 0.12)',
    transform: [{ skewX: '-18deg' }],
  },
  rowBadge: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rowBadgeText: {
    color: colors.textDark,
    fontSize: 11,
    fontWeight: '800',
  },
  rowContent: {
    flex: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  textFillPrimary: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.electricBlue,
  },
  statusBeacon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.electricBlue,
    marginLeft: 8,
    shadowColor: colors.electricBlue,
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  metaTrack: {
    marginTop: 8,
    height: 8,
  },
  textFillSecondary: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(244,247,255,0.7)',
  },
  optionStack: {
    marginTop: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  optionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gradientStart,
    marginRight: 8,
  },
  optionTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  optionFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.gradientEnd,
  },
});

export default QuizLoader;
