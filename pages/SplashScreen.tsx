import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  ImageBackground,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientButton } from '../components/GradientButton';
import { RootStackParamList } from '../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import TypingText from '../animation/TypingText';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen = ({ navigation }: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.03,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // ✅ subtle vertical move
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -8,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      
      <ImageBackground
        source={require('../assets/images/splash.png')}
        style={styles.image}
        resizeMode="cover"
      >
        {/* 🔥 Animate inner layer instead of image */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: translateY },
              ],
            },
          ]}
        />

        {/* Overlay */}
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea}>
          <View style={{ flex: 1 }} />

          <View style={{ bottom: 150, alignSelf: "center" }}>
            <TypingText />
          </View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <GradientButton
              label="Get Started"
              onPress={() => navigation.replace('QuizBoard')}
              style={styles.button}
            />
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  safeArea: {
    padding: 24,
    flex: 1,
    justifyContent: 'space-between',
  },

  button: {
    marginBottom: 10,
    borderRadius: 30,
  },
});