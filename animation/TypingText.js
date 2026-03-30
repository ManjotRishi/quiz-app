import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { splashTexts } from '../util/constants';
import { colors } from '../style/colors';



const TypingText = () => {
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);

  const cursorOpacity = useSharedValue(1);

  useEffect(() => {
    cursorOpacity.value = withRepeat(
      withTiming(0, { duration: 500 }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    let index = 0;
    let isDeleting = false;

    const currentText = splashTexts[textIndex];

    const interval = setInterval(() => {
      if (!isDeleting) {
        setDisplayText(currentText.slice(0, index));
        index++;

        if (index > currentText.length) {
          isDeleting = true;

          // pause before deleting
          setTimeout(() => {}, 1000);
        }
      } else {
        setDisplayText(currentText.slice(0, index));
        index--;

        if (index === 0) {
          isDeleting = false;
          setTextIndex((prev) => (prev + 1) % splashTexts?.length);
        }
      }
    }, isDeleting ? 40 : 80); // faster delete, slower typing

    return () => clearInterval(interval);
  }, [textIndex]);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  return (
    <Text style={styles.text}>
      {displayText}
      <Animated.Text style={[styles.cursor, cursorStyle]}>
        |
      </Animated.Text>
    </Text>
  );
};

export default TypingText;

const styles = StyleSheet.create({
  text: {
    color: colors.textDark,
    fontSize: 20,
    marginTop: 6,
    letterSpacing: 1.2,
  },
  cursor: {
    color: colors.deepPurple,
  },
});
