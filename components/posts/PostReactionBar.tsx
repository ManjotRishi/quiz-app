import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { PostLikeIcon } from '../icons/AppShellIcons';
import { fontScale, radiusScale, spaceScale } from '../../style/responsive';

export type UserReaction = 'liked' | null;

type PostReactionBarProps = {
  likeCount: number;
  onPress: () => void;
  reaction: UserReaction;
};

const AnimatedText = Animated.createAnimatedComponent(Text);

const formatReactionCount = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0';
  }

  if (value >= 1000) {
    const compactValue = Math.round((value / 1000) * 10) / 10;
    const formattedValue = Number.isInteger(compactValue)
      ? String(compactValue)
      : compactValue.toFixed(1).replace(/\.0$/, '');

    return `${formattedValue}k`;
  }

  return String(value);
};

const PostReactionBar = ({ likeCount, onPress, reaction }: PostReactionBarProps) => {
  const isLiked = reaction === 'liked';
  const progress = useSharedValue(isLiked ? 1 : 0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(isLiked ? 1 : 0, {
      damping: 15,
      stiffness: 180,
      mass: 0.9,
    });

    if (isLiked) {
      pulse.value = 0;
      pulse.value = withSequence(
        withTiming(1, { duration: 220 }),
        withTiming(0, { duration: 340 })
      );
      return;
    }

    pulse.value = withTiming(0, { duration: 140 });
  }, [isLiked, progress, pulse]);

  const buttonStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(56,189,248,0.14)', 'rgba(251,146,60,0.34)']
    ),
    shadowOpacity: interpolate(progress.value, [0, 1], [0.14, 0.32]),
    shadowRadius: interpolate(progress.value, [0, 1], [12, 20]),
    transform: [
      {
        scale: 1 + interpolate(pulse.value, [0, 1], [0, 0.03]),
      },
    ],
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale:
          1 +
          interpolate(progress.value, [0, 1], [0, 0.05]) +
          interpolate(pulse.value, [0, 1], [0, 0.14]),
      },
    ],
    shadowOpacity: interpolate(progress.value, [0, 1], [0.18, 0.42]),
  }));

  const orbGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.86, 1.08]) }],
  }));

  const countStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], ['rgba(255,255,255,0.84)', '#FFFFFF']),
    transform: [{ translateY: interpolate(pulse.value, [0, 1], [0, -1]) }],
  }));

  const dividerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(255,255,255,0.12)', 'rgba(255,125,184,0.36)']
    ),
  }));

  return (
    <View style={styles.shell}>
      <Animated.View style={[styles.pillWrap, buttonStyle]}>
        <LinearGradient
          colors={['rgba(18,15,37,0.92)', 'rgba(13,12,30,0.96)', 'rgba(16,14,28,0.98)']}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.pill}
        >
          <Pressable onPress={onPress} style={styles.pressable}>
            <Animated.View style={[styles.orbGlow, orbGlowStyle]} />

            <Animated.View style={[styles.orb, orbStyle]}>
              <LinearGradient
                colors={
                  isLiked
                    ? ['#14B8A6', '#0EA5E9', '#FB923C']
                    : ['rgba(18,31,45,0.94)', 'rgba(12,24,36,0.98)', 'rgba(8,18,29,1)']
                }
                end={{ x: 0.9, y: 0.95 }}
                start={{ x: 0.15, y: 0.05 }}
                style={styles.orbFill}
              />
              <PostLikeIcon color={isLiked ? '#FFF7FB' : '#8C84AF'} filled={isLiked} size={18} />
            </Animated.View>

            <Animated.View style={[styles.divider, dividerStyle]} />

            <AnimatedText style={[styles.count, countStyle]}>
              {formatReactionCount(likeCount)}
            </AnimatedText>
          </Pressable>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    marginTop: spaceScale(12),
    alignItems: 'flex-start',
  },
  pillWrap: {
    borderRadius: radiusScale(999),
    borderWidth: 1,
    shadowColor: '#070312',
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
    overflow: 'hidden',
  },
  pill: {
    borderRadius: radiusScale(999),
  },
  pressable: {
    minHeight: spaceScale(42),
    minWidth: spaceScale(104),
    paddingLeft: spaceScale(8),
    paddingRight: spaceScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceScale(8),
  },
  orbGlow: {
    position: 'absolute',
    left: spaceScale(4),
    width: spaceScale(36),
    height: spaceScale(36),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(14,165,233,0.22)',
  },
  orb: {
    width: spaceScale(30),
    height: spaceScale(30),
    borderRadius: radiusScale(999),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
  },
  orbFill: {
    ...StyleSheet.absoluteFillObject,
  },
  divider: {
    width: 1,
    height: spaceScale(18),
    borderRadius: radiusScale(999),
  },
  count: {
    fontSize: fontScale(13),
    fontWeight: '500',
    letterSpacing: 0,
  },
});

export default PostReactionBar;
