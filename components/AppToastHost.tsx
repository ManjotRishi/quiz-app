import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontScale, radiusScale, spaceScale } from '../style/responsive';
import { setToastListener } from '../util/toastFeedback';

type ToastType = 'success' | 'error' | 'info';

type ToastPayload = {
  title: string;
  message?: string;
  type?: ToastType;
};

type ToastState = {
  id: number;
  title: string;
  message: string;
  type: ToastType;
  visible: boolean;
};

const INITIAL_STATE: ToastState = {
  id: 0,
  title: '',
  message: '',
  type: 'success',
  visible: false,
};

const TOAST_COLORS: Record<ToastType, [string, string, string]> = {
  success: ['#0E8FA1', '#4FD1C5', '#F4B36F'],
  error: ['#B91C1C', '#F97316', '#F59E0B'],
  info: ['#1D4ED8', '#38BDF8', '#7DD3FC'],
};

const TOAST_ACCENTS: Record<ToastType, string> = {
  success: 'rgba(134, 239, 172, 0.92)',
  error: 'rgba(254, 202, 202, 0.96)',
  info: 'rgba(191, 219, 254, 0.96)',
};

const AppToastHost = () => {
  const insets = useSafeAreaInsets();
  const [toastState, setToastState] = useState<ToastState>(INITIAL_STATE);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translateY = useRef(new Animated.Value(-24)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = setToastListener((payload: ToastPayload) => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      setToastState({
        id: Date.now(),
        title: payload.title,
        message: payload.message ?? '',
        type: payload.type ?? 'success',
        visible: true,
      });
    });

    return () => {
      unsubscribe();

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!toastState.visible) {
      return;
    }

    translateY.stopAnimation();
    opacity.stopAnimation();
    translateY.setValue(-24);
    opacity.setValue(0);

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    hideTimerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -18,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setToastState(INITIAL_STATE);
        }
      });
    }, 2600);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [opacity, toastState.id, toastState.visible, translateY]);

  const toastColors = useMemo(
    () => TOAST_COLORS[toastState.type] ?? TOAST_COLORS.success,
    [toastState.type]
  );

  if (!toastState.visible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View
        style={[
          styles.wrap,
          {
            paddingTop: Math.max(insets.top, spaceScale(14)),
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <LinearGradient colors={toastColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.outerCard}>
          <View style={styles.innerCard}>
            <View style={[styles.accentDot, { backgroundColor: TOAST_ACCENTS[toastState.type] ?? TOAST_ACCENTS.success }]} />
            <View style={styles.copyWrap}>
              <Text style={styles.title}>{toastState.title}</Text>
              {toastState.message ? <Text style={styles.message}>{toastState.message}</Text> : null}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 60,
  },
  wrap: {
    paddingHorizontal: spaceScale(16),
  },
  outerCard: {
    borderRadius: radiusScale(22),
    padding: 1,
  },
  innerCard: {
    minHeight: spaceScale(62),
    borderRadius: radiusScale(21),
    backgroundColor: 'rgba(4, 12, 22, 0.92)',
    paddingHorizontal: spaceScale(16),
    paddingVertical: spaceScale(14),
    flexDirection: 'row',
    alignItems: 'center',
  },
  accentDot: {
    width: spaceScale(10),
    height: spaceScale(10),
    borderRadius: radiusScale(999),
    marginRight: spaceScale(12),
  },
  copyWrap: {
    flex: 1,
  },
  title: {
    color: '#F8FAFC',
    fontSize: fontScale(14),
    fontWeight: '900',
  },
  message: {
    marginTop: spaceScale(4),
    color: 'rgba(226,232,240,0.84)',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
    fontWeight: '600',
  },
});

export default AppToastHost;
