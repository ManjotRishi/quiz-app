import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export const DEFAULT_LANGUAGE_OPTIONS = [
  { key: 'English', label: 'English' },
  { key: 'Hindi', label: 'Hindi' },
  { key: 'Punjabi', label: 'Punjabi' },
];

const LanguageChip = ({ option, isActive, onPress }) => {
  const activeProgress = useSharedValue(isActive ? 1 : 0);
  const ripple = useSharedValue(0);

  useEffect(() => {
    activeProgress.value = withTiming(isActive ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });

    if (isActive) {
      ripple.value = withSequence(
        withTiming(1, { duration: 140, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) })
      );
    }
  }, [activeProgress, isActive, ripple]);

  const chipStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(activeProgress.value, [0, 1], [0, -1.5]) },
      { scale: interpolate(activeProgress.value, [0, 1], [1, 1.03]) },
    ],
  }));

  const shineStyle = useAnimatedStyle(() => ({
    opacity: interpolate(activeProgress.value, [0, 1], [0.08, 0.34]),
    transform: [
      { translateX: interpolate(activeProgress.value, [0, 1], [-4, 3]) },
      { translateY: interpolate(activeProgress.value, [0, 1], [4, 0]) },
      { scale: interpolate(activeProgress.value, [0, 1], [0.92, 1.05]) },
    ],
  }));

  const dropletStyle = useAnimatedStyle(() => ({
    opacity: ripple.value === 0 ? 0 : interpolate(ripple.value, [0, 0.2, 1], [0, 1, 0]),
    transform: [
      { translateY: interpolate(ripple.value, [0, 1], [-6, 7]) },
      { scale: interpolate(ripple.value, [0, 0.2, 1], [0.4, 1.1, 0.65]) },
    ],
  }));

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.chipHit}>
      <Animated.View style={[styles.chip, chipStyle, isActive && styles.chipActive]}>
        <LinearGradient
          colors={
            isActive
              ? ['rgba(245,248,255,0.34)', 'rgba(255,255,255,0.08)', 'rgba(70,97,214,0.20)']
              : ['rgba(15,20,40,0.82)', 'rgba(20,28,58,0.72)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.chipGradient}
        >
          <Animated.View pointerEvents="none" style={[styles.shine, shineStyle]} />
          <Animated.View pointerEvents="none" style={[styles.droplet, dropletStyle]} />
          <Text style={[styles.label, isActive && styles.labelActive]}>{option.label}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const LanguageSwitcher = ({ value, options = DEFAULT_LANGUAGE_OPTIONS, onChange, style }) => {
  return (
    <View style={[styles.container, style]}>
      {options.map((option) => {
        const isActive = value === option.key;

        return (
          <LanguageChip
            key={option.key}
            option={option}
            isActive={isActive}
            onPress={() => onChange(option.key)}
          />
        );
      })}
    </View>
  );
};

export default LanguageSwitcher;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    padding: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(8,11,22,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(116,155,255,0.16)',
    shadowColor: '#09152C',
    shadowOpacity: 0.26,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  chipHit: {
    minWidth: 72,
  },
  chip: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  chipActive: {
    shadowColor: '#6D43B5',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  chipGradient: {
    minWidth: 72,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  label: {
    color: '#C9D5F6',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  labelActive: {
    color: '#F7F3FF',
  },
  shine: {
    position: 'absolute',
    top: -10,
    left: 10,
    width: 28,
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.28)',
    transform: [{ rotate: '18deg' }],
  },
  droplet: {
    position: 'absolute',
    top: 4,
    right: 11,
    width: 7,
    height: 11,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});
