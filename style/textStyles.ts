import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { fontScale } from './responsive';

export const textStyles = StyleSheet.create({
  header: {
    fontSize: fontScale(32),
    fontWeight: '700',
    color: colors.textDark,
  },
  title: {
    fontSize: fontScale(24),
    fontWeight: '600',
    color: colors.textDark,
  },
  label: {
    fontSize: fontScale(16),
    color: colors.textMuted,
  },
  highlight: {
    fontSize: fontScale(20),
    fontWeight: '700',
  },
});
