import React, { useCallback, useEffect, useState } from 'react';
import { AppState, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RESULTS, checkNotifications, openSettings, requestNotifications } from 'react-native-permissions';
import { colors } from '../style/colors';
import { fontScale, radiusScale, spaceScale, verticalScale } from '../style/responsive';

const requiresRuntimeNotificationPermission =
  Platform.OS === 'android' && Number(Platform.Version) >= 33;

const NotificationPermissionGate = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const syncNotificationStatus = useCallback(async () => {
    if (!requiresRuntimeNotificationPermission) {
      setIsVisible(false);
      return true;
    }

    try {
      const { status } = await checkNotifications();
      const granted = status === RESULTS.GRANTED;
      setIsVisible(!granted);
      return granted;
    } catch (error) {
      console.warn('Failed to check notification permission:', error);
      setIsVisible(true);
      return false;
    }
  }, []);

  useEffect(() => {
    syncNotificationStatus().catch((error) => {
      console.warn('Initial notification permission check failed:', error);
    });
  }, [syncNotificationStatus]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        syncNotificationStatus().catch((error) => {
          console.warn('Notification permission refresh failed:', error);
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [syncNotificationStatus]);

  const handleAllowNotifications = useCallback(async () => {
    if (!requiresRuntimeNotificationPermission || isBusy) {
      return;
    }

    setIsBusy(true);

    try {
      const currentGranted = await syncNotificationStatus();

      if (currentGranted) {
        return;
      }

      const { status } = await requestNotifications(['alert', 'sound']);

      if (status === RESULTS.GRANTED) {
        setIsVisible(false);
        return;
      }

      try {
        await openSettings('notifications');
      } catch (error) {
        console.warn('Failed to open notification settings panel:', error);
        await openSettings('application');
      }
    } catch (error) {
      console.warn('Notification permission flow failed:', error);

      try {
        await openSettings('notifications');
      } catch (settingsError) {
        console.warn('Failed to open notification settings fallback:', settingsError);
      }
    } finally {
      setIsBusy(false);
    }
  }, [isBusy, syncNotificationStatus]);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <LinearGradient
        colors={['rgba(2, 4, 12, 0.78)', 'rgba(18, 8, 34, 0.92)', 'rgba(7, 10, 22, 0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backdrop}
      >
        <View style={styles.card}>
          <View style={styles.iconRing}>
            <View style={styles.iconBell} />
          </View>
          <Text style={styles.title}>Allow Notifications</Text>
          <Text style={styles.message}>
            Notifications are required for quiz alerts and updates. Please allow notifications to continue using the app.
          </Text>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleAllowNotifications}
            style={styles.buttonWrap}
            disabled={isBusy}
          >
            <LinearGradient
              colors={['#F97316', '#EA580C', '#C2410C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {isBusy ? 'Opening Settings...' : 'Allow Notifications'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            If the popup does not appear, the app will open your notification settings panel.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 300,
    elevation: 30,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spaceScale(20),
  },
  card: {
    width: '100%',
    maxWidth: 360,
    paddingHorizontal: spaceScale(22),
    paddingVertical: spaceScale(24),
    borderRadius: radiusScale(30),
    alignItems: 'center',
    backgroundColor: 'rgba(8, 10, 18, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.34,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 20 },
    elevation: 18,
  },
  iconRing: {
    width: verticalScale(88),
    height: verticalScale(88),
    borderRadius: verticalScale(44),
    borderWidth: 2,
    borderColor: 'rgba(251, 146, 60, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spaceScale(16),
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
  },
  iconBell: {
    width: verticalScale(30),
    height: verticalScale(30),
    borderRadius: verticalScale(15),
    backgroundColor: '#FB923C',
    shadowColor: '#FB923C',
    shadowOpacity: 0.8,
    shadowRadius: 16,
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
  buttonWrap: {
    marginTop: spaceScale(20),
    width: '100%',
  },
  button: {
    height: verticalScale(50),
    borderRadius: radiusScale(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF7ED',
    fontSize: fontScale(15),
    fontWeight: '900',
  },
  helperText: {
    marginTop: spaceScale(12),
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
    textAlign: 'center',
  },
});

export default NotificationPermissionGate;
