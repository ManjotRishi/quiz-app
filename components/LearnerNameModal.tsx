import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { fontScale, isCompactScreen, radiusScale, spaceScale } from '../style/responsive';

type LearnerNameModalProps = {
  visible: boolean;
  initialValue?: string;
  onSubmit: (name: string) => void;
};

const BOARD_IMAGE = require('../assets/images/board1.png');
const BOARD_LINE_ONE = 'Enter Your';
const BOARD_LINE_TWO = 'Name';
const TOTAL_BOARD_CHARS = BOARD_LINE_ONE.length + BOARD_LINE_TWO.length;
const BOARD_WRITING_TEXT = `${BOARD_LINE_ONE}${BOARD_LINE_TWO}`;
const NAME_ALLOWED_CHARACTERS = /[^A-Za-z\s'-]/g;
const NAME_LETTERS = /[A-Za-z]/g;
const REAL_NAME_PATTERN = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

const sanitizeLearnerName = (value: string) =>
  value
    .replace(NAME_ALLOWED_CHARACTERS, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/'{2,}/g, "'")
    .replace(/-{2,}/g, '-');

const STAR_POSITIONS = [
  { top: 22, left: 28, size: 6 },
  { top: 36, right: 38, size: 8 },
  { bottom: 88, left: 42, size: 5 },
  { bottom: 34, right: 30, size: 7 },
];

const LearnerNameModal = ({ visible, initialValue = '', onSubmit }: LearnerNameModalProps) => {
  const { width } = useWindowDimensions();
  const compact = width < 370 || isCompactScreen;
  const [name, setName] = useState(() => sanitizeLearnerName(initialValue));
  const [error, setError] = useState('');
  const [typedCount, setTypedCount] = useState(0);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(34)).current;
  const cardScale = useRef(new Animated.Value(0.94)).current;
  const heroFloat = useRef(new Animated.Value(0)).current;
  const keyboardLift = useRef(new Animated.Value(0)).current;
  const boardMaskOpacity = useRef(new Animated.Value(0)).current;
  const boardCursorOpacity = useRef(new Animated.Value(1)).current;
  const boardFinalDotOpacity = useRef(new Animated.Value(0)).current;
  const boardFinalDotScale = useRef(new Animated.Value(0.6)).current;
  const boardFinalDotLift = useRef(new Animated.Value(-10)).current;
  const boardPenTap = useRef(new Animated.Value(0)).current;
  const typingDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingStepRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(sanitizeLearnerName(initialValue));
    setError('');
    overlayOpacity.setValue(0);
    cardTranslate.setValue(34);
    cardScale.setValue(0.94);
    keyboardLift.setValue(0);
    boardMaskOpacity.setValue(0);
    boardCursorOpacity.setValue(1);
    boardFinalDotOpacity.setValue(0);
    boardFinalDotScale.setValue(0.6);
    boardFinalDotLift.setValue(-10);
    boardPenTap.setValue(0);
    setTypedCount(0);

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslate, {
        toValue: 0,
        speed: 14,
        bounciness: 6,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        speed: 14,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(180),
      Animated.timing(boardMaskOpacity, {
        toValue: 0.97,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) {
        return;
      }

      typingDelayRef.current = setTimeout(() => {
        const scheduleNextCharacter = (count: number) => {
          if (count >= TOTAL_BOARD_CHARS) {
            return;
          }

          const previousCharacter = BOARD_WRITING_TEXT[Math.max(0, count - 1)];
          let delay = previousCharacter === ' ' ? 150 : 82 + (count % 3) * 18;

          if (count === 0) {
            delay = 90;
          }

          if (count === BOARD_LINE_ONE.length) {
            delay = 420;
          }

          typingStepRef.current = setTimeout(() => {
            const nextCount = count + 1;
            setTypedCount(nextCount);
            boardPenTap.setValue(0);
            Animated.sequence([
              Animated.timing(boardPenTap, {
                toValue: 1,
                duration: 56,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(boardPenTap, {
                toValue: 0,
                duration: 76,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
              }),
            ]).start();

            if (nextCount >= TOTAL_BOARD_CHARS) {
              Animated.parallel([
                Animated.timing(boardFinalDotOpacity, {
                  toValue: 1,
                  duration: 120,
                  easing: Easing.out(Easing.quad),
                  useNativeDriver: true,
                }),
                Animated.sequence([
                  Animated.timing(boardFinalDotLift, {
                    toValue: 6,
                    duration: 150,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                  }),
                  Animated.spring(boardFinalDotLift, {
                    toValue: 0,
                    speed: 16,
                    bounciness: 9,
                    useNativeDriver: true,
                  }),
                ]),
                Animated.sequence([
                  Animated.timing(boardFinalDotScale, {
                    toValue: 1.24,
                    duration: 140,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                  }),
                  Animated.spring(boardFinalDotScale, {
                    toValue: 1,
                    speed: 16,
                    bounciness: 10,
                    useNativeDriver: true,
                  }),
                ]),
              ]).start();
              return;
            }

            scheduleNextCharacter(nextCount);
          }, delay);
        };

        scheduleNextCharacter(0);
      }, 160);
    });

    return () => {
      if (typingDelayRef.current) {
        clearTimeout(typingDelayRef.current);
        typingDelayRef.current = null;
      }

      if (typingStepRef.current) {
        clearTimeout(typingStepRef.current);
        typingStepRef.current = null;
      }
    };
  }, [
    boardMaskOpacity,
    boardCursorOpacity,
    boardFinalDotLift,
    boardFinalDotOpacity,
    boardFinalDotScale,
    boardPenTap,
    cardScale,
    cardTranslate,
    initialValue,
    keyboardLift,
    overlayOpacity,
    visible,
  ]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(heroFloat, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(heroFloat, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [heroFloat, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(boardCursorOpacity, {
          toValue: 0.25,
          duration: 380,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(boardCursorOpacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [boardCursorOpacity, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      const targetLift = Math.min(150, Math.max(70, event.endCoordinates.height * 0.38));

      Animated.timing(keyboardLift, {
        toValue: -targetLift,
        duration: Platform.OS === 'ios' ? event.duration ?? 280 : 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (event) => {
      Animated.timing(keyboardLift, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? event.duration ?? 260 : 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardLift, visible]);

  const heroStyle = useMemo(
    () => ({
      transform: [
        {
          translateY: heroFloat.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -8],
          }),
        },
        {
          scale: heroFloat.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.02],
          }),
        },
      ],
    }),
    [heroFloat]
  );

  const boardLineOneText = useMemo(() => {
    if (typedCount <= BOARD_LINE_ONE.length) {
      return BOARD_LINE_ONE.slice(0, typedCount);
    }

    return BOARD_LINE_ONE;
  }, [typedCount]);

  const boardLineTwoText = useMemo(() => {
    const lineTwoCount = Math.max(0, typedCount - BOARD_LINE_ONE.length);
    return BOARD_LINE_TWO.slice(0, lineTwoCount);
  }, [typedCount]);

  const showLineOneCursor = typedCount < BOARD_LINE_ONE.length;
  const showLineTwoCursor = typedCount >= BOARD_LINE_ONE.length && typedCount < TOTAL_BOARD_CHARS;

  const boardFinalDotStyle = useMemo(
    () => ({
      opacity: boardFinalDotOpacity,
      transform: [
        { translateY: boardFinalDotLift },
        { scale: boardFinalDotScale },
      ],
    }),
    [boardFinalDotLift, boardFinalDotOpacity, boardFinalDotScale]
  );

  const handleSave = () => {
    const trimmed = sanitizeLearnerName(name).trim().replace(/\s+/g, ' ');
    const letterCount = (trimmed.match(NAME_LETTERS) ?? []).length;

    if (letterCount < 2) {
      setError('Please enter at least 2 letters.');
      return;
    }

    if (!REAL_NAME_PATTERN.test(trimmed)) {
      setError('Use letters only for the learner name.');
      return;
    }

    Keyboard.dismiss();
    setName(trimmed);
    onSubmit(trimmed);
  };

  return (
    <Modal animationType="none" transparent visible={visible} statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss} />
        <Animated.View
          style={[
            styles.cardWrap,
            {
              transform: [{ translateY: Animated.add(cardTranslate, keyboardLift) }, { scale: cardScale }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(9,12,28,0.98)', 'rgba(24,11,46,0.98)', 'rgba(13,18,36,0.98)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, compact ? styles.cardCompact : null]}
          >
            <View style={styles.glowOne} />
            <View style={styles.glowTwo} />
            {STAR_POSITIONS.map((star, index) => (
              <View key={`star-${index}`} style={[styles.star, star]} />
            ))}

            <Animated.View style={[styles.heroWrap, heroStyle]}>
              <ImageBackground
                source={BOARD_IMAGE}
                resizeMode="cover"
                style={styles.boardArt}
                imageStyle={styles.boardArtImage}
              >
                <Animated.View style={[styles.boardMask, { opacity: boardMaskOpacity }]} />
                <View style={styles.boardWritingArea}>
                  <Text style={[styles.boardWord, styles.boardWordLineOne, compact ? styles.boardWordLineOneCompact : null]}>
                    {boardLineOneText}
                    {showLineOneCursor ? <Animated.Text style={[styles.boardCursor, { opacity: boardCursorOpacity }]}>|</Animated.Text> : null}
                  </Text>
                  <Text style={[styles.boardWord, styles.boardWordLineTwo, compact ? styles.boardWordLineTwoCompact : null]}>
                    {boardLineTwoText}
                    {showLineTwoCursor ? <Animated.Text style={[styles.boardCursor, { opacity: boardCursorOpacity }]}>|</Animated.Text> : null}
                    {typedCount >= TOTAL_BOARD_CHARS ? <Animated.Text style={[styles.boardFinalDot, boardFinalDotStyle]}>.</Animated.Text> : null}
                  </Text>
                </View>
              </ImageBackground>
            </Animated.View>

            <Text style={styles.formHeading}>Learner Name</Text>

            <View style={styles.inputWrap}>
              <TextInput
                value={name}
                onChangeText={(text) => {
                  setName(sanitizeLearnerName(text));
                  if (error) {
                    setError('');
                  }
                }}
                placeholder="Enter your name"
                placeholderTextColor="rgba(226,232,240,0.38)"
                maxLength={24}
                autoFocus
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSave}
                style={styles.input}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <TouchableOpacity activeOpacity={0.92} onPress={handleSave} style={styles.buttonTouch}>
              <LinearGradient
                colors={['#0E8FA1', '#6FAFB7', '#F3B06E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Save and Continue</Text>
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
    backgroundColor: 'rgba(4, 2, 10, 0.82)',
    justifyContent: 'center',
    paddingHorizontal: spaceScale(18),
  },
  cardWrap: {
    width: '100%',
  },
  card: {
    overflow: 'hidden',
    borderRadius: radiusScale(32),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spaceScale(22),
    paddingTop: spaceScale(22),
    paddingBottom: spaceScale(22),
  },
  cardCompact: {
    paddingHorizontal: spaceScale(18),
  },
  glowOne: {
    position: 'absolute',
    top: -20,
    right: -18,
    width: 140,
    height: 140,
    borderRadius: 140,
    backgroundColor: 'rgba(139,92,246,0.20)',
  },
  glowTwo: {
    position: 'absolute',
    bottom: -36,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 120,
    backgroundColor: 'rgba(96,165,250,0.16)',
  },
  star: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#F8E8FF',
    opacity: 0.7,
  },
  heroWrap: {
    width: '100%',
    marginBottom: spaceScale(18),
  },
  boardArt: {
    width: '100%',
    aspectRatio: 1365 / 1024,
    borderRadius: radiusScale(24),
    justifyContent: 'center',
    overflow: 'hidden',
  },
  boardArtImage: {
    borderRadius: radiusScale(24),
  },
  boardMask: {
    position: 'absolute',
    left: '34%',
    right: '10%',
    top: '17%',
    height: '47%',
    borderRadius: radiusScale(18),
    backgroundColor: 'rgba(8,65,69,0.98)',
  },
  boardWritingArea: {
    position: 'absolute',
    left: '41%',
    right: '12%',
    top: '24%',
    bottom: '22%',
    justifyContent: 'flex-start',
  },
  boardWord: {
    color: '#FFF8EB',
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.30)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  boardWordLineOne: {
    fontSize: fontScale(22),
    lineHeight: fontScale(26),
    minHeight: fontScale(28),
  },
  boardWordLineOneCompact: {
    fontSize: fontScale(19),
    lineHeight: fontScale(23),
  },
  boardWordLineTwo: {
    marginTop: spaceScale(8),
    fontSize: fontScale(34),
    lineHeight: fontScale(38),
    minHeight: fontScale(40),
  },
  boardWordLineTwoCompact: {
    fontSize: fontScale(30),
    lineHeight: fontScale(34),
  },
  boardCursor: {
    color: '#FDE68A',
    textShadowColor: 'rgba(253,230,138,0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  boardFinalDot: {
    color: '#86EFAC',
    textShadowColor: 'rgba(134,239,172,0.72)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  formHeading: {
    color: '#F8FAFC',
    fontSize: fontScale(18),
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  inputWrap: {
    marginTop: spaceScale(14),
  },
  input: {
    minHeight: spaceScale(50),
    borderRadius: radiusScale(18),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#FFFFFF',
    paddingHorizontal: spaceScale(16),
    fontSize: fontScale(15),
    fontWeight: '600',
  },
  errorText: {
    marginTop: spaceScale(8),
    color: '#FDB4C0',
    fontSize: fontScale(11),
    fontWeight: '700',
  },
  buttonTouch: {
    marginTop: spaceScale(18),
  },
  button: {
    minHeight: spaceScale(52),
    borderRadius: radiusScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spaceScale(18),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});

export default LearnerNameModal;
