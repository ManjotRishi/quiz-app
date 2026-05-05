import React from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
  SvgProps,
} from 'react-native-svg';

const ChildStoryIllustration = ({ style }: SvgProps) => (
  <Svg width="100%" height="100%" viewBox="0 0 220 180" style={style}>
    <Defs>
      <SvgLinearGradient id="storySky" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#60A5FA" />
        <Stop offset="55%" stopColor="#8B5CF6" />
        <Stop offset="100%" stopColor="#F472B6" />
      </SvgLinearGradient>
      <SvgLinearGradient id="bookCover" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFE7A3" />
        <Stop offset="100%" stopColor="#FDBA74" />
      </SvgLinearGradient>
      <SvgLinearGradient id="pageGlow" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFFDF5" />
        <Stop offset="100%" stopColor="#FDF2F8" />
      </SvgLinearGradient>
    </Defs>

    <Rect x="10" y="12" width="200" height="156" rx="30" fill="#120A25" />
    <Rect x="18" y="20" width="184" height="140" rx="26" fill="url(#storySky)" opacity="0.28" />
    <Circle cx="46" cy="52" r="18" fill="#FFFFFF" opacity="0.14" />
    <Circle cx="176" cy="46" r="22" fill="#FDE68A" opacity="0.22" />
    <Ellipse cx="110" cy="142" rx="70" ry="16" fill="#07111F" opacity="0.26" />

    <Path d="M58 130C85 110 135 108 162 129V143H58V130Z" fill="#4ADE80" opacity="0.82" />

    <Rect x="54" y="60" width="112" height="64" rx="16" fill="url(#bookCover)" />
    <Rect x="62" y="66" width="46" height="52" rx="10" fill="url(#pageGlow)" />
    <Rect x="112" y="66" width="46" height="52" rx="10" fill="url(#pageGlow)" />
    <Rect x="107" y="60" width="6" height="64" rx="3" fill="#F59E0B" />

    <Path d="M73 81H95" stroke="#A855F7" strokeWidth="4" strokeLinecap="round" />
    <Path d="M73 92H97" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
    <Path d="M73 103H90" stroke="#F472B6" strokeWidth="4" strokeLinecap="round" />

    <Path
      d="M128 103C128 93 136 86 145 86C154 86 162 93 162 103C162 116 148 121 145 126C142 121 128 116 128 103Z"
      fill="#FB7185"
    />
    <Circle cx="147" cy="102" r="4" fill="#FFF7ED" />

    <Path d="M42 94l5 10 10 5-10 5-5 10-5-10-10-5 10-5 5-10Z" fill="#FDE68A" />
    <Path d="M177 72l4 8 8 4-8 4-4 8-4-8-8-4 8-4 4-8Z" fill="#FFFFFF" opacity="0.86" />
    <Circle cx="168" cy="118" r="5" fill="#93C5FD" />
  </Svg>
);

export default ChildStoryIllustration;
