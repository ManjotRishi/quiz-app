import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const useFadeIn = (duration = 700) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [duration, opacity, translateY]);

  return { opacity, translateY };
};
