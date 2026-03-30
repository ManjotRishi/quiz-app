import React from 'react';
import { Image, StyleSheet } from 'react-native';

const VoiceIcon = ({ muted = false, color = '#F4F7FF', size = 26 }) => {
  return (
    <Image
      source={require('../../assets/images/speak.png')}
      resizeMode="center"
      style={[
        styles.icon,
        {
          width: size,
          height: size,
          opacity: muted ? 0.78 : 1,
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
