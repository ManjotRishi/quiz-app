import React from 'react';
import { Image, StyleSheet } from 'react-native';

const VoiceIcon = ({ muted = false, color = '#F4F7FF', size = 26 }) => {
  const visualSize = size * 1.22;

  return (
    <Image
      source={require('../../assets/images/speak.png')}
      resizeMode="contain"
      style={[
        styles.icon,
        {
          width: visualSize,
          height: visualSize,
          opacity: muted ? 0.62 : 1,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    alignSelf: 'center',
  },
});

export default VoiceIcon;
