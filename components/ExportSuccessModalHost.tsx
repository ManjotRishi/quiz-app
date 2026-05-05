import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DownloadOutlineIcon } from './icons/AppShellIcons';
import { setExportSuccessListener } from '../util/exportFeedback';
import { fontScale, radiusScale, spaceScale } from '../style/responsive';

type ExportSuccessState = {
  path: string;
  title: string;
  visible: boolean;
};

const INITIAL_STATE: ExportSuccessState = {
  path: '',
  title: 'Question file saved',
  visible: false,
};

type ExportSuccessPayload = {
  path: string;
  title?: string;
};

const ExportSuccessModalHost = () => {
  const insets = useSafeAreaInsets();
  const [modalState, setModalState] = useState<ExportSuccessState>(INITIAL_STATE);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const cardTranslate = useRef(new Animated.Value(28)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const glowLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const unsubscribe = setExportSuccessListener(({ path, title }: ExportSuccessPayload) => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      setModalState({
        path,
        title: title || 'Question file saved',
        visible: true,
      });
    });

    return () => {
      unsubscribe();

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      glowLoopRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!modalState.visible) {
      return;
    }

    overlayOpacity.setValue(0);
    cardScale.setValue(0.9);
    cardTranslate.setValue(28);
    glowPulse.setValue(0);

    glowLoopRef.current?.stop();
    glowLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        speed: 16,
        bounciness: 8,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslate, {
        toValue: 0,
        speed: 16,
        bounciness: 7,
        useNativeDriver: true,
      }),
    ]).start();
    glowLoopRef.current.start();

    hideTimerRef.current = setTimeout(() => {
      handleClose();
    }, 3200);

    return () => {
      glowLoopRef.current?.stop();
    };
  }, [cardScale, cardTranslate, glowPulse, modalState.visible, overlayOpacity]);

  const handleClose = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    glowLoopRef.current?.stop();

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.96,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslate, {
        toValue: 18,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setModalState(INITIAL_STATE);
      }
    });
  };

  const glowStyle = useMemo(
    () => ({
      opacity: glowPulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.28, 0.58],
      }),
      transform: [
        {
          scale: glowPulse.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.08],
          }),
        },
      ],
    }),
    [glowPulse]
  );

  return (
    <Modal animationType="none" transparent statusBarTranslucent visible={modalState.visible}>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View
          style={[
            styles.cardWrap,
            {
              paddingBottom: Math.max(insets.bottom, spaceScale(16)),
              transform: [{ translateY: cardTranslate }, { scale: cardScale }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(10,19,32,0.98)', 'rgba(19,40,56,0.98)', 'rgba(14,29,43,0.98)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <Animated.View style={[styles.iconGlow, glowStyle]} />
            <LinearGradient
              colors={['#0E8FA1', '#73C4C0', '#F4B36F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconWrap}
            >
              <View style={styles.iconInner}>
                <DownloadOutlineIcon color="#FDFCF7" size={22} />
              </View>
            </LinearGradient>

            <Text style={styles.title}>{modalState.title}</Text>
            <Text style={styles.subtitle}>Your question file is now stored on this device.</Text>

            <View style={styles.pathCard}>
              <Text style={styles.pathLabel}>Saved location</Text>
              <Text numberOfLines={3} style={styles.pathText}>
                {modalState.path}
              </Text>
            </View>

            <TouchableOpacity activeOpacity={0.9} onPress={handleClose} style={styles.buttonTouch}>
              <LinearGradient
                colors={['#0E8FA1', '#73C4C0', '#F4B36F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Nice</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 8, 14, 0.62)',
    justifyContent: 'flex-end',
    paddingHorizontal: spaceScale(16),
    paddingTop: spaceScale(24),
  },
  cardWrap: {
    width: '100%',
  },
  card: {
    borderRadius: radiusScale(28),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: spaceScale(22),
    paddingTop: spaceScale(22),
    paddingBottom: spaceScale(22),
    overflow: 'hidden',
  },
  iconGlow: {
    position: 'absolute',
    top: spaceScale(16),
    alignSelf: 'center',
    width: spaceScale(86),
    height: spaceScale(86),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(115,196,192,0.28)',
  },
  iconWrap: {
    alignSelf: 'center',
    width: spaceScale(62),
    height: spaceScale(62),
    borderRadius: radiusScale(999),
    padding: spaceScale(2),
    marginBottom: spaceScale(14),
  },
  iconInner: {
    flex: 1,
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(9,15,22,0.30)',
  },
  title: {
    color: '#F8FAFC',
    fontSize: fontScale(21),
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spaceScale(8),
    color: 'rgba(226,232,240,0.78)',
    fontSize: fontScale(13),
    lineHeight: fontScale(20),
    textAlign: 'center',
  },
  pathCard: {
    marginTop: spaceScale(18),
    borderRadius: radiusScale(18),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: spaceScale(14),
    paddingVertical: spaceScale(12),
  },
  pathLabel: {
    color: 'rgba(148,163,184,0.88)',
    fontSize: fontScale(11),
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  pathText: {
    marginTop: spaceScale(7),
    color: '#E2E8F0',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
    fontWeight: '600',
  },
  buttonTouch: {
    marginTop: spaceScale(18),
  },
  button: {
    minHeight: spaceScale(50),
    borderRadius: radiusScale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#082032',
    fontSize: fontScale(14),
    fontWeight: '900',
  },
});

export default ExportSuccessModalHost;
