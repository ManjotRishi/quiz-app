import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../style/colors';
import { fontScale, radiusScale, verticalScale } from '../style/responsive';

type GradientButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const GradientButton = ({
  label,
  onPress,
  disabled,
  style,
}: GradientButtonProps) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={disabled} style={style}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.9 }}
        style={[styles.button, disabled && styles.disabled]}
      >
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radiusScale(20),
    minHeight: verticalScale(58),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },
  label: {
    color: '#F8FBFF',
    fontSize: fontScale(17),
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.6,
  },
});
