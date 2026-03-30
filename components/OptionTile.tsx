import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../style/colors';
import { fontScale, radiusScale, spaceScale, verticalScale } from '../style/responsive';

type OptionTileProps = {
  option: string;
  onSelect: () => void;
  isSelected: boolean;
  isCorrect?: boolean;
  showCorrectAnswer?: boolean;
  disabled?: boolean;
  index?: number;
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export const OptionTile = ({
  option,
  onSelect,
  isSelected,
  isCorrect,
  showCorrectAnswer,
  disabled,
  index = 0,
}: OptionTileProps) => {
  const isMarkedCorrect = Boolean((isSelected && isCorrect) || showCorrectAnswer);
  const isMarkedIncorrect = Boolean(isSelected && !isCorrect);
  const textColor = isMarkedCorrect || isMarkedIncorrect ? '#F4F7FF' : '#EAF2FF';
  const badgeLabel = OPTION_LABELS[index] ?? `${index + 1}`;
  const gradientColors = isMarkedCorrect
    ? ['rgba(72,208,166,0.95)', 'rgba(96,165,250,0.76)']
    : isMarkedIncorrect
      ? ['rgba(255,127,99,0.95)', 'rgba(255,176,92,0.78)']
      : ['rgba(43,17,90,0.98)', 'rgba(21,11,38,0.95)'];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onSelect}
      style={styles.container}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View
          style={[
            styles.badge,
            !isMarkedCorrect && !isMarkedIncorrect && styles.badgeDefault,
            isMarkedCorrect && styles.badgeCorrect,
            isMarkedIncorrect && styles.badgeIncorrect,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              isMarkedCorrect && styles.badgeTextOnDark,
              isMarkedIncorrect && styles.badgeTextOnDark,
            ]}
          >
            {badgeLabel}
          </Text>
        </View>

        <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>

        <View
          style={[
            styles.trailingCircle,
            isMarkedCorrect && styles.trailingCircleCorrect,
            isMarkedIncorrect && styles.trailingCircleIncorrect,
          ]}
        >
          {isMarkedCorrect && <View style={styles.check} />}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radiusScale(22),
    marginVertical: spaceScale(6),
    shadowColor: '#0A102E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124,233,248,0.15)',
  },
  gradient: {
    minHeight: verticalScale(66),
    borderRadius: radiusScale(22),
    padding: spaceScale(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    width: spaceScale(34),
    height: spaceScale(34),
    borderRadius: radiusScale(17),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spaceScale(14),
  },
  badgeDefault: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  badgeCorrect: {
    backgroundColor: 'rgba(139,92,246,0.95)',
  },
  badgeIncorrect: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  badgeText: {
    color: '#F4F7FF',
    fontSize: fontScale(13),
    fontWeight: '700',
  },
  badgeTextOnDark: {
    color: '#F8F4FF',
  },
  optionText: {
    flex: 1,
    fontSize: fontScale(15),
    lineHeight: fontScale(22),
    fontWeight: '500',
  },
  trailingCircle: {
    width: spaceScale(20),
    height: spaceScale(20),
    borderRadius: radiusScale(10),
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spaceScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  trailingCircleCorrect: {
    backgroundColor: colors.gradientStart,
    borderColor: colors.gradientStart,
  },
  trailingCircleIncorrect: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.18)',
  },
  check: {
    width: spaceScale(8),
    height: spaceScale(8),
    borderRadius: radiusScale(4),
    backgroundColor: '#F8F4FF',
  },
});
