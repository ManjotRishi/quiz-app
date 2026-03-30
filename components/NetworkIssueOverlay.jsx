import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../style/colors';
import { fontScale, radiusScale, spaceScale, verticalScale } from '../style/responsive';

const NetworkIssueOverlay = ({
  visible = false,
  title = 'Connection issue',
  message = 'Please check your internet and try again.',
  actionLabel = 'Retry',
  onRetry,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <LinearGradient
        colors={['rgba(2, 4, 12, 0.68)', 'rgba(16, 8, 30, 0.82)', 'rgba(7, 10, 22, 0.92)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backdrop}
      >
        <View style={styles.card}>
          <View style={styles.signalRing}>
            <View style={styles.signalDot} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity activeOpacity={0.85} onPress={onRetry} style={styles.buttonWrap}>
            <LinearGradient
              colors={['#7C3AED', '#4F46E5', '#1D4ED8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{actionLabel}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 12,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spaceScale(20),
  },
  card: {
    width: '100%',
    maxWidth: 340,
    paddingHorizontal: spaceScale(20),
    paddingVertical: spaceScale(22),
    borderRadius: radiusScale(28),
    alignItems: 'center',
    backgroundColor: 'rgba(8, 10, 18, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  signalRing: {
    width: verticalScale(86),
    height: verticalScale(86),
    borderRadius: verticalScale(43),
    borderWidth: 2,
    borderColor: 'rgba(124, 233, 248, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spaceScale(16),
  },
  signalDot: {
    width: verticalScale(28),
    height: verticalScale(28),
    borderRadius: verticalScale(14),
    backgroundColor: '#7CE9F8',
    shadowColor: '#7CE9F8',
    shadowOpacity: 0.75,
    shadowRadius: 12,
  },
  title: {
    color: colors.textDark,
    fontSize: fontScale(22),
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
  buttonWrap: {
    marginTop: spaceScale(18),
    width: '100%',
  },
  button: {
    height: verticalScale(48),
    borderRadius: radiusScale(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#F8F4FF',
    fontSize: fontScale(15),
    fontWeight: '900',
  },
});

export default NetworkIssueOverlay;
