import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const CurrentAffairsIcon = ({ color = '#19354A', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="2"
      y="3"
      width="20"
      height="18"
      rx="2"
      stroke={color}
      strokeWidth="1.5"
    />
    <Rect x="5" y="7" width="8" height="3" rx="1" fill={color} />
    <Path d="M5 12H19" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <Path d="M5 15H14" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <Path d="M5 17H12" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </Svg>
);

export default CurrentAffairsIcon;
