import React from 'react';
import {  StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { GradientButton } from '../components/GradientButton';
import { colors } from '../style/colors';
import { formatTimer, getScoreMessage } from '../util/functions.js';
import { RootStackParamList } from '../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'Score'>;

const Score = ({ navigation, route }: Props) => {
  const { totalQuestions, correctAnswers, timeTakenSeconds, accuracy } = route.params;
  const scorePoints = correctAnswers * 10;
  const message = getScoreMessage(accuracy);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Quiz Completed!</Text>
        <Text style={styles.headerSubtitle}>Your Results</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{message}</Text>
        <Text style={styles.score}>{scorePoints} pts</Text>
        <Text style={styles.correctLabel}>Correct Answers: {correctAnswers} / {totalQuestions}</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Accuracy</Text>
            <Text style={styles.metricValue}>{accuracy}%</Text>
          </View>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Time Taken</Text>
            <Text style={styles.metricValue}>{formatTimer(timeTakenSeconds)}</Text>
          </View>
        </View>
      </View>

      <GradientButton
        label="Play Again"
        onPress={() => navigation.replace('QuizBoard')}
        style={styles.playButton}
      />
      <TouchableOpacity style={styles.homeButton} onPress={() => navigation.popToTop()}>
        <Text style={styles.homeText}>Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    borderRadius: 30,
    marginHorizontal: 8,
    padding: 26,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.9)',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 26,
    shadowColor: colors.deepPurple,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
  },
  score: {
    marginTop: 16,
    fontSize: 48,
    fontWeight: '800',
    color: colors.deepPurple,
    textAlign: 'center',
  },
  correctLabel: {
    marginTop: 8,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  metricBlock: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDark,
  },
  playButton: {
    marginTop: 24,
  },
  homeButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.optionBorder,
    alignItems: 'center',
  },
  homeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.deepPurple,
  },
});

export default Score;
