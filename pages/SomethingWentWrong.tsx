import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorIllustration } from '../components/svg';
import { colors } from '../style/colors';
import { fontScale, radiusScale, spaceScale, verticalScale } from '../style/responsive';

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

const SomethingWentWrong = ({
  title = 'Something went wrong',
  message = 'We hit an unexpected issue. You can try again or return to the home screen.',
  onRetry,
}: Props) => (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="light-content" backgroundColor={colors.background} translucent={false} />

    <LinearGradient
      colors={['#04020A', '#1A0B33', '#250D4A', '#09102A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <View style={styles.card}>
        <View style={styles.artWrap}>
          <ErrorIllustration style={styles.art} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <TouchableOpacity activeOpacity={0.85} onPress={onRetry} style={styles.retryButton}>
          <LinearGradient
            colors={['#8B5CF6', '#60A5FA', '#2B115A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.retryGradient}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  </SafeAreaView>
);

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
  glowOne: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(124,233,248,0.12)',
  },
  glowTwo: {
    position: 'absolute',
    left: -50,
    bottom: 60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,214,102,0.08)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    paddingHorizontal: spaceScale(20),
    paddingTop: spaceScale(22),
    paddingBottom: spaceScale(24),
    borderRadius: radiusScale(30),
    backgroundColor: 'rgba(7,10,18,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 10,
    alignItems: 'center',
  },
  artWrap: {
    width: '100%',
    height: verticalScale(190),
    marginBottom: spaceScale(6),
  },
  art: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: colors.textDark,
    fontSize: fontScale(24),
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    marginTop: spaceScale(10),
    color: colors.textMuted,
    fontSize: fontScale(15),
    lineHeight: fontScale(22),
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spaceScale(20),
    width: '100%',
  },
  retryGradient: {
    height: verticalScale(48),
    borderRadius: radiusScale(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: '#F8F4FF',
    fontSize: fontScale(15),
    fontWeight: '900',
  },
});

export default SomethingWentWrong;
