import React from 'react';
import Svg, { Path } from 'react-native-svg';

const BackIcon = ({ color = '#FFFFFF', size = 18, strokeWidth = 2, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M12 5V19"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M6 13L12 19L18 13"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default BackIcon;
