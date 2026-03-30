import React from 'react';
import Svg, { Path } from 'react-native-svg';

const HomeIcon = ({ color = '#19354A', size = 20, strokeWidth = 2, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M4 10.5L12 4L20 10.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.5 9.5V19H17.5V9.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 19V14.5H14V19"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default HomeIcon;
