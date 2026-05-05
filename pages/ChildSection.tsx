import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BottomBanner from '../components/BottomBanner';
import {
  ChildQuizBunnyIllustration,
  ChildQuizDinoIllustration,
  ChildQuizPlaygroundIllustration,
  ChildStoryIllustration,
} from '../components/svg';
import { ROUTES } from '../navigation/routes';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../style/colors';
import { fontScale, radiusScale, spaceScale } from '../style/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'ChildSection'>;

const cards = [
  {
    key: 'story',
    title: 'Story',
    subtitle: 'Read and listen in a friendly TTS player layout with auto-scrolling text.',
    accent: ['#38BDF8', '#14B8A6'],
    route: ROUTES.StoryScreen,
    cta: 'Open Story',
    Art: ChildStoryIllustration,
  },
  {
    key: 'quiz',
    title: 'Quiz',
    subtitle: 'Question-first learning without picture-based prompts, just simple playful choices.',
    accent: ['#14B8A6', '#FB923C'],
    route: ROUTES.ChildQuizz,
    cta: 'Start Quiz',
    Art: ChildQuizPlaygroundIllustration,
  },
  {
    key: 'alphabet',
    title: 'Alphabet',
    subtitle: 'One letter at a time with bright images, simple words, and a tap-to-speak voice button.',
    accent: ['#F59E0B', '#EC4899'],
    route: ROUTES.ChildAlphabet,
    cta: 'Open ABC',
    Art: ChildQuizBunnyIllustration,
  },
  {
    key: 'counting',
    title: 'Counting',
    subtitle: 'Learn numbers from 1 to 100 with colorful number cards, voice support, and auto slide.',
    accent: ['#38BDF8', '#8B5CF6'],
    route: ROUTES.ChildCounting,
    cta: 'Open 1-100',
    Art: ChildQuizDinoIllustration,
  },
  {
    key: 'animals',
    title: 'Animals',
    subtitle: 'See bright animal pictures, hear the correct names, and move one animal at a time with voice support.',
    accent: ['#22C55E', '#14B8A6'],
    route: ROUTES.ChildAnimals,
    cta: 'Open Animals',
    Art: ChildQuizBunnyIllustration,
  },
  {
    key: 'tables',
    title: 'Tables',
    subtitle: 'Learn multiplication from 2 to 10 with step-by-step voice support and automatic playback.',
    accent: ['#14B8A6', '#3B82F6'],
    route: ROUTES.MultiplicationTableLearning,
    cta: 'Open Tables',
    Art: ChildQuizPlaygroundIllustration,
  },
] as const;

const ChildSection = ({ navigation }: Props) => {
  const cardAnims = useRef(cards.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      110,
      cardAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          speed: 12,
          bounciness: 7,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [cardAnims]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#071A26', '#113246', '#1B4B61']} style={styles.container}>
        <View style={styles.glowOne} />
        <View style={styles.glowTwo} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.topRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate(ROUTES.Home)}
              style={styles.navChip}
            >
              <Text style={styles.navChipText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(ROUTES.Home)} style={styles.navChip}>
              <Text style={styles.navChipText}>Home</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroGlowPrimary} />
            <View style={styles.heroGlowSecondary} />

            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Kids Corner</Text>
            </View>

            <View style={styles.heroContentRow}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>Read little stories, explore ABC, count to 100, and play smart quizzes.</Text>
                <Text style={styles.heroQuote}>
                  "Learn with joy, speak with confidence, and grow a little every day."
                </Text>

                <View style={styles.heroTagRow}>
                  <View style={[styles.heroTag, styles.heroTagBlue]}>
                    <Text style={styles.heroTagText}>Story</Text>
                  </View>
                  <View style={[styles.heroTag, styles.heroTagGold]}>
                    <Text style={styles.heroTagText}>Alphabet</Text>
                  </View>
                  <View style={[styles.heroTag, styles.heroTagBlue]}>
                    <Text style={styles.heroTagText}>Counting</Text>
                  </View>
                  <View style={[styles.heroTag, styles.heroTagMint]}>
                    <Text style={styles.heroTagText}>Animals</Text>
                  </View>
                  <View style={[styles.heroTag, styles.heroTagMint]}>
                    <Text style={styles.heroTagText}>Quiz</Text>
                  </View>
                  <View style={[styles.heroTag, styles.heroTagGold]}>
                    <Text style={styles.heroTagText}>Tables</Text>
                  </View>
                </View>
              </View>

              <LinearGradient colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.04)']} style={styles.heroArtShell}>
                <ChildQuizPlaygroundIllustration style={styles.heroArt} />
              </LinearGradient>
            </View>
          </View>

          <View style={styles.selectionSection}>
            <Text style={styles.selectionTitle}>Pick an activity</Text>
            <Text style={styles.selectionText}>
              Each card opens a calmer, cleaner learning screen for story time, alphabet practice, animals, counting, tables, or quiz play.
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCardsContent}>
            {cards.map((card, index) => {
              const Art = card.Art;

              return (
                <Animated.View
                  key={card.key}
                  style={[
                    styles.cardShell,
                    {
                      opacity: cardAnims[index],
                      transform: [
                        {
                          translateY: cardAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [26, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity activeOpacity={0.92} onPress={() => navigation.navigate(card.route)} style={styles.cardTouch}>
                    <View style={styles.card}>
                      <LinearGradient colors={card.accent as unknown as string[]} style={styles.artWrap}>
                        <Art style={styles.art} />
                      </LinearGradient>

                      <View style={styles.copyWrap}>
                        <Text style={styles.cardTitle}>{card.title}</Text>
                        <Text style={styles.cardText}>{card.subtitle}</Text>

                        <LinearGradient colors={card.accent as unknown as string[]} style={styles.ctaButton}>
                          <Text style={styles.ctaText}>{card.cta}</Text>
                        </LinearGradient>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>
        </ScrollView>
        <BottomBanner />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ChildSection;

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
  scrollContent: {
    paddingHorizontal: spaceScale(18),
    paddingTop: spaceScale(20),
    paddingBottom: spaceScale(40),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spaceScale(12),
  },
  navChip: {
    minHeight: 42,
    minWidth: 88,
    paddingHorizontal: spaceScale(18),
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  navChipText: {
    color: '#F8FBFF',
    fontSize: fontScale(13),
    fontWeight: '900',
  },
  heroCard: {
    marginTop: spaceScale(14),
    width: '100%',
    minHeight: 220,
    borderRadius: radiusScale(30),
    overflow: 'hidden',
    padding: spaceScale(18),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroGlowPrimary: {
    position: 'absolute',
    top: -44,
    right: -28,
    width: 150,
    height: 150,
    borderRadius: 150,
    backgroundColor: 'rgba(56,189,248,0.24)',
  },
  heroGlowSecondary: {
    position: 'absolute',
    bottom: -38,
    left: -18,
    width: 126,
    height: 126,
    borderRadius: 126,
    backgroundColor: 'rgba(251,146,60,0.18)',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spaceScale(12),
    paddingVertical: spaceScale(7),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(7,26,38,0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroBadgeText: {
    color: '#FDE68A',
    fontSize: fontScale(11),
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroContentRow: {
    marginTop: spaceScale(14),
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroCopy: {
    flex: 1,
    paddingRight: spaceScale(14),
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: fontScale(24),
    lineHeight: fontScale(30),
    fontWeight: '900',
  },
  heroQuote: {
    marginTop: spaceScale(10),
    color: 'rgba(241,245,249,0.86)',
    fontSize: fontScale(13),
    lineHeight: fontScale(19),
    fontWeight: '700',
  },
  heroTagRow: {
    marginTop: spaceScale(14),
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spaceScale(8),
  },
  heroTag: {
    minHeight: 32,
    paddingHorizontal: spaceScale(12),
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTagBlue: {
    backgroundColor: 'rgba(56,189,248,0.22)',
  },
  heroTagGold: {
    backgroundColor: 'rgba(245,196,81,0.24)',
  },
  heroTagMint: {
    backgroundColor: 'rgba(20,184,166,0.24)',
  },
  heroTagText: {
    color: '#F8FBFF',
    fontSize: fontScale(12),
    fontWeight: '900',
  },
  heroArtShell: {
    width: 122,
    height: 122,
    borderRadius: radiusScale(28),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroArt: {
    width: '122%',
    height: '122%',
  },
  selectionSection: {
    marginTop: spaceScale(20),
    marginBottom: spaceScale(10),
  },
  selectionTitle: {
    color: '#FFFFFF',
    fontSize: fontScale(22),
    fontWeight: '900',
  },
  selectionText: {
    marginTop: spaceScale(6),
    color: 'rgba(241,245,249,0.78)',
    fontSize: fontScale(13),
    lineHeight: fontScale(19),
  },
  horizontalCardsContent: {
    paddingRight: spaceScale(18),
    paddingTop: spaceScale(8),
  },
  cardShell: {
    width: 262,
    marginRight: spaceScale(14),
  },
  cardTouch: {
    width: 262,
  },
  card: {
    borderRadius: radiusScale(28),
    minHeight: 286,
    padding: spaceScale(12),
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  artWrap: {
    width: '100%',
    height: 118,
    borderRadius: radiusScale(24),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  art: {
    width: '100%',
    height: '100%',
  },
  copyWrap: {
    marginTop: spaceScale(10),
  },
  cardTitle: {
    color: '#173042',
    fontSize: fontScale(18),
    lineHeight: fontScale(22),
    fontWeight: '900',
  },
  cardText: {
    marginTop: spaceScale(5),
    color: '#6F8794',
    fontSize: fontScale(11),
    lineHeight: fontScale(15),
  },
  ctaButton: {
    marginTop: spaceScale(12),
    minHeight: 38,
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: fontScale(13),
    fontWeight: '900',
  },
});
