import React, { useEffect, useMemo, useRef } from 'react';
import {
  Dimensions,
  Animated,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ROUTES } from '../navigation/routes';
import { RootStackParamList } from '../navigation/types';
import { fontScale, spaceScale } from '../style/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STAR_COUNT = 20;
const BUTTON_BALL_SIZE = 42;
const STAR_GLYPHS = ['✦', '✧', '✷', '✺'];
const STAR_COLORS = ['#FFFFFF', '#7CE9F8', '#FFD76A', '#FF9BE6', '#98F5C9'];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const shuffle = <T,>(values: T[]) => {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const BOOK_EMOJI = '📖';
const ENGLISH_LETTERS = ['A', 'B', 'C'];
const HINDI_WORDS = ['नमस्ते', 'ज्ञान', 'शिक्षा'];
const GURMUKHI_LETTERS = ['ੳ', 'ਅ', 'ੲ'];

const makeSparkConfig = (index: number) => {
  const size = 12 + Math.random() * 10;
  const originX = Math.random() * (SCREEN_WIDTH - size - 16) + 8;
  const originY = Math.random() * (SCREEN_HEIGHT * 0.72 - size - 16) + 12;
  const travel = () => ({
    x: clamp(originX + (Math.random() * 2 - 1) * 56, 0, SCREEN_WIDTH - size),
    y: clamp(originY + (Math.random() * 2 - 1) * 78, 0, SCREEN_HEIGHT - 220),
  });

  const points = [travel(), travel(), travel(), travel(), travel()];

  return {
    key: `spark-${index}`,
    size,
    glyph: STAR_GLYPHS[index % STAR_GLYPHS.length],
    colors: shuffle(STAR_COLORS),
    duration: 4600 + Math.random() * 2400,
    delay: Math.random() * 2200,
    xPoints: points.map((point) => point.x - originX),
    yPoints: points.map((point) => point.y - originY),
    originX,
    originY,
  };
};

const makeLetterConfig = (
  char: string,
  index: number,
  palette: string[]
) => {
  const driftX = 12 + index * 8;
  const spreadX = index === 1 ? 0 : index === 0 ? -16 : 18;
  const trailY = -98 - index * 26;

  return {
    key: `${char}-${index}`,
    char,
    color: palette[index % palette.length],
    size: char.length > 2 ? 12 - index * 0.4 : 17 - index * 1,
    delay: 320 + index * 170,
    duration: 2600 + index * 280,
    originX: 28 + index * 4,
    originY: 18 + index * 2,
    xPoints: [0, spreadX, spreadX + driftX, spreadX + driftX + 18],
    yPoints: [0, -24 - index * 12, trailY, trailY - 42],
  };
};

const makeBookConfig = (index: number) => {
  const startXMap = [SCREEN_WIDTH * 0.08, SCREEN_WIDTH * 0.38, SCREEN_WIDTH * 0.68];
  const startYMap = [SCREEN_HEIGHT * 0.76, SCREEN_HEIGHT * 0.72, SCREEN_HEIGHT * 0.78];
  const paletteMap = [
    ['#FFD76A', '#FFF3CF', '#7CE9F8'],
    ['#FF9BE6', '#FFD76A', '#FFFFFF'],
    ['#98F5C9', '#7CE9F8', '#FFFFFF'],
  ];
  const symbolMap = [ENGLISH_LETTERS, HINDI_WORDS, GURMUKHI_LETTERS];
  const pathMap = [
    {
      xPoints: [0, 38, -18, 54, 22],
      yPoints: [0, -76, -168, -302, -620],
      rotatePoints: ['-6deg', '4deg', '-3deg', '6deg', '3deg'],
    },
    {
      xPoints: [0, -34, 48, -16, 40],
      yPoints: [0, -88, -190, -338, -660],
      rotatePoints: ['6deg', '-4deg', '5deg', '-6deg', '3deg'],
    },
    {
      xPoints: [0, 28, -36, 44, 18],
      yPoints: [0, -82, -176, -320, -640],
      rotatePoints: ['-4deg', '5deg', '-5deg', '6deg', '2deg'],
    },
  ];

  const baseX = clamp(startXMap[index], 12, SCREEN_WIDTH - 100);
  const baseY = clamp(startYMap[index], 20, SCREEN_HEIGHT - 220);
  const letters = symbolMap[index].map((char, letterIndex) =>
    makeLetterConfig(char, letterIndex, paletteMap[index])
  );

  return {
    key: `book-${index}`,
    originX: baseX,
    originY: baseY,
    duration: 5200 + index * 420,
    delay: 220 + index * 260,
    xPoints: pathMap[index].xPoints,
    yPoints: pathMap[index].yPoints,
    rotatePoints: pathMap[index].rotatePoints,
    scalePoints: [0.95, 1.03, 0.97, 1.05, 1],
    letters,
    accent: paletteMap[index][0],
    glow: paletteMap[index][1],
  };
};

const SparkStar = ({ config }: { config: ReturnType<typeof makeSparkConfig> }) => {
  const drift = useRef(new Animated.Value(0)).current;
  const twinkle = useRef(new Animated.Value(0)).current;
  const [colorIndex, setColorIndex] = React.useState(0);

  useEffect(() => {
    const colorTimer = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % config.colors.length);
    }, 650 + Math.random() * 450);

    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(config.delay),
        Animated.timing(drift, {
          toValue: 1,
          duration: config.duration,
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    const twinkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, {
          toValue: 1,
          duration: 1400 + Math.random() * 600,
          useNativeDriver: true,
        }),
        Animated.timing(twinkle, {
          toValue: 0.35,
          duration: 1400 + Math.random() * 700,
          useNativeDriver: true,
        }),
      ])
    );

    driftLoop.start();
    twinkleLoop.start();

    return () => {
      clearInterval(colorTimer);
      drift.stopAnimation();
      twinkle.stopAnimation();
      driftLoop.stop();
      twinkleLoop.stop();
    };
  }, [config.colors.length, config.delay, config.duration, drift, twinkle]);

  const x = drift.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: config.xPoints,
  });

  const y = drift.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: config.yPoints,
  });

  const scale = twinkle.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.7, 1.15, 0.85],
  });

  const opacity = twinkle.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [0.2, 0.95, 0.4],
  });

  const color = config.colors[colorIndex];

  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        styles.spark,
        {
          left: config.originX,
          top: config.originY,
          fontSize: config.size,
          opacity,
          color,
          textShadowColor: color,
          transform: [{ translateX: x }, { translateY: y }, { scale }],
        },
      ]}
    >
      {config.glyph}
    </Animated.Text>
  );
};

const FlyingLetter = ({ config }: { config: ReturnType<typeof makeLetterConfig> }) => {
  const flight = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const flightLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(config.delay),
        Animated.timing(flight, {
          toValue: 1,
          duration: config.duration,
          useNativeDriver: true,
        }),
        Animated.timing(flight, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0.45,
          duration: 620,
          useNativeDriver: true,
        }),
      ])
    );

    flightLoop.start();
    shimmerLoop.start();

    return () => {
      flight.stopAnimation();
      shimmer.stopAnimation();
      flightLoop.stop();
      shimmerLoop.stop();
    };
  }, [config.delay, config.duration, flight, shimmer]);

  const translateX = flight.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: config.xPoints,
  });

  const translateY = flight.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: config.yPoints,
  });

  const opacity = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.18, 0.9, 0.3],
  });

  const scale = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.96, 1.08, 0.94],
  });

  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        styles.bookLetter,
        {
          left: config.originX,
          top: config.originY,
          fontSize: config.size,
          color: config.color,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    >
      {config.char}
    </Animated.Text>
  );
};

const FlyingBook = ({ config }: { config: ReturnType<typeof makeBookConfig> }) => {
  const flight = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const flightLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(config.delay),
        Animated.timing(flight, {
          toValue: 1,
          duration: config.duration,
          useNativeDriver: true,
        }),
        Animated.timing(flight, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.35,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    );

    flightLoop.start();
    glowLoop.start();

    return () => {
      flight.stopAnimation();
      glow.stopAnimation();
      flightLoop.stop();
      glowLoop.stop();
    };
  }, [config.delay, config.duration, flight, glow]);

  const translateX = flight.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: config.xPoints,
  });

  const translateY = flight.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: config.yPoints,
  });

  const rotate = flight.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: config.rotatePoints,
  });

  const scale = flight.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: config.scalePoints,
  });

  const auraOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.6],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.bookGroup,
        {
          left: config.originX,
          top: config.originY,
          transform: [{ translateX }, { translateY }, { rotate }, { scale }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.bookAura,
          {
            opacity: auraOpacity,
            shadowColor: config.glow,
          },
        ]}
      />

      {config.letters.map((letterConfig) => (
        <FlyingLetter key={letterConfig.key} config={letterConfig} />
      ))}

      <View style={styles.bookCard}>
        <Text style={[styles.bookEmoji, { textShadowColor: config.glow }]}>{BOOK_EMOJI}</Text>
      </View>
    </Animated.View>
  );
};

const SplashScreen = ({ navigation }: Props) => {
  const fade = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.96)).current;
  const buttonBallProgress = useRef(new Animated.Value(0)).current;
  const buttonTextOpacity = useRef(new Animated.Value(1)).current;
  const zoomAnim = useRef(new Animated.Value(1)).current;
  const [buttonWidth, setButtonWidth] = React.useState(0);
  const [isButtonAnimating, setIsButtonAnimating] = React.useState(false);
  const sparkConfigs = useMemo(
    () => Array.from({ length: STAR_COUNT }, (_, index) => makeSparkConfig(index)),
    []
  );
  const bookConfigs = useMemo(
    () => Array.from({ length: 3 }, (_, index) => makeBookConfig(index)),
    []
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 16,
        bounciness: 6,
      }),
    ]).start();

    // 🌌 Smooth breathing zoom
    Animated.loop(
      Animated.sequence([
        Animated.timing(zoomAnim, {
          toValue: 1.035,
          duration: 3800,
          useNativeDriver: true,
        }),
        Animated.timing(zoomAnim, {
          toValue: 1,
          duration: 3800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const buttonBallTranslateX = buttonBallProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      -BUTTON_BALL_SIZE - spaceScale(18),
      Math.max(buttonWidth - BUTTON_BALL_SIZE - spaceScale(10), 0),
    ],
  });

  const handleGetStartedPress = () => {
    if (isButtonAnimating) {
      return;
    }

    setIsButtonAnimating(true);
    buttonBallProgress.setValue(0);
    buttonTextOpacity.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.spring(buttonScale, {
          toValue: 0.98,
          useNativeDriver: true,
          speed: 20,
          bounciness: 4,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 18,
          bounciness: 5,
        }),
      ]),
      Animated.timing(buttonBallProgress, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        navigation.replace(ROUTES.Home);
        return;
      }

      setIsButtonAnimating(false);
      buttonBallProgress.setValue(0);
      buttonTextOpacity.setValue(1);
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View style={[styles.heroWrap, { opacity: fade }]}>
        <Animated.View style={{ flex: 1, transform: [{ scale: zoomAnim }] }}>
          <ImageBackground
            source={require('../assets/images/splashmain2.png')}
            style={styles.hero}
            resizeMode="cover"
          >
            <View style={styles.sparkLayer} pointerEvents="none">
              {sparkConfigs.map((config) => (
                <SparkStar key={config.key} config={config} />
              ))}
            </View>

            <View style={styles.bookLayer} pointerEvents="none">
              {bookConfigs.map((config) => (
                <FlyingBook key={config.key} config={config} />
              ))}
            </View>

            <SafeAreaView style={styles.overlay} edges={['bottom']}>

              {/* ✅ VERY LIGHT fade (keeps image visible) */}
              <View style={styles.bottomFade} />

              <View style={styles.bottomWrap}>
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity
                    activeOpacity={0.95}
                    disabled={isButtonAnimating}
                    onPress={handleGetStartedPress}
                    style={styles.buttonTouchable}
                  >
                    {/* 🌌 SKY STYLE BUTTON */}
                    <LinearGradient
                      colors={['rgba(20,184,166,0.42)', 'rgba(56,189,248,0.42)', 'rgba(251,146,60,0.36)']}
                      start={{ x: 0, y: 0.2 }}
                      end={{ x: 1, y: 1 }}
                      onLayout={(event) => setButtonWidth(event.nativeEvent.layout.width)}
                      style={styles.button}
                    >
                      <Animated.View
                        pointerEvents="none"
                        style={[
                          styles.buttonBall,
                          {
                            transform: [{ translateX: buttonBallTranslateX }],
                          },
                        ]}
                      >
                        <LinearGradient
                          colors={['#14B8A6', '#38BDF8', '#FB923C']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.buttonBallGradient}
                        />
                      </Animated.View>
                      <Animated.Text style={[styles.buttonText, { opacity: buttonTextOpacity }]}>
                        Get Started
                      </Animated.Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              </View>

            </SafeAreaView>
          </ImageBackground>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#04020A',
  },
  heroWrap: {
    flex: 1,
  },
  hero: {
    flex: 1,
  },
  sparkLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  bookLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spaceScale(20),
    paddingBottom: spaceScale(30),
    zIndex: 4,
  },

  // 🔥 soft fade only
  bottomFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,15,25,0.15)',
  },

  bottomWrap: {
    alignItems: 'center',
    paddingHorizontal: spaceScale(14),
  },

  buttonTouchable: {
    width: '100%',
  },

  button: {
    minHeight: spaceScale(50),
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spaceScale(60),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.24)',
    shadowColor: '#0D3942',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonBall: {
    position: 'absolute',
    left: 0,
    width: BUTTON_BALL_SIZE,
    height: BUTTON_BALL_SIZE,
    borderRadius: 999,
    shadowColor: '#7DD3FC',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    overflow: 'hidden',
  },
  buttonBallGradient: {
    flex: 1,
    borderRadius: 999,
  },

  buttonText: {
    color: '#EAF2FF',
    fontSize: fontScale(16),
    fontWeight: '800',
    letterSpacing: 1.5,
    zIndex: 1,
  },
  spark: {
    position: 'absolute',
    fontWeight: '900',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  bookGroup: {
    position: 'absolute',
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  bookAura: {
    position: 'absolute',
    width: 76,
    height: 50,
    borderRadius: 24,
    borderWidth: 0,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  bookCard: {
    width: 72,
    height: 48,
    borderRadius: 18,
    borderWidth: 0,
    backgroundColor: 'rgba(10,15,25,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  bookEmoji: {
    fontSize: 32,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  bookLetter: {
    position: 'absolute',
    fontWeight: '900',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
