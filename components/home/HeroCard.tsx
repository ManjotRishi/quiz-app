import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from './homeStyles';

type HeroCardProps = {
  displayName: string;
  accuracy: number;
  correctCount: number;
  tracksCount: number;
  englishAttempted: number;
  onContinue: () => void;
};

const HeroCard = ({
  displayName,
  accuracy,
  correctCount,
  tracksCount,
  englishAttempted,
  onContinue,
}: HeroCardProps) => (
  <View style={styles.heroCard}>
    <Text style={styles.greeting}>Hello, {displayName}</Text>

    <View style={styles.heroBanner}>
      <Image
        source={require('../../assets/images/stu1_green.png')}
        style={styles.heroStudentImage}
        resizeMode="stretch"
      />
    </View>

    <View style={styles.heroStrip}>
      <View style={styles.heroStatCard}>
        <Text style={styles.heroStatValue}>{accuracy}%</Text>
        <Text style={styles.heroStatLabel}>Accuracy</Text>
      </View>
      <View style={styles.heroStatCard}>
        <Text style={styles.heroStatValue}>{correctCount}</Text>
        <Text style={styles.heroStatLabel}>Correct</Text>
      </View>
      <View style={styles.heroStatCard}>
        <Text style={styles.heroStatValue}>{tracksCount}</Text>
        <Text style={styles.heroStatLabel}>Tracks</Text>
      </View>
    </View>

    <LinearGradient
      colors={['rgba(20,184,166,0.20)', 'rgba(56,189,248,0.16)', 'rgba(251,146,60,0.18)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.continueCard}
    >
      <View style={styles.continueCopy}>
        <Text style={styles.continueKicker}>Continue Practice</Text>
        <Text style={styles.continueTitle}>English Quiz</Text>
        <Text style={styles.continueMeta}>Questions {englishAttempted}/25</Text>
      </View>

      <TouchableOpacity activeOpacity={0.9} style={styles.continueButtonWrap} onPress={onContinue}>
        <LinearGradient colors={['#14B8A6', '#FB923C']} style={styles.continueButton}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  </View>
);

export default HeroCard;
