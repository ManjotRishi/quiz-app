import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const AnimationListWraper = ({ index = 0, children }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * 160,
      withTiming(1, {
        duration: 680,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [index, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateX: (1 - progress.value) * -38 },
      { translateY: (1 - progress.value) * 4 },
      { scale: 0.96 + progress.value * 0.04 },
    ],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default AnimationListWraper;
