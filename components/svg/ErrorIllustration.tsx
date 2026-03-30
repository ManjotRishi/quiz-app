import React from 'react';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Path, Stop, SvgProps } from 'react-native-svg';

const ErrorIllustration = ({ style }: SvgProps) => (
  <Svg width="100%" height="100%" viewBox="0 0 360 240" style={style}>
    <Defs>
      <SvgLinearGradient id="errorGlow" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFB84D" stopOpacity="0.95" />
        <Stop offset="100%" stopColor="#FF5C5C" stopOpacity="0.14" />
      </SvgLinearGradient>
      <SvgLinearGradient id="errorShield" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#F4F7FF" />
        <Stop offset="100%" stopColor="#A7B4FF" />
      </SvgLinearGradient>
    </Defs>

    <Circle cx="180" cy="120" r="92" fill="url(#errorGlow)" opacity="0.35" />
    <Path
      d="M180 42L262 72V122C262 173 230 204 180 218C130 204 98 173 98 122V72L180 42Z"
      fill="#0E132A"
      stroke="rgba(255,255,255,0.12)"
      strokeWidth="2"
    />
    <Path
      d="M180 72L242 95V123C242 161 219 186 180 197C141 186 118 161 118 123V95L180 72Z"
      fill="url(#errorShield)"
      opacity="0.96"
    />
    <Path d="M180 108V144" stroke="#0E132A" strokeWidth="10" strokeLinecap="round" />
    <Circle cx="180" cy="165" r="7" fill="#0E132A" />
  </Svg>
);

export default ErrorIllustration;
