import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Advertisement from '../components/Advertisement';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import { ROUTES } from '../navigation/routes';
import { RootStackParamList } from '../navigation/types';
import { fontScale, radiusScale, spaceScale } from '../style/responsive';
import { showDebugUpdatePreview } from '../util/inAppUpdates';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type FloatingPosition = {
  top: number;
  left?: number;
  right?: number;
  rotate: string;
  zIndex: number;
  width: number;
  height: number;
};

const SCORE_PREVIEW = {
  quizType: 'quizzes' as const,
  totalQuestions: 10,
  correctAnswers: 7,
  wrongAnswers: 2,
  notAttemptedAnswers: 1,
  timeTakenSeconds: 320,
  accuracy: 70,
};


const Home = ({ navigation, route }: Props) => {
  const { width } = useWindowDimensions();
   const { prepareAdv, startAdv } = useInterstitialAd();
  const hasShownThisVisitRef = useRef(false);
  const showAdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const adWatchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTopRoute = useNavigationState((state) => state.routes[state.index]?.key === route.key);
  const titleFade = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.96)).current;
  const heroFloat = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0))
  ).current;
  const featuredWidth = Math.min(width * 0.82, 320);
  const featuredHeight = Math.min(width * 0.46, 182);
  const orbitWidth = Math.min(width * 0.42, 170);
  const orbitHeight = Math.min(width * 0.33, 142);
  const deckHeight = spaceScale(660);


  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleFade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(heroScale, {
        toValue: 1,
        speed: 12,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(
      140,
      cardAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          speed: 12,
          bounciness: 7,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [cardAnims, heroFloat, heroScale, titleFade]);

  useEffect(() => {
    prepareAdv();
  }, [prepareAdv]);



  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(heroFloat, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(heroFloat, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [heroFloat]);

  useEffect(() => {
    if (!isTopRoute) {
      hasShownThisVisitRef.current = false;
      if (showAdTimerRef.current) {
        clearTimeout(showAdTimerRef.current);
        showAdTimerRef.current = null;
      }
      return;
    }

    if (hasShownThisVisitRef.current) {
      return;
    }

    hasShownThisVisitRef.current = true;

    if (showAdTimerRef.current) {
      clearTimeout(showAdTimerRef.current);
    }

    showAdTimerRef.current = setTimeout(() => {
      if (adWatchdogTimerRef.current) {
        clearTimeout(adWatchdogTimerRef.current);
      }

      adWatchdogTimerRef.current = setTimeout(() => {
        adWatchdogTimerRef.current = null;
      }, 20000);

      const started = startAdv({
        placementKey: 'home-screen-visit',
        cooldownMs: 0,
        onClosed: () => {
          if (adWatchdogTimerRef.current) {
            clearTimeout(adWatchdogTimerRef.current);
            adWatchdogTimerRef.current = null;
          }
        },
      });

      if (!started && adWatchdogTimerRef.current) {
        clearTimeout(adWatchdogTimerRef.current);
        adWatchdogTimerRef.current = null;
      }
    }, 900);

    return () => {
      if (showAdTimerRef.current) {
        clearTimeout(showAdTimerRef.current);
        showAdTimerRef.current = null;
      }
    };
  }, [isTopRoute, startAdv]);

  useEffect(() => () => {
    if (showAdTimerRef.current) {
      clearTimeout(showAdTimerRef.current);
    }
    if (adWatchdogTimerRef.current) {
      clearTimeout(adWatchdogTimerRef.current);
    }
  }, []);

  const cards = [
    {
      key: 'quiz',
      number: '01',
      badge: 'GK',
      centerLabel: 'GK',
      title: 'General Knowledge',
      subtitle: 'Tap to start the general knowledge quiz.',
      colors: ['#2B115A', '#150B26', '#090612'],
      accent: '#8B5CF6',
      glow: 'rgba(139,92,246,0.28)',
      onPress: () => navigation.navigate(ROUTES.QuizBoard),
    },
    {
      key: 'english',
      number: '02',
      badge: 'English',
      centerLabel: 'English',
      title: 'English Challenges',
      subtitle: 'Tap for grammar, vocabulary, and language.',
      colors: ['#321454', '#140B24', '#090611'],
      accent: '#60A5FA',
      glow: 'rgba(96,165,250,0.24)',
      onPress: () => navigation.navigate(ROUTES.EnglishQuizz),
    },
    {
      key: 'child',
      number: '03',
      badge: 'Kids',
      centerLabel: 'Kids',
      title: 'Child Quizz',
      subtitle: 'Tap for child-friendly questions, colors, and fun learning.',
      colors: ['#3D1458', '#1D0C31', '#0C0717'],
      accent: '#F59E0B',
      glow: 'rgba(245,158,11,0.24)',
      onPress: () => navigation.navigate(ROUTES.ChildQuizz),
    },
    {
      key: 'gk',
      number: '04',
      badge: 'Current Affairs',
      centerLabel: 'CA',
      title: 'Current Affairs',
      subtitle: 'Tap for daily news, facts, and updates.',
      colors: ['#26154E', '#120A22', '#090611'],
      accent: '#C084FC',
      glow: 'rgba(192,132,252,0.26)',
      onPress: () => navigation.navigate(ROUTES.GkBoard),
    },
    {
      key: 'tricky',
      number: '05',
      badge: 'Puzzles',
      centerLabel: 'Puzzles',
      title: 'Tricky Questions',
      subtitle: 'Tap for puzzles and tricky quiz rounds.',
      colors: ['#2A124F', '#130A21', '#090611'],
      accent: '#F472B6',
      glow: 'rgba(244,114,182,0.22)',
      onPress: () => navigation.navigate(ROUTES.TrickeyQuestions),
    },
    {
      key: 'score',
      number: '06',
      badge: 'Score',
      centerLabel: 'Score',
      title: 'Score Report',
      subtitle: 'Tap to open your score and progress view.',
      colors: ['#231348', '#120A21', '#090611'],
      accent: '#F59E0B',
      glow: 'rgba(245,158,11,0.22)',
      onPress: () => navigation.navigate(ROUTES.Score, SCORE_PREVIEW),
    },
  ] as const;

  const floatingPositions: FloatingPosition[] = [
    {
      top: 0,
      left: Math.max(0, (width - featuredWidth) / 2),
      rotate: '-4deg',
      zIndex: 6,
      width: featuredWidth,
      height: featuredHeight,
    },
    {
      top: featuredHeight + 42,
      left: 8,
      rotate: '-12deg',
      zIndex: 4,
      width: orbitWidth,
      height: orbitHeight,
    },
    {
      top: featuredHeight + 36,
      right: 8,
      rotate: '10deg',
      zIndex: 5,
      width: orbitWidth,
      height: orbitHeight,
    },
    {
      top: featuredHeight + orbitHeight + 88,
      left: 24,
      rotate: '-8deg',
      zIndex: 3,
      width: orbitWidth,
      height: orbitHeight,
    },
    {
      top: featuredHeight + orbitHeight + 94,
      right: 18,
      rotate: '7deg',
      zIndex: 2,
      width: orbitWidth,
      height: orbitHeight,
    },
    {
      top: featuredHeight + orbitHeight * 2 + 142,
      left: Math.max(0, (width - featuredWidth * 0.88) / 2),
      rotate: '-2deg',
      zIndex: 1,
      width: featuredWidth * 0.88,
      height: orbitHeight,
    },
  ];

  const heroFloatStyle = {
    transform: [
      {
        translateY: heroFloat.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -10],
        }),
      },
      {
        rotate: heroFloat.interpolate({
          inputRange: [0, 1],
          outputRange: ['-2deg', '2deg'],
        }),
      },
      { scale: 1 },
    ],
  };

  const cardFloatStyle = {
    transform: [
      {
        translateY: heroFloat.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -7],
        }),
      },
      {
        rotate: heroFloat.interpolate({
          inputRange: [0, 1],
          outputRange: ['-2.5deg', '2.5deg'],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <LinearGradient
        colors={['#04020A', '#1A0B33', '#250D4A', '#09102A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.bannerWrap}>
          <Advertisement banner containerStyle={styles.banner} />
        </View>
        <View style={styles.meshGlow} />
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />
        <View style={styles.glowThree} />
        <View style={styles.glowFour} />
        <View style={styles.bubbleOne} />
        <View style={styles.bubbleTwo} />
        <View style={styles.bubbleThree} />
        <View style={styles.bubbleFour} />
        {__DEV__ ? (
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={showDebugUpdatePreview}
            style={styles.debugUpdateButton}
          >
            <Text style={styles.debugUpdateButtonText}>Test Update Popup</Text>
          </TouchableOpacity>
        ) : null}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View
            style={[
              styles.hero,
              {
                opacity: titleFade,
                transform: [{ scale: heroScale }],
              },
            ]}
          >
            <View style={styles.heroCopy}>
              <Text style={styles.kicker}>DailyQuizz Hub</Text>
              <Text style={styles.title}>Slide into your next quiz</Text>
              <Text style={styles.subtitle}>
                Challenge Your Mind Daily. | Knowledge is Your Superpower | Challenge Your Mind Daily
              </Text>
            </View>

            <Animated.View style={[styles.heroStage, heroFloatStyle]}>
              <View style={styles.heroStageShadow} />
              {/* <LinearGradient
                colors={['rgba(103,58,183,0.36)', 'rgba(27,15,56,0.94)', 'rgba(9,7,19,0.96)']}
                style={styles.heroStageCard}
              >
                <View style={styles.heroOrbitOne} />
                <View style={styles.heroOrbitTwo} />
                <View style={styles.heroCardMain}>
                  <View style={styles.heroCardInner} />
                  <Text style={styles.heroMark}>∿</Text>
                </View>
                <View style={styles.heroMiniCardLeft}>
                  <Text style={styles.heroMiniText}>Zoom</Text>
                </View>
                <View style={styles.heroMiniCardRight}>
                  <Text style={styles.heroMiniText}>Quiz</Text>
                </View>
              </LinearGradient> */}
            </Animated.View>
          </Animated.View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Think. Tap. Win.</Text>
            <Text style={styles.sectionMeta}>Tap any floating card to jump in</Text>
          </View>

          <View style={[styles.floatingDeck, { height: deckHeight }]}>
            {cards.map((card, index) => {
              const position = floatingPositions[index];

              return (
                <Animated.View
                  key={card.key}
                  style={[
                    styles.floatingShell,
                    {
                      width: position.width,
                      height: position.height,
                      zIndex: position.zIndex,
                      top: position.top,
                      left: position.left,
                      right: position.right,
                    },
                    {
                      opacity: cardAnims[index],
                      transform: [
                        {
                          translateY: cardAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0],
                          }),
                        },
                        {
                          translateX: cardAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [index === 0 ? 0 : index % 2 === 0 ? 18 : -18, 0],
                          }),
                        },
                        {
                          rotate: floatingPositions[index].rotate,
                        },
                        {
                          scale: cardAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.92, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity activeOpacity={0.92} onPress={card.onPress} style={styles.slideTouchable}>
                    <LinearGradient colors={card.colors as unknown as string[]} style={styles.slideCard}>
                      <View style={styles.slideGlowRing} />
                      <View style={[styles.slideOrb, { backgroundColor: card.glow }]} />
                      <View style={styles.slideTopRow}>
                        {/* <View style={styles.slideNumberPill}>
                        <Text style={styles.slideNumber}>{card.number}</Text>
                      </View> */}
                        <View style={styles.slideBadge}>
                          <Text style={styles.slideBadgeText}>{card.badge}</Text>
                        </View>
                      </View>

                      <View style={styles.slideArt}>
                        <View style={[styles.quizTrail, { backgroundColor: card.glow }]} />
                        <Animated.View style={[styles.quizCluster, cardFloatStyle]}>
                          <View style={[styles.quizSatelliteTop, { borderColor: card.accent }]} />
                          <View style={[styles.quizSatelliteLeft, { borderColor: card.accent }]} />
                          <View style={[styles.quizSatelliteRight, { borderColor: card.accent }]} />

                          <View style={[styles.quizCore, { borderColor: card.accent }]}>
                            <View style={[styles.quizCoreGlow, { backgroundColor: card.glow }]} />
                            <LinearGradient
                              colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.slideCenterPill}
                            >
                              <Text style={styles.slideCenterText} numberOfLines={1}>
                                {card.centerLabel}
                              </Text>
                            </LinearGradient>
                          </View>
                        </Animated.View>
                      </View>

                      <View style={styles.slideBody}>
                        <Text style={styles.slideTitle} numberOfLines={2}>
                          {card.title}
                        </Text>
                        <Text style={styles.slideSubtitle} numberOfLines={2}>
                          {card.subtitle}
                        </Text>
                      </View>

                      <View style={styles.slideFooter}>
                        <Text style={styles.slideFooterText}>Open</Text>
                        <Text style={styles.slideArrow}>→</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>

      </LinearGradient>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#04020A',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingHorizontal: spaceScale(18),
    paddingTop: spaceScale(100),
    paddingBottom: spaceScale(30),
  },
  bannerWrap: {
    position: 'absolute',
    top: spaceScale(-20),
    left: spaceScale(18),
    right: spaceScale(18),
    zIndex: 30,
    elevation: 30,
  },
  banner: {
    paddingVertical: spaceScale(10),
    borderRadius: radiusScale(22),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(9, 7, 19, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  debugUpdateButton: {
    position: 'absolute',
    top: spaceScale(62),
    right: spaceScale(18),
    zIndex: 35,
    elevation: 35,
    paddingHorizontal: spaceScale(14),
    paddingVertical: spaceScale(10),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(14, 25, 58, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(137, 196, 255, 0.28)',
  },
  debugUpdateButtonText: {
    color: '#EAF2FF',
    fontSize: fontScale(11),
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  meshGlow: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 300,
    backgroundColor: 'rgba(86,47,183,0.22)',
  },
  glowOne: {
    position: 'absolute',
    top: 40,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: 'rgba(122,92,255,0.14)',
  },
  glowTwo: {
    position: 'absolute',
    top: 220,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(96,165,250,0.12)',
  },
  glowThree: {
    position: 'absolute',
    bottom: -100,
    left: '18%',
    width: 340,
    height: 340,
    borderRadius: 340,
    backgroundColor: 'rgba(178,95,255,0.12)',
  },
  glowFour: {
    position: 'absolute',
    top: '32%',
    right: '10%',
    width: 140,
    height: 140,
    borderRadius: 140,
    backgroundColor: 'rgba(245,158,11,0.10)',
  },
  bubbleOne: {
    position: 'absolute',
    top: 58,
    left: 24,
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#E9D5FF',
  },
  bubbleTwo: {
    position: 'absolute',
    top: 120,
    right: 30,
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  bubbleThree: {
    position: 'absolute',
    bottom: 150,
    right: '20%',
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#A78BFA',
  },
  bubbleFour: {
    position: 'absolute',
    top: '46%',
    left: '12%',
    width: 4,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#F9FAFB',
  },
  hero: {
    marginTop: spaceScale(4),
    marginBottom: spaceScale(12),
  },
  heroCopy: {
    paddingBottom: spaceScale(10),
  },
  kicker: {
    color: 'rgba(232,220,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 2.8,
    fontSize: fontScale(10),
    fontWeight: '800',
  },
  title: {
    marginTop: spaceScale(8),
    color: '#FCFBFF',
    fontSize: fontScale(32),
    lineHeight: fontScale(38),
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  subtitle: {
    marginTop: spaceScale(10),
    color: 'rgba(238,232,255,0.74)',
    fontSize: fontScale(15),
    lineHeight: fontScale(22),
    maxWidth: 340,
  },
  sectionHeader: {
    marginTop: spaceScale(10),
    marginBottom: spaceScale(14),
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: fontScale(20),
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  sectionMeta: {
    marginTop: spaceScale(4),
    color: 'rgba(238,232,255,0.62)',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
  },
  floatingDeck: {
    position: 'relative',
    marginTop: spaceScale(4),
    marginBottom: spaceScale(12),
  },
  floatingShell: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.34,
    shadowRadius: 24,
    elevation: 10,
  },
  slideTouchable: {
    borderRadius: radiusScale(26),
    flex: 1,
  },
  slideCard: {
    flex: 1,
    borderRadius: radiusScale(24),
    padding: spaceScale(11),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'space-between',
  },
  slideGlowRing: {
    position: 'absolute',
    top: -16,
    right: -16,
    width: 72,
    height: 72,
    borderRadius: 72,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  slideOrb: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 13,
    height: 13,
    borderRadius: 13,
  },
  slideTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  slideNumberPill: {
    width: spaceScale(34),
    height: spaceScale(34),
    borderRadius: radiusScale(12),
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideNumber: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontWeight: '900',
    letterSpacing: 1,
  },
  slideBadge: {
    paddingHorizontal: spaceScale(10),
    paddingVertical: spaceScale(6),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  slideBadgeText: {
    color: '#FFFFFF',
    fontSize: fontScale(10),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  slideArt: {
    position: 'relative',
    height: spaceScale(52),
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizTrail: {
    position: 'absolute',
    width: '36%',
    height: '15%',
    borderRadius: radiusScale(999),
    opacity: 0.18,
    transform: [{ rotate: '-14deg' }],
  },
  quizCluster: {
    width: '54%',
    height: '54%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizCore: {
    position: 'absolute',
    width: '72%',
    height: 28,
    borderRadius: radiusScale(999),
    borderWidth: 1.4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-10deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
  quizCoreGlow: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: radiusScale(999),
    opacity: 0.22,
  },
  slideCenterPill: {
    width: '100%',
    height: '100%',
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spaceScale(10),
    overflow: 'hidden',
  },
  slideCenterText: {
    color: '#FFFFFF',
    fontSize: fontScale(9),
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
    maxWidth: '100%',
  },
  quizSatelliteTop: {
    position: 'absolute',
    top: '10%',
    width: 10,
    height: 10,
    borderRadius: radiusScale(8),
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    transform: [{ rotate: '14deg' }, { translateY: -10 }],
  },
  quizSatelliteLeft: {
    position: 'absolute',
    left: '18%',
    top: '48%',
    width: 9,
    height: 9,
    borderRadius: radiusScale(6),
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    transform: [{ rotate: '-18deg' }, { translateX: -10 }],
  },
  quizSatelliteRight: {
    position: 'absolute',
    right: '18%',
    top: '42%',
    width: 9,
    height: 9,
    borderRadius: radiusScale(7),
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    transform: [{ rotate: '20deg' }, { translateX: 8 }],
  },
  slideBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spaceScale(4),
  },
  slideTitle: {
    color: '#FFFFFF',
    fontSize: fontScale(16),
    lineHeight: fontScale(20),
    fontWeight: '900',
    letterSpacing: -0.1,
    maxWidth: '100%',
    textAlign: 'center',
    overflow: 'hidden',
  },
  slideSubtitle: {
    marginTop: spaceScale(8),
    color: 'rgba(255,255,255,0.78)',
    fontSize: fontScale(11),
    lineHeight: fontScale(15),
    maxWidth: '100%',
    textAlign: 'center',
    overflow: 'hidden',
  },
  slideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spaceScale(10),
  },
  slideFooterText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: fontScale(11),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  slideArrow: {
    color: '#FFFFFF',
    fontSize: fontScale(22),
    fontWeight: '900',
    opacity: 0.95,
  },
  heroStage: {
    marginTop: spaceScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStageShadow: {
    position: 'absolute',
    top: 22,
    width: '88%',
    height: '72%',
    borderRadius: radiusScale(42),
    backgroundColor: 'rgba(9,7,19,0.72)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 38,
    elevation: 20,
  },
  heroStageCard: {
    width: '100%',
    aspectRatio: 1.9,
    borderRadius: radiusScale(42),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  heroOrbitOne: {
    position: 'absolute',
    top: '16%',
    right: '18%',
    width: 120,
    height: 120,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(186,128,255,0.22)',
    backgroundColor: 'rgba(186,128,255,0.06)',
  },
  heroOrbitTwo: {
    position: 'absolute',
    bottom: '18%',
    left: '12%',
    width: 74,
    height: 74,
    borderRadius: 74,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.18)',
    backgroundColor: 'rgba(96,165,250,0.08)',
  },
  heroCardMain: {
    position: 'absolute',
    left: '26%',
    top: '22%',
    width: '48%',
    height: '42%',
    borderRadius: radiusScale(32),
    backgroundColor: 'rgba(19, 11, 40, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(180, 125, 255, 0.42)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
    transform: [{ rotate: '-12deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCardInner: {
    ...StyleSheet.absoluteFillObject,
    margin: 10,
    borderRadius: radiusScale(26),
    borderWidth: 1,
    borderColor: 'rgba(103,232,249,0.16)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  heroMark: {
    color: '#F9FAFF',
    fontSize: fontScale(34),
    fontWeight: '900',
    textShadowColor: 'rgba(168,85,247,0.8)',
    textShadowRadius: 10,
  },
  heroMiniCardLeft: {
    position: 'absolute',
    left: '13%',
    bottom: '20%',
    width: '16%',
    height: '14%',
    borderRadius: radiusScale(18),
    backgroundColor: 'rgba(37, 99, 235, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(120, 165, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  heroMiniCardRight: {
    position: 'absolute',
    right: '10%',
    top: '18%',
    width: '18%',
    height: '16%',
    borderRadius: radiusScale(20),
    backgroundColor: 'rgba(168, 85, 247, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '14deg' }],
  },
  heroMiniText: {
    color: '#FFFFFF',
    fontSize: fontScale(10),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
