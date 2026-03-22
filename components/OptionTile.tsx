import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../style/colors';

type OptionTileProps = {
  option: string;
  onSelect: () => void;
  isSelected: boolean;
  isCorrect?: boolean;
  disabled?: boolean;
};

export const OptionTile = ({
  option,
  onSelect,
  isSelected,
  isCorrect,
  disabled,
}: OptionTileProps) => {
  const textColor = isSelected && isCorrect ? '#fff' : colors.textDark;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onSelect}
      style={[
        styles.container,
        !isSelected && styles.unselected,
        isSelected && isCorrect && styles.selectedCorrect,
        isSelected && !isCorrect && styles.selectedIncorrect,
      ]}
    >
      <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
      {isSelected && isCorrect && <View style={styles.check} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  unselected: {
    backgroundColor: colors.card,
    borderColor: colors.optionBorder,
  },
  selectedCorrect: {
    backgroundColor: colors.success,
    borderColor: 'transparent',
  },
  selectedIncorrect: {
    backgroundColor: colors.optionSelected,
    borderColor: 'transparent',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
});
