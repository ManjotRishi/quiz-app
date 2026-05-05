import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const SpeakerIcon = ({ muted = false, size = 20 }) => {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Image
        source={require('../../assets/images/speak.png')}
        resizeMode="contain"
        style={[
          styles.icon,
          {
            width: size,
            height: size,
            opacity: muted ? 0.72 : 1,
          },
        ]}
      />
      {muted ? <View style={[styles.slash, { width: Math.max(2, size * 0.14), height: size * 1.15 }]} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    alignSelf: 'center',
  },
  slash: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#F8FBFF',
    transform: [{ rotate: '-34deg' }],
  },
});

export default SpeakerIcon;
