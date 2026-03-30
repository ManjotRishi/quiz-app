import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import QuestionClock from './QuestionClock';

const TimeOverOverlay = ({ visible, label = 'Time Over' }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.88);
  const ringScale = useSharedValue(1);

  useEffect(() => {
    if (!visible) {
      opacity.value = withTiming(0, { duration: 180 });
      scale.value = withTiming(0.88, { duration: 180 });
      ringScale.value = 1;
      return;
    }

    opacity.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
    scale.value = withSequence(
      withTiming(1.04, { duration: 180, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) })
    );
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 650 }),
        withTiming(1, { duration: 650 })
      ),
      -1,
      true
    );
  }, [opacity, ringScale, scale, visible]);

  const wrapperStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.backdrop} pointerEvents="auto">
      <Animated.View style={[styles.glowRing, ringStyle]} />
      <Animated.View style={[styles.card, wrapperStyle]}>
        <View style={styles.clockWrap}>
          <QuestionClock size={112} seconds={0} totalSeconds={1} />
        </View>
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.subtitle}>Moving to the next question</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,8,18,0.66)',
  },
  glowRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,92,147,0.10)',
  },
  card: {
    width: 230,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 28,
    alignItems: 'center',
    backgroundColor: 'rgba(12,16,31,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  clockWrap: {
    marginBottom: 14,
  },
  title: {
    color: '#F4F7FF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: 6,
    color: 'rgba(244,247,255,0.72)',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default TimeOverOverlay;
