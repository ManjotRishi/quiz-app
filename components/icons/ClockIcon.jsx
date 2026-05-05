import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

const ClockIcon = ({ color = '#F4F7FF', size = 20, muted = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="8.2" stroke={color} strokeWidth={1.8} opacity={muted ? 0.6 : 1} />
    <Path d="M12 8.6v4.2l3 1.8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" opacity={muted ? 0.6 : 1} />
  </Svg>
);

export default ClockIcon;
