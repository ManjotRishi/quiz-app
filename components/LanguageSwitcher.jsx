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
import { fontScale } from '../style/responsive';

export const DEFAULT_LANGUAGE_OPTIONS = [
  { key: 'English', label: 'English' },
  { key: 'Hindi', label: 'Hindi' },
  { key: 'Punjabi', label: 'Punjabi' },
];

const LanguageChip = ({ option, isActive, onPress, layout, variant }) => {
  const isSegmentedLight = variant === 'segmentedLight';
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
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.chipHit,
        layout
          ? {
              minWidth: layout.languageChipMinWidth,
            }
          : null,
      ]}
    >
      <Animated.View
        style={[
          styles.chip,
          isSegmentedLight ? styles.chipSegmented : null,
          chipStyle,
          isActive && styles.chipActive,
          isActive && isSegmentedLight ? styles.chipActiveSegmented : null,
        ]}
      >
        <LinearGradient
          colors={
            isSegmentedLight
              ? isActive
                ? ['#119A94', '#33B8D1', '#F2B21A']
                : ['rgba(255,255,255,0.92)', 'rgba(243,250,247,0.96)']
              : isActive
                ? ['rgba(20,184,166,0.28)', 'rgba(56,189,248,0.18)', 'rgba(251,146,60,0.18)']
                : ['rgba(13,34,50,0.92)', 'rgba(20,54,77,0.86)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.chipGradient,
            isSegmentedLight ? styles.chipGradientSegmented : null,
            layout
              ? {
                  minHeight: layout.languageChipMinHeight,
                  paddingVertical: layout.isVeryNarrow ? 5 : 6,
                  paddingHorizontal: layout.languageChipPaddingHorizontal,
                }
              : null,
          ]}
        >
          {!isSegmentedLight ? <Animated.View pointerEvents="none" style={[styles.shine, shineStyle]} /> : null}
          {!isSegmentedLight ? <Animated.View pointerEvents="none" style={[styles.droplet, dropletStyle]} /> : null}
          <Text
            allowFontScaling={false}
            style={[
              styles.label,
              isSegmentedLight ? styles.labelSegmented : null,
              isActive && styles.labelActive,
              isActive && isSegmentedLight ? styles.labelActiveSegmented : null,
              layout ? { fontSize: layout.languageLabelFontSize } : null,
            ]}
          >
            {option.label}
          </Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const LanguageSwitcher = ({
  value,
  options = DEFAULT_LANGUAGE_OPTIONS,
  onChange,
  style = undefined,
  layout = undefined,
  variant = 'default',
}) => {
  const isSegmentedLight = variant === 'segmentedLight';

  return (
    <View
      style={[
        styles.container,
        isSegmentedLight ? styles.containerSegmented : null,
        style,
        layout
          ? {
              gap: layout.languageContainerGap,
              padding: layout.languageContainerPadding,
              maxWidth: Math.min(layout.languageContainerMaxWidth, isSegmentedLight ? 420 : layout.languageContainerMaxWidth),
            }
          : null,
      ]}
    >
      {options.map((option) => {
        const isActive = value === option.key;

        return (
          <LanguageChip
            key={option.key}
            option={option}
            isActive={isActive}
            layout={layout}
            variant={variant}
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
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 7,
    padding: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(10,29,41,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.18)',
    shadowColor: '#0B2232',
    shadowOpacity: 0.26,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  containerSegmented: {
    flexWrap: 'nowrap',
    borderRadius: 20,
    backgroundColor: '#DDF0EA',
    borderColor: 'rgba(17,154,148,0.14)',
    shadowColor: '#0A2534',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  chipHit: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 82,
  },
  chip: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  chipSegmented: {
    borderRadius: 16,
  },
  chipActive: {
    shadowColor: '#0F766E',
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  chipActiveSegmented: {
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  chipGradient: {
    minWidth: 0,
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  chipGradientSegmented: {
    borderRadius: 16,
    borderColor: 'rgba(17,154,148,0.08)',
  },
  label: {
    color: '#D7EDF5',
    fontSize: fontScale(12),
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  labelSegmented: {
    color: '#335B57',
    fontWeight: '800',
  },
  labelActive: {
    color: '#F8FBFF',
  },
  labelActiveSegmented: {
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(251,146,60,0.58)',
  },
});
