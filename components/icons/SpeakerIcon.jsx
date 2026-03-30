import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

const SpeakerIcon = ({ muted = false, color = '#19354A', size = 20 }) => {
  if (muted) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="13" r="6.2" stroke={color} strokeWidth={1.8} />
        <Path d="M7.2 5.8L5 3.8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M16.8 5.8L19 3.8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M4.8 8.8L7.3 8.3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M19.2 8.8L16.7 8.3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M11.9 13V9.9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M11.9 13L14.4 14.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path
          d="M8 17.2L5.4 20.3"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M16 17.2L18.6 20.3"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Line x1="4" y1="4" x2="20" y2="20" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="13" r="6.2" stroke={color} strokeWidth={1.8} />
      <Path d="M7.2 5.8L5 3.8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M16.8 5.8L19 3.8" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M4.8 8.8L7.3 8.3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M19.2 8.8L16.7 8.3" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M11.9 13V9.9" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path
        d="M11.9 13L14.4 14.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 17.2L5.4 20.3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 17.2L18.6 20.3"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default SpeakerIcon;
