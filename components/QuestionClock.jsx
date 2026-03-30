import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient as SvgLinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { INITIAL_TIME } from '../util/constants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const clamp = (value, min, max) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

const QuestionClock = ({ size = 40, seconds, totalSeconds = INITIAL_TIME }) => {
  const safeTotal = Math.max(1, totalSeconds || INITIAL_TIME);
  const safeSeconds = Number.isFinite(seconds) ? clamp(seconds, 0, safeTotal) : safeTotal;
  const consumedRatio = 1 - safeSeconds / safeTotal;

  const progress = useSharedValue(consumedRatio);
  const drift = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(consumedRatio, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });
  }, [consumedRatio, progress]);

  useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) }),
      -1,
      false
    );
  }, [drift, pulse]);

  const frameStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(drift.value, [0, 1], [-1.2, 1.2])}deg` },
      { scale: 1 + interpolate(pulse.value, [0, 1], [0, 0.03]) },
    ],
  }));

  const dialProgressProps = useAnimatedProps(() => {
    const circumference = 2 * Math.PI * 116;
    return {
      strokeDashoffset: circumference * (1 - progress.value),
      opacity: 0.95,
    };
  });

  const handProps = useAnimatedProps(() => {
    const angle = -90 + progress.value * 360;
    const radians = (angle * Math.PI) / 180;
    const length = 84;
    return {
      x2: 150 + Math.cos(radians) * length,
      y2: 150 + Math.sin(radians) * length,
    };
  });

  const secondHandProps = useAnimatedProps(() => {
    const angle = -90 + progress.value * 360;
    const radians = (angle * Math.PI) / 180;
    const length = 102;
    return {
      x2: 150 + Math.cos(radians) * length,
      y2: 150 + Math.sin(radians) * length,
      opacity: 0.2 + progress.value * 0.8,
    };
  });

  const width = size;
  const height = size;
  const viewBox = '0 0 300 300';
  const ringRadius = 116;
  const circumference = 2 * Math.PI * ringRadius;
  const dashOffset = circumference * (1 - consumedRatio);

  const tickMarks = Array.from({ length: 12 }, (_, index) => {
    const angle = (index * 30 - 90) * (Math.PI / 180);
    const inner = 95;
    const outer = 114;
    const x1 = 150 + Math.cos(angle) * inner;
    const y1 = 150 + Math.sin(angle) * inner;
    const x2 = 150 + Math.cos(angle) * outer;
    const y2 = 150 + Math.sin(angle) * outer;
    const isMajor = index % 3 === 0;

    return (
      <Line
        key={`tick-${index}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isMajor ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.38)'}
        strokeWidth={isMajor ? 5 : 3}
        strokeLinecap="round"
      />
    );
  });

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Animated.View style={[styles.frame, frameStyle]}>
        <Svg width={width} height={height} viewBox={viewBox}>
          <Defs>
            <SvgLinearGradient id="watchCase" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#5130A8" />
              <Stop offset="45%" stopColor="#261246" />
              <Stop offset="100%" stopColor="#120A22" />
            </SvgLinearGradient>
            <SvgLinearGradient id="watchFace" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#2B1C53" />
              <Stop offset="100%" stopColor="#120A22" />
            </SvgLinearGradient>
            <SvgLinearGradient id="watchRing" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#9B7BFF" />
              <Stop offset="100%" stopColor="#64B5FF" />
            </SvgLinearGradient>
            <SvgLinearGradient id="watchHand" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFF2B0" />
              <Stop offset="100%" stopColor="#F2B94C" />
            </SvgLinearGradient>
            <SvgLinearGradient id="watchSecondHand" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#7CE9F8" />
              <Stop offset="100%" stopColor="#8B5CF6" />
            </SvgLinearGradient>
          </Defs>

          <Circle cx="150" cy="150" r="135" fill="url(#watchCase)" />
          <Circle cx="150" cy="150" r="123" fill="rgba(255,255,255,0.08)" />
          <Circle cx="150" cy="150" r="116" fill="url(#watchFace)" />

          <Circle
            cx="150"
            cy="150"
            r={ringRadius}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="14"
          />
          <AnimatedCircle
            cx="150"
            cy="150"
            r={ringRadius}
            fill="none"
            stroke="url(#watchRing)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={dialProgressProps}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 150 150)"
          />

          {tickMarks}

          <Line
            x1="150"
            y1="150"
            x2="150"
            y2="74"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <AnimatedLine
            x1="150"
            y1="150"
            animatedProps={secondHandProps}
            stroke="url(#watchSecondHand)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <AnimatedLine
            x1="150"
            y1="150"
            animatedProps={handProps}
            stroke="url(#watchHand)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          <Circle cx="150" cy="150" r="14" fill="#F7F2FF" />
          <Circle cx="150" cy="150" r="6" fill="#8B5CF6" />

          <Rect x="132" y="12" width="36" height="18" rx="9" fill="rgba(255,255,255,0.14)" />
          <Rect x="132" y="270" width="36" height="18" rx="9" fill="rgba(255,255,255,0.10)" />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default QuestionClock;
