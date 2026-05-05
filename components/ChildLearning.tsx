import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  ImageSourcePropType,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomBanner from './BottomBanner';
import {
  ChildLearningItem,
  getChildImageSource,
} from '../constants/childLearning';
import { ROUTES } from '../navigation/routes';
import { RootStackParamList } from '../navigation/types';
import { resetQuizVoice, speakQuizText } from '../audioManager/quizTts';
import { colors } from '../style/colors';
import { fontScale, radiusScale, spaceScale } from '../style/responsive';

type ChildLearningProps = {
  data: ChildLearningItem[];
  title: string;
  helperText: string;
  imageResolver?: (img: string) => ImageSourcePropType;
  showSymbolBubble?: boolean;
  ranges?: {
    label: string;
    startIndex: number;
    endIndex: number;
    colors: [string, string];
  }[];
};

const ChildLearning = ({
  data,
  title,
  helperText,
  imageResolver = getChildImageSource,
  showSymbolBubble = true,
  ranges,
}: ChildLearningProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoSlideEnabled, setAutoSlideEnabled] = useState(false);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);
  const autoSlideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const letterScale = useRef(new Animated.Value(1)).current;

  const selectedRange = ranges?.[selectedRangeIndex];
  const currentItem = data[currentIndex];
  const rangeStartIndex = selectedRange?.startIndex ?? 0;
  const rangeEndIndex = selectedRange?.endIndex ?? data.length - 1;
  const isFirstItem = currentIndex <= rangeStartIndex;
  const isLastItem = currentIndex >= rangeEndIndex;

  const clearAutoSlideTimeout = () => {
    if (autoSlideTimeoutRef.current) {
      clearTimeout(autoSlideTimeoutRef.current);
      autoSlideTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    void resetQuizVoice();

    return () => {
      clearAutoSlideTimeout();
      void resetQuizVoice();
    };
  }, [currentIndex]);

  useEffect(() => {
    if (!selectedRange) {
      return;
    }

    setCurrentIndex(selectedRange.startIndex);
  }, [selectedRange]);

  useEffect(() => {
    clearAutoSlideTimeout();

    if (!autoSlideEnabled || !currentItem?.speaking) {
      return;
    }

    void speakQuizText(currentItem.speaking, {
      interrupt: true,
      appLanguage: 'English',
      rate: 0.5,
    });

    if (isLastItem) {
      setAutoSlideEnabled(false);
      return;
    }

    autoSlideTimeoutRef.current = setTimeout(() => {
      setCurrentIndex((prev) => Math.min(rangeEndIndex, prev + 1));
    }, 2000);

    return () => {
      clearAutoSlideTimeout();
    };
  }, [autoSlideEnabled, currentItem?.speaking, isLastItem, rangeEndIndex]);

  useEffect(() => {
    return () => {
      clearAutoSlideTimeout();
      void resetQuizVoice();
    };
  }, []);

  useEffect(() => {
    letterScale.setValue(1);

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(letterScale, {
          toValue: 1.08,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(letterScale, {
          toValue: 0.94,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(letterScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
      letterScale.stopAnimation();
    };
  }, [currentIndex, letterScale]);

  const handleSpeak = async () => {
    if (!currentItem?.speaking) {
      return;
    }

    const didSpeak = await speakQuizText(currentItem.speaking, {
      interrupt: true,
      appLanguage: 'English',
      rate: 0.5,
    });

    if (!didSpeak) {
      Alert.alert('Voice unavailable', 'Text to speech is not supported on this device right now.');
    }
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate(ROUTES.ChildSection);
  };

  if (!currentItem) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#071A26', '#113246', '#1B4B61']} style={styles.container}>
        <View style={styles.glowOne} pointerEvents="none" />
        <View style={styles.glowTwo} pointerEvents="none" />

        <View style={styles.fixedPanelWrap}>
          <View style={styles.topActionRow}>
            <TouchableOpacity activeOpacity={0.9} onPress={goBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.topTitle}>{title}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.learningCard}>
            {currentItem.img && showSymbolBubble ? (
              <Animated.View
                style={[
                  styles.alphabetBubble,
                  {
                    transform: [{ scale: letterScale }],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.alphabetText,
                    currentItem.symbol.length === 2 ? styles.symbolTextDouble : null,
                    currentItem.symbol.length >= 3 ? styles.symbolTextTriple : null,
                  ]}
                >
                  {currentItem.symbol}
                </Text>
              </Animated.View>
            ) : null}

            {currentItem.img ? (
              <View style={styles.imageFrame}>
                <Image
                  resizeMode="stretch"
                  source={imageResolver(currentItem.img)}
                  style={styles.image}
                />
              </View>
            ) : (
              <LinearGradient
                colors={['#FDE68A', '#FB7185', '#38BDF8']}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.numberFrame}
              >
                <View style={styles.numberGlowOne} />
                <View style={styles.numberGlowTwo} />
                <Text
                  style={[
                    styles.numberDisplayText,
                    currentItem.symbol.length >= 3 ? styles.numberDisplayTextTriple : null,
                    currentItem.symbol.length === 2 ? styles.numberDisplayTextDouble : null,
                  ]}
                >
                  {currentItem.symbol}
                </Text>
              </LinearGradient>
            )}

            <Text style={styles.wordText}>{(currentItem.displayText ?? currentItem.speaking).toUpperCase()}</Text>
            <Text style={styles.helperText}>{helperText}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={isFirstItem}
                onPress={() => setCurrentIndex((prev) => Math.max(rangeStartIndex, prev - 1))}
                style={styles.actionButtonTouch}
              >
                <LinearGradient
                  colors={isFirstItem ? ['rgba(148,163,184,0.6)', 'rgba(100,116,139,0.6)'] : ['rgba(18,52,73,0.96)', 'rgba(56,189,248,0.86)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButton}
                >
                  <Text numberOfLines={1} adjustsFontSizeToFit style={styles.actionButtonText}>
                    Previous
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.92} onPress={handleSpeak} style={styles.actionButtonTouch}>
                <LinearGradient
                  colors={['#14B8A6', '#38BDF8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButton}
                >
                  <Text numberOfLines={1} adjustsFontSizeToFit style={styles.actionButtonText}>
                    Speak
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={isLastItem}
                onPress={() => setCurrentIndex((prev) => Math.min(rangeEndIndex, prev + 1))}
                style={styles.actionButtonTouch}
              >
                <LinearGradient
                  colors={isLastItem ? ['rgba(148,163,184,0.6)', 'rgba(100,116,139,0.6)'] : ['#FDE047', '#FB7185', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButton}
                >
                  <Text numberOfLines={1} adjustsFontSizeToFit style={styles.actionButtonText}>
                    Next
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => setAutoSlideEnabled((prev) => !prev)}
            style={styles.autoSlideButtonTouch}
          >
            <LinearGradient
              colors={autoSlideEnabled ? ['#0F766E', '#14B8A6'] : ['#1E293B', '#334155']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.autoSlideButton}
            >
              <Text style={styles.autoSlideButtonText}>
                {autoSlideEnabled ? 'Automatic Slide On' : 'Automatic Slide Off'}
              </Text>
              <Text style={styles.autoSlideHintText}>
                {autoSlideEnabled ? 'Every 2 seconds it speaks and moves to next.' : 'Enable auto speak and auto next every 2 seconds.'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {ranges?.length ? (
            <View style={styles.rangeSection}>
              <Text style={styles.rangeSectionTitle}>Choose Counting Range</Text>

              <View style={styles.rangeGrid}>
                {ranges.map((range, index) => {
                  const isSelected = index === selectedRangeIndex;

                  return (
                    <TouchableOpacity
                      key={range.label}
                      activeOpacity={0.9}
                      onPress={() => {
                        setSelectedRangeIndex(index);
                        setAutoSlideEnabled(false);
                      }}
                      style={styles.rangeChipTouch}
                    >
                      <LinearGradient
                        colors={range.colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.rangeChip, isSelected ? styles.rangeChipSelected : null]}
                      >
                        {isSelected ? (
                          <View style={styles.rangeSelectedBadge}>
                            <Text style={styles.rangeSelectedBadgeText}>ON</Text>
                          </View>
                        ) : null}
                        <Text style={styles.rangeChipText}>{range.label}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}
        </ScrollView>

        <BottomBanner style={styles.bottomBanner} />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  glowOne: {
    position: 'absolute',
    top: -70,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(56,189,248,0.18)',
  },
  glowTwo: {
    position: 'absolute',
    bottom: -60,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: 'rgba(245,196,81,0.16)',
  },
  fixedPanelWrap: {
    paddingHorizontal: spaceScale(18),
    paddingTop: spaceScale(16),
    paddingBottom: spaceScale(10),
  },
  topActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spaceScale(10),
  },
  backButton: {
    minHeight: 42,
    minWidth: 74,
    paddingHorizontal: spaceScale(16),
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  backButtonText: {
    color: '#F8FBFF',
    fontSize: fontScale(13),
    fontWeight: '900',
  },
  topTitle: {
    color: '#F8FBFF',
    fontSize: fontScale(18),
    fontWeight: '900',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spaceScale(18),
    paddingTop: spaceScale(8),
    paddingBottom: spaceScale(20),
  },
  learningCard: {
    marginTop: spaceScale(4),
    borderRadius: radiusScale(30),
    padding: spaceScale(18),
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  alphabetBubble: {
    alignSelf: 'center',
    width: spaceScale(88),
    height: spaceScale(88),
    borderRadius: radiusScale(999),
    marginTop: spaceScale(6),
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
  },
  alphabetText: {
    color: '#173042',
    fontSize: fontScale(40),
    fontWeight: '900',
  },
  symbolTextDouble: {
    fontSize: fontScale(30),
  },
  symbolTextTriple: {
    fontSize: fontScale(22),
  },
  imageFrame: {
    marginTop: spaceScale(16),
    width: '100%',
    height: 200,
    borderRadius: radiusScale(28),
    overflow: 'hidden',
    backgroundColor: '#FFF7EF',
    borderWidth: 1,
    borderColor: '#F6D8B8',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  numberFrame: {
    marginTop: spaceScale(16),
    width: '100%',
    height: 200,
    borderRadius: radiusScale(28),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  numberGlowOne: {
    position: 'absolute',
    top: -20,
    right: -10,
    width: 90,
    height: 90,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  numberGlowTwo: {
    position: 'absolute',
    bottom: -30,
    left: -16,
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  numberDisplayText: {
    color: '#FFFFFF',
    fontSize: fontScale(92),
    lineHeight: fontScale(98),
    fontWeight: '900',
    letterSpacing: 1.4,
    textShadowColor: 'rgba(12,25,43,0.35)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 10,
  },
  numberDisplayTextDouble: {
    fontSize: fontScale(82),
    lineHeight: fontScale(88),
  },
  numberDisplayTextTriple: {
    fontSize: fontScale(70),
    lineHeight: fontScale(76),
  },
  wordText: {
    marginTop: spaceScale(18),
    color: '#173042',
    fontSize: fontScale(26),
    lineHeight: fontScale(30),
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  helperText: {
    marginTop: spaceScale(8),
    color: '#6F8794',
    fontSize: fontScale(13),
    lineHeight: fontScale(20),
    textAlign: 'center',
  },
  actionRow: {
    marginTop: spaceScale(18),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceScale(8),
  },
  actionButtonTouch: {
    flex: 1,
    minWidth: 0,
  },
  actionButton: {
    minHeight: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spaceScale(8),
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: fontScale(13),
    fontWeight: '900',
    letterSpacing: 0.2,
    paddingHorizontal: 2,
  },
  autoSlideButtonTouch: {
    marginTop: spaceScale(14),
    marginBottom: spaceScale(8),
  },
  autoSlideButton: {
    width: '100%',
    borderRadius: radiusScale(24),
    paddingHorizontal: spaceScale(18),
    paddingVertical: spaceScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoSlideButtonText: {
    color: '#F8FBFF',
    fontSize: fontScale(16),
    fontWeight: '900',
    textAlign: 'center',
  },
  autoSlideHintText: {
    marginTop: spaceScale(6),
    color: 'rgba(241,245,249,0.82)',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
    fontWeight: '700',
    textAlign: 'center',
  },
  rangeSection: {
    marginTop: spaceScale(16),
    marginBottom: spaceScale(10),
  },
  rangeSectionTitle: {
    marginBottom: spaceScale(10),
    color: '#F8FBFF',
    fontSize: fontScale(14),
    fontWeight: '900',
    textAlign: 'center',
  },
  rangeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    rowGap: spaceScale(10),
    columnGap: '2.66%',
  },
  rangeChipTouch: {
    width: '23%',
    minWidth: 68,
  },
  rangeChip: {
    minHeight: 44,
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spaceScale(6),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    position: 'relative',
  },
  rangeChipSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.05 }],
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 7,
  },
  rangeChipText: {
    color: '#FFFFFF',
    fontSize: fontScale(11),
    fontWeight: '900',
    textAlign: 'center',
  },
  rangeSelectedBadge: {
    position: 'absolute',
    top: -8,
    right: -4,
    minWidth: 28,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeSelectedBadgeText: {
    color: '#173042',
    fontSize: fontScale(9),
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  bottomBanner: {
    paddingTop: 8,
  },
});

export default ChildLearning;
