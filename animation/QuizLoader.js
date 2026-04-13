import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../style/colors';

const OrbitDot = ({ index, rotation }) => {
  const dotStyle = useAnimatedStyle(() => {
    const offset = index * 0.18;
    const progress = (rotation.value + offset) % 1;

    return {
      opacity: interpolate(progress, [0, 0.5, 1], [0.28, 1, 0.28], Extrapolate.CLAMP),
      transform: [
        { rotate: `${progress * 360}deg` },
        { translateY: -70 },
        { scale: interpolate(progress, [0, 0.5, 1], [0.7, 1.1, 0.7], Extrapolate.CLAMP) },
      ],
    };
  });

  return <Animated.View style={[styles.orbitDot, dotStyle]} />;
};

const QuizLoader = ({ isLoading }) => {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    if (!isLoading) {
      rotation.value = 0;
      pulse.value = 0;
      return;
    }

    rotation.value = withRepeat(
      withTiming(1, {
        duration: 1800,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    pulse.value = withRepeat(
      withTiming(1, {
        duration: 1600,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
  }, [isLoading, pulse, rotation]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 360}deg` }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.28, 0.62], Extrapolate.CLAMP),
    transform: [
      { scale: interpolate(pulse.value, [0, 1], [0.94, 1.08], Extrapolate.CLAMP) },
    ],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(pulse.value, [0, 1], [0.98, 1.04], Extrapolate.CLAMP) },
    ],
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
        <Animated.View style={[styles.ambientGlowTop, haloStyle]} />
        <Animated.View style={[styles.ambientGlowBottom, haloStyle]} />

        <View style={styles.content}>
          <View style={styles.loaderShell}>
            <Animated.View style={[styles.outerHalo, haloStyle]} />
            <Animated.View style={[styles.orbitRing, ringStyle]}>
              {Array.from({ length: 6 }).map((_, index) => (
                <OrbitDot key={index} index={index} rotation={rotation} />
              ))}
            </Animated.View>

            <Animated.View style={[styles.coreWrap, coreStyle]}>
              <LinearGradient
                colors={['rgba(96,165,250,0.22)', 'rgba(139,92,246,0.22)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.coreGlow}
              />
              <LinearGradient
                colors={['#0F172A', '#18233F', '#21143A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.core}
              >
                <Text style={styles.coreLabel}>DQ</Text>
              </LinearGradient>
            </Animated.View>
          </View>

          <Text style={styles.title}>Preparing your quiz</Text>
          <Text style={styles.subtitle}>
            Fresh questions are loading with a clean, balanced set of challenges.
          </Text>

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Please wait a moment</Text>
          </View>
        </View>
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
    overflow: 'hidden',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -80,
    right: -30,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(96,165,250,0.16)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(139,92,246,0.14)',
  },
  content: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  loaderShell: {
    width: 210,
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  outerHalo: {
    position: 'absolute',
    width: 188,
    height: 188,
    borderRadius: 94,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  orbitRing: {
    position: 'absolute',
    width: 164,
    height: 164,
    borderRadius: 82,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.electricBlue,
    shadowColor: colors.electricBlue,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  coreWrap: {
    width: 114,
    height: 114,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 57,
  },
  core: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  coreLabel: {
    color: colors.textDark,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  title: {
    color: colors.textDark,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
  },
  statusPill: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.24)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: colors.electricBlue,
  },
  statusText: {
    color: colors.textDark,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default QuizLoader;
