import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../style/colors';
import { fontScale, radiusScale, spaceScale } from '../style/responsive';

const More = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />

      <LinearGradient
        colors={['#04020A', '#1A0B33', '#250D4A', '#09102A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.heroCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>MORE</Text>
          </View>
          <Text style={styles.title}>i am more Text</Text>
          <Text style={styles.subtitle}>
            A simple placeholder screen with the new bottom tab styling.
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default More;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spaceScale(20),
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: 'rgba(8,11,22,0.88)',
    borderRadius: radiusScale(34),
    paddingHorizontal: spaceScale(24),
    paddingVertical: spaceScale(34),
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(139,92,246,0.18)',
    borderRadius: 999,
    paddingHorizontal: spaceScale(14),
    paddingVertical: spaceScale(8),
  },
  badgeText: {
    color: '#F4F7FF',
    fontSize: fontScale(12),
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    marginTop: spaceScale(22),
    fontSize: fontScale(30),
    lineHeight: fontScale(38),
    color: '#F4F7FF',
    fontWeight: '800',
  },
  subtitle: {
    marginTop: spaceScale(10),
    fontSize: fontScale(16),
    lineHeight: fontScale(24),
    color: colors.textMuted,
  },
});
