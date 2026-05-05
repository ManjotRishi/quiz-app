import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const StartQuizOverlay = ({
  visible,
  title,
  subtitle,
  onStart,
  onSelectChild,
  onSelectAdult,
}) => {
  const kidEntry = useRef(new Animated.Value(0)).current;
  const teenEntry = useRef(new Animated.Value(0)).current;
  const cardsEntry = useRef(new Animated.Value(0)).current;
  const auraPulse = useRef(new Animated.Value(0)).current;
  const badgeFloat = useRef(new Animated.Value(0)).current;
  const chipDrift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      kidEntry.setValue(0);
      teenEntry.setValue(0);
      cardsEntry.setValue(0);
      return;
    }

    Animated.sequence([
      Animated.spring(kidEntry, {
        toValue: 1,
        speed: 12,
        bounciness: 10,
        useNativeDriver: true,
      }),
      Animated.timing(teenEntry, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(cardsEntry, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(auraPulse, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(auraPulse, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );

    const badgeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(badgeFloat, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(badgeFloat, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const chipLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(chipDrift, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(chipDrift, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();
    badgeLoop.start();
    chipLoop.start();

    return () => {
      pulseLoop.stop();
      badgeLoop.stop();
      chipLoop.stop();
    };
  }, [auraPulse, badgeFloat, cardsEntry, chipDrift, kidEntry, teenEntry, visible]);

  if (!visible) {
    return null;
  }

  const kidStyle = {
    transform: [
      {
        translateY: kidEntry.interpolate({
          inputRange: [0, 1],
          outputRange: [90, 0],
        }),
      },
      {
        scale: kidEntry.interpolate({
          inputRange: [0, 1],
          outputRange: [0.75, 1],
        }),
      },
    ],
    opacity: kidEntry,
  };

  const teenStyle = {
    transform: [
      {
        translateX: teenEntry.interpolate({
          inputRange: [0, 1],
          outputRange: [110, 0],
        }),
      },
      {
        rotate: teenEntry.interpolate({
          inputRange: [0, 1],
          outputRange: ['8deg', '0deg'],
        }),
      },
    ],
    opacity: teenEntry,
  };

  const cardsStyle = {
    opacity: cardsEntry,
    transform: [
      {
        translateY: cardsEntry.interpolate({
          inputRange: [0, 1],
          outputRange: [28, 0],
        }),
      },
      {
        scale: cardsEntry.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1],
        }),
      },
    ],
  };

  const auraStyle = {
    opacity: auraPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.22, 0.5],
    }),
    transform: [
      {
        scale: auraPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.94, 1.08],
        }),
      },
    ],
  };

  const badgeStyle = {
    transform: [
      {
        translateY: badgeFloat.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
    ],
  };

  const leftChipStyle = {
    transform: [
      {
        translateY: chipDrift.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -6],
        }),
      },
      {
        rotate: chipDrift.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-4deg'],
        }),
      },
    ],
  };

  const rightChipStyle = {
    transform: [
      {
        translateY: chipDrift.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 6],
        }),
      },
      {
        rotate: chipDrift.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '4deg'],
        }),
      },
    ],
  };

  const showModePicker = Boolean(onSelectChild || onSelectAdult);
  const handleChildPress = onSelectChild || onStart;
  const handleAdultPress = onSelectAdult || onStart;

  return (
    <Modal transparent statusBarTranslucent animationType="fade" visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.shell}>
          <View style={styles.borderOuter}>
            <LinearGradient
              colors={['rgba(250,204,21,0.92)', 'rgba(96,165,250,0.92)', 'rgba(236,72,153,0.92)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.border}
            />
          </View>

          <LinearGradient
            colors={['rgba(8,16,34,0.99)', 'rgba(17,24,52,0.99)', 'rgba(32,17,54,0.99)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.characterScene}>
              <Animated.View style={[styles.sceneAura, auraStyle]} />
              <View style={styles.sceneBubbleOne} />
              <View style={styles.sceneBubbleTwo} />
              <Animated.View style={[styles.topBadge, badgeStyle]}>
                <Text style={styles.topBadgeText}>GK Challenge</Text>
              </Animated.View>
              <Animated.View style={[styles.floatingChipLeft, leftChipStyle]}>
                <Text style={styles.floatingChipText}>Think Fast</Text>
              </Animated.View>
              <Animated.View style={[styles.floatingChipRight, rightChipStyle]}>
                <Text style={styles.floatingChipText}>Fun Facts</Text>
              </Animated.View>

              <View style={styles.characterRow}>
                <Animated.View style={[styles.characterColumn, kidStyle]}>
                  <TouchableOpacity activeOpacity={0.9} onPress={handleChildPress} style={styles.avatarTouch}>
                  <LinearGradient
                    colors={['#FDE047', '#FB7185', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.characterOrb}
                  >
                    <View style={styles.characterInner}>
                      <Text style={styles.characterEmoji}>🧒</Text>
                    </View>
                  </LinearGradient>
                  <View style={styles.characterShadow} />
                  <Text style={styles.avatarLabel}>Kids</Text>
                  <Text style={styles.avatarSubtext}>Jump in, explore, and learn with joy.</Text>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[styles.characterColumn, teenStyle]}>
                  <TouchableOpacity activeOpacity={0.9} onPress={handleAdultPress} style={styles.avatarTouch}>
                  <LinearGradient
                    colors={['#0F172A', '#334155', '#475569']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.characterOrb, styles.adultOrb]}
                  >
                    <View style={styles.characterInner}>
                      <Text style={styles.characterEmoji}>👨‍💼</Text>
                      <View style={styles.phoneChip}>
                        <Text style={styles.phoneEmoji}>📱</Text>
                      </View>
                    </View>
                  </LinearGradient>
                  <View style={styles.characterShadow} />
                  <Text style={styles.avatarLabel}>Adults</Text>
                  <Text style={styles.avatarSubtext}>Focus sharp, confidence steady, ready to rise.</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <Animated.View style={[styles.cardsWrap, cardsStyle]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.06)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryCard}
                >
                  <Text style={styles.title}>{title || 'Welcome to GK Quiz'}</Text>
                  <Text style={styles.kicker}>Ready to play, discover, and surprise yourself?</Text>
                </LinearGradient>

                <LinearGradient
                  colors={['rgba(17,24,39,0.96)', 'rgba(30,41,59,0.90)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.secondaryCard}
                >
                  <Text style={styles.inspiration}>
                    {subtitle || 'Every great journey of learning begins with one brave yes. Trust your mind, enjoy the challenge, and let this quiz reveal how brightly you can shine.'}
                  </Text>

                  {showModePicker ? (
                    <View style={styles.selectionHintWrap}>
                      <Text style={styles.selectionHint}>Choose your avatar to continue</Text>
                    </View>
                  ) : (
                    <TouchableOpacity activeOpacity={0.88} onPress={onStart} style={styles.startButton}>
                      <LinearGradient
                        colors={['#F59E0B', '#EC4899', '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.startGradient}
                      >
                        <Text style={styles.startText}>Start Quiz</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </LinearGradient>
              </Animated.View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,8,18,0.80)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  shell: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 34,
  },
  borderOuter: {
    position: 'absolute',
    left: -10,
    right: -10,
    top: -10,
    bottom: -10,
    borderRadius: 44,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  border: {
    flex: 1,
    borderRadius: 40,
  },
  card: {
    borderRadius: 33,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.34,
    shadowRadius: 28,
    elevation: 12,
  },
  characterScene: {
    width: '100%',
    minHeight: 360,
    borderRadius: 28,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 22,
    backgroundColor: '#10172B',
  },
  sceneAura: {
    position: 'absolute',
    top: 18,
    left: '50%',
    marginLeft: -110,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(96,165,250,0.12)',
  },
  sceneBubbleOne: {
    position: 'absolute',
    top: 34,
    left: 22,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(253,224,71,0.32)',
  },
  sceneBubbleTwo: {
    position: 'absolute',
    top: 56,
    right: 28,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(125,211,252,0.34)',
  },
  topBadge: {
    position: 'absolute',
    top: 14,
    left: '50%',
    transform: [{ translateX: -52 }],
    minWidth: 104,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(250,204,21,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBadgeText: {
    color: '#FDE68A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  floatingChipLeft: {
    position: 'absolute',
    top: 82,
    left: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(251,113,133,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.28)',
  },
  floatingChipRight: {
    position: 'absolute',
    top: 86,
    right: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(96,165,250,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.28)',
  },
  floatingChipText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  characterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 6,
    minHeight: 170,
  },
  characterColumn: {
    flex: 1,
    alignItems: 'center',
  },
  avatarTouch: {
    alignItems: 'center',
    width: '100%',
  },
  characterOrb: {
    width: 118,
    height: 118,
    borderRadius: 59,
    padding: 4,
  },
  adultOrb: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  characterInner: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(13,18,36,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  characterEmoji: {
    fontSize: 50,
  },
  phoneChip: {
    position: 'absolute',
    right: 10,
    bottom: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneEmoji: {
    fontSize: 14,
  },
  characterShadow: {
    marginTop: 10,
    width: 72,
    height: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.24)',
  },
  avatarLabel: {
    marginTop: 10,
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  avatarSubtext: {
    marginTop: 4,
    color: 'rgba(226,232,240,0.78)',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    maxWidth: 132,
  },
  cardsWrap: {
    marginTop: 18,
  },
  primaryCard: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  secondaryCard: {
    marginTop: 14,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  selectionHintWrap: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  selectionHint: {
    color: '#FDE68A',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  stage: {
    width: '100%',
    height: 360,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#10172B',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  stageGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  topPelmet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 34,
    backgroundColor: '#5F0F16',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(245,158,11,0.40)',
    zIndex: 5,
  },
  curtainPanel: {
    position: 'absolute',
    top: 0,
    bottom: 42,
    width: '50%',
    zIndex: 4,
  },
  curtainLeftWrap: {
    left: 0,
  },
  curtainRightWrap: {
    right: 0,
  },
  curtain: {
    flex: 1,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  foldOne: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '18%',
    width: 22,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  foldTwo: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '46%',
    width: 18,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  foldThree: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: '16%',
    width: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  centerContent: {
    width: '100%',
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  spotlight: {
    position: 'absolute',
    top: 18,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(253,224,71,0.10)',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  kicker: {
    marginTop: 8,
    color: 'rgba(226,232,240,0.72)',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  inspiration: {
    marginTop: 14,
    color: 'rgba(226,232,240,0.84)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 280,
  },
  startButton: {
    marginTop: 22,
    borderRadius: 18,
    overflow: 'hidden',
    minWidth: 180,
  },
  startGradient: {
    paddingHorizontal: 26,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  stageFloor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 46,
    backgroundColor: '#241013',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  sceneWrap: {
    width: '100%',
    height: 328,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  skyVeil: {
    ...StyleSheet.absoluteFillObject,
  },
  cloudLeft: {
    position: 'absolute',
    top: 18,
    left: 12,
    width: 118,
    height: 40,
  },
  cloudRight: {
    position: 'absolute',
    top: 28,
    right: 14,
    width: 108,
    height: 38,
  },
  cloudLarge: {
    position: 'absolute',
    left: 8,
    bottom: 0,
    width: 58,
    height: 28,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  cloudMid: {
    position: 'absolute',
    left: 38,
    top: 2,
    width: 46,
    height: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  cloudSmall: {
    position: 'absolute',
    right: 0,
    bottom: 3,
    width: 34,
    height: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  magicHalo: {
    position: 'absolute',
    top: 48,
    left: '50%',
    marginLeft: -94,
    width: 188,
    height: 188,
    borderRadius: 94,
    backgroundColor: 'rgba(96,165,250,0.12)',
  },
  sceneGlowLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(96,165,250,0.16)',
  },
  sceneGlowSmall: {
    position: 'absolute',
    top: 34,
    right: 34,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(251,191,36,0.16)',
  },
  windStrokeOne: {
    position: 'absolute',
    top: 42,
    left: 20,
    width: 110,
    height: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.18)',
    backgroundColor: 'rgba(147,197,253,0.08)',
  },
  windStrokeTwo: {
    position: 'absolute',
    top: 88,
    right: 16,
    width: 82,
    height: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(253,224,71,0.18)',
    backgroundColor: 'rgba(253,224,71,0.08)',
  },
  windStrokeThree: {
    position: 'absolute',
    top: 126,
    left: 42,
    width: 90,
    height: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(244,114,182,0.18)',
    backgroundColor: 'rgba(244,114,182,0.08)',
  },
  rainLaneOne: {
    position: 'absolute',
    top: 18,
    left: 42,
    alignItems: 'center',
  },
  rainLaneTwo: {
    position: 'absolute',
    top: 4,
    left: 116,
    alignItems: 'center',
  },
  rainLaneThree: {
    position: 'absolute',
    top: 20,
    right: 110,
    alignItems: 'center',
  },
  rainLaneFour: {
    position: 'absolute',
    top: 8,
    right: 36,
    alignItems: 'center',
  },
  rainGlyph: {
    marginVertical: 5,
    fontSize: 24,
    fontWeight: '900',
  },
  rainDrop: {
    marginVertical: 2,
    fontSize: 16,
  },
  rainDropBlue: {
    color: '#7DD3FC',
  },
  rainDropSoft: {
    color: '#BAE6FD',
  },
  rainGold: {
    color: '#FDE68A',
  },
  rainBlue: {
    color: '#93C5FD',
  },
  rainPink: {
    color: '#F9A8D4',
  },
  catchZone: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    height: 150,
  },
  landBase: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 0,
    height: 54,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    backgroundColor: '#244B2C',
  },
  landRidgeLeft: {
    position: 'absolute',
    left: 12,
    bottom: 32,
    width: 128,
    height: 26,
    borderRadius: 26,
    backgroundColor: '#3C6A3E',
    transform: [{ rotate: '-5deg' }],
  },
  landRidgeRight: {
    position: 'absolute',
    right: 16,
    bottom: 28,
    width: 140,
    height: 28,
    borderRadius: 28,
    backgroundColor: '#477A46',
    transform: [{ rotate: '4deg' }],
  },
  puddleOne: {
    position: 'absolute',
    left: 34,
    bottom: 12,
    width: 52,
    height: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(96,165,250,0.34)',
  },
  puddleTwo: {
    position: 'absolute',
    left: 146,
    bottom: 18,
    width: 40,
    height: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(125,211,252,0.28)',
  },
  puddleThree: {
    position: 'absolute',
    right: 38,
    bottom: 12,
    width: 56,
    height: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(56,189,248,0.32)',
  },
  rainMist: {
    position: 'absolute',
    left: 26,
    right: 26,
    bottom: 46,
    height: 22,
    borderRadius: 22,
  },
  catcherOne: {
    position: 'absolute',
    left: 18,
    bottom: 20,
  },
  catcherTwo: {
    position: 'absolute',
    left: 92,
    bottom: 24,
  },
  catcherThree: {
    position: 'absolute',
    right: 92,
    bottom: 24,
  },
  catcherFour: {
    position: 'absolute',
    right: 18,
    bottom: 20,
  },
  characterWrap: {
    width: 70,
    height: 118,
    alignItems: 'center',
  },
  characterHead: {
    position: 'absolute',
    top: 0,
    width: 34,
    height: 38,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    overflow: 'hidden',
  },
  characterHeadWarm: {
    backgroundColor: '#F7C894',
  },
  characterHeadRose: {
    backgroundColor: '#F5B7B1',
  },
  characterHeadCool: {
    backgroundColor: '#EBC29A',
  },
  characterHeadLilac: {
    backgroundColor: '#F2C19A',
  },
  hairCapShort: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#2F1F1A',
  },
  hairCapLong: {
    position: 'absolute',
    top: 0,
    left: -2,
    right: -2,
    height: 18,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#3B1F2D',
  },
  hairCapWave: {
    position: 'absolute',
    top: 0,
    left: -1,
    right: -1,
    height: 15,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#2B2A35',
  },
  eyeLeft: {
    position: 'absolute',
    top: 18,
    left: 10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#201A17',
  },
  eyeRight: {
    position: 'absolute',
    top: 18,
    right: 10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#201A17',
  },
  characterNeck: {
    position: 'absolute',
    top: 34,
    width: 10,
    height: 10,
    borderRadius: 4,
    backgroundColor: '#E9C19A',
    zIndex: 1,
  },
  characterBody: {
    position: 'absolute',
    top: 40,
    width: 38,
    height: 28,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    zIndex: 2,
  },
  characterBodyGold: {
    backgroundColor: '#F59E0B',
  },
  characterBodyPink: {
    backgroundColor: '#EC4899',
  },
  characterBodyBlue: {
    backgroundColor: '#3B82F6',
  },
  characterBodyPurple: {
    backgroundColor: '#8B5CF6',
  },
  characterArmLeft: {
    position: 'absolute',
    top: 42,
    left: 8,
    width: 28,
    height: 6,
    borderRadius: 6,
    transform: [{ rotate: '-54deg' }],
    zIndex: 1,
  },
  characterArmRight: {
    position: 'absolute',
    top: 42,
    right: 8,
    width: 28,
    height: 6,
    borderRadius: 6,
    transform: [{ rotate: '54deg' }],
    zIndex: 1,
  },
  characterArmGold: {
    backgroundColor: '#F8C28F',
  },
  characterArmPink: {
    backgroundColor: '#F5B7B1',
  },
  characterArmBlue: {
    backgroundColor: '#E7BC93',
  },
  characterArmPurple: {
    backgroundColor: '#EFB88D',
  },
  catchHands: {
    position: 'absolute',
    top: 20,
    width: 22,
    height: 12,
    borderRadius: 12,
    zIndex: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  catchHandsGold: {
    backgroundColor: '#F8C28F',
  },
  catchHandsPink: {
    backgroundColor: '#F5B7B1',
  },
  catchHandsBlue: {
    backgroundColor: '#E7BC93',
  },
  catchHandsPurple: {
    backgroundColor: '#EFB88D',
  },
  characterLowerBody: {
    position: 'absolute',
    top: 64,
    width: 34,
    height: 18,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 1,
  },
  characterLowerBodyGold: {
    backgroundColor: '#B45309',
  },
  characterLowerBodyPink: {
    backgroundColor: '#BE185D',
  },
  characterLowerBodyBlue: {
    backgroundColor: '#1D4ED8',
  },
  characterLowerBodyPurple: {
    backgroundColor: '#6D28D9',
  },
  characterLegLeft: {
    position: 'absolute',
    bottom: 14,
    left: 24,
    width: 7,
    height: 30,
    borderRadius: 7,
    backgroundColor: '#1F2937',
    transform: [{ rotate: '4deg' }],
  },
  characterLegRight: {
    position: 'absolute',
    bottom: 14,
    right: 24,
    width: 7,
    height: 30,
    borderRadius: 7,
    backgroundColor: '#1F2937',
    transform: [{ rotate: '-4deg' }],
  },
  characterShoeLeft: {
    position: 'absolute',
    bottom: 10,
    left: 18,
    width: 16,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  characterShoeRight: {
    position: 'absolute',
    bottom: 10,
    right: 18,
    width: 16,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  avatarRow: {
    width: '100%',
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  avatarHit: {
    borderRadius: 999,
  },
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    padding: 4,
  },
  avatarCore: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(10,14,28,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  avatarEmoji: {
    fontSize: 34,
  },
});

export default StartQuizOverlay;
