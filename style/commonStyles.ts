import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { radiusScale, spaceScale } from './responsive';

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spaceScale(20),
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.panelGlass,
    borderRadius: radiusScale(25),
    padding: spaceScale(20),
    marginVertical: spaceScale(8),
    shadowColor: '#0A0F2E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
});
