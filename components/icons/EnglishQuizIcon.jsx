import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const EnglishQuizIcon = ({ color = '#F4F7FF', size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="4"
      width="18"
      height="16"
      rx="3"
      stroke={color}
      strokeWidth="1.5"
    />
    <Path
      d="M7 8H14"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <Path
      d="M7 12H12.5"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <Path
      d="M7 16H15"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <Path
      d="M16.5 9.5L18.5 11.5L16.5 13.5"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default EnglishQuizIcon;
