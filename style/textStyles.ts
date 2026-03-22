import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const textStyles = StyleSheet.create({
  header: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textDark,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textDark,
  },
  label: {
    fontSize: 16,
    color: colors.textMuted,
  },
  highlight: {
    fontSize: 20,
    fontWeight: '700',
  },
});
