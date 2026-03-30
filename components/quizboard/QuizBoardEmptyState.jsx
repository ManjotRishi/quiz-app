import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { EmptyQuizIllustration } from '../svg';
import { ROUTES } from '../../navigation/routes';
import { quizBoardStyles as styles } from './styles';

const QuizBoardEmptyState = ({ selectedLanguage }) => {
  const navigation = useNavigation();
  const emptyPulse = useSharedValue(0);

  useEffect(() => {
    emptyPulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 2200 }), withTiming(0, { duration: 2200 })),
      -1,
      true
    );

    return () => {
      emptyPulse.value = 0;
    };
  }, [emptyPulse]);

  const emptyArtStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: emptyPulse.value * -10 },
      { scale: 1 + emptyPulse.value * 0.03 },
    ],
  }));

  return (
    <View style={styles.emptyState}>
      <Animated.View style={[styles.emptyArtWrap, emptyArtStyle]}>
        <EmptyQuizIllustration style={styles.emptyArt} />
      </Animated.View>
      <View style={styles.emptyCopyCard}>
        <Text style={styles.emptyTitle}>No quiz available yet</Text>
        <Text style={styles.emptyText}>
          Come back later for today&apos;s set of questions in {selectedLanguage ?? 'English'}.
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate(ROUTES.Home)}
        style={styles.emptyHomeButtonHit}
      >
        <LinearGradient
          colors={['rgba(11,31,94,0.88)', 'rgba(36,59,143,0.84)', 'rgba(201,167,255,0.82)']}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyHomeButton}
        >
          <Text style={styles.emptyHomeIcon}>⌂</Text>
          <Text style={styles.emptyHomeText}>Home</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default QuizBoardEmptyState;
