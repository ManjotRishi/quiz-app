import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { fontScale, radiusScale, spaceScale, verticalScale } from '../style/responsive';

type OptionTileProps = {
  option: string;
  onSelect: () => void;
  isSelected: boolean;
  isCorrect?: boolean;
  showCorrectAnswer?: boolean;
  disabled?: boolean;
  index?: number;
  layout?: {
    optionMinHeight?: number;
    optionRadius?: number;
    optionPadding?: number;
    optionBadgeSize?: number;
    optionBadgeMarginRight?: number;
    optionBadgeFontSize?: number;
    optionTextFontSize?: number;
    optionTextLineHeight?: number;
  };
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
  layout,
}: OptionTileProps) => {
  const isMarkedCorrect = Boolean((isSelected && isCorrect) || showCorrectAnswer);
  const isMarkedIncorrect = Boolean(isSelected && !isCorrect);
  const textColor = isMarkedCorrect || isMarkedIncorrect ? '#F8FBFF' : '#F2FBFF';
  const badgeLabel = OPTION_LABELS[index] ?? `${index + 1}`;
  const gradientColors = isMarkedCorrect
    ? ['rgba(20,184,166,0.98)', 'rgba(56,189,248,0.86)']
    : isMarkedIncorrect
      ? ['rgba(249,115,22,0.96)', 'rgba(255,138,91,0.86)']
      : ['#119A94', '#30B8D3', '#F59E0B'];

  return (
    <View style={[styles.container, layout ? { borderRadius: layout.optionRadius } : null]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          layout
            ? {
                minHeight: layout.optionMinHeight,
                borderRadius: layout.optionRadius,
                padding: layout.optionPadding,
              }
            : null,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={disabled}
          onPress={onSelect}
          style={styles.selectableArea}
        >
          <View
            style={[
              styles.badge,
              layout
                ? {
                    width: layout.optionBadgeSize,
                    height: layout.optionBadgeSize,
                    borderRadius: (layout.optionBadgeSize ?? 0) / 2,
                    marginRight: layout.optionBadgeMarginRight,
                  }
                : null,
              !isMarkedCorrect && !isMarkedIncorrect && styles.badgeDefault,
              isMarkedCorrect && styles.badgeCorrect,
              isMarkedIncorrect && styles.badgeIncorrect,
            ]}
          >
            <Text
              allowFontScaling={false}
              style={[
                styles.badgeText,
                layout ? { fontSize: layout.optionBadgeFontSize } : null,
                isMarkedCorrect && styles.badgeTextOnDark,
                isMarkedIncorrect && styles.badgeTextOnDark,
              ]}
            >
              {badgeLabel}
            </Text>
          </View>

          <Text
            allowFontScaling={false}
            style={[
              styles.optionText,
              { color: textColor },
              layout
                ? {
                    fontSize: layout.optionTextFontSize,
                    lineHeight: layout.optionTextLineHeight,
                  }
                : null,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radiusScale(22),
    marginVertical: spaceScale(6),
    shadowColor: '#04131D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.22)',
  },
  gradient: {
    minHeight: verticalScale(62),
    borderRadius: radiusScale(22),
    padding: spaceScale(14),
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectableArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spaceScale(12),
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
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  badgeCorrect: {
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  badgeIncorrect: {
    backgroundColor: 'rgba(255,244,238,0.20)',
  },
  badgeText: {
    color: '#F4F7FF',
    fontSize: fontScale(12),
    fontWeight: '700',
  },
  badgeTextOnDark: {
    color: '#F8F4FF',
  },
  optionText: {
    flex: 1,
    fontSize: fontScale(14),
    lineHeight: fontScale(20),
    fontWeight: '600',
  },
});
