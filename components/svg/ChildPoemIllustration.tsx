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

const ChildPoemIllustration = ({ style }: SvgProps) => (
  <Svg width="100%" height="100%" viewBox="0 0 220 180" style={style}>
    <Defs>
      <SvgLinearGradient id="poemSky" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#22D3EE" />
        <Stop offset="55%" stopColor="#38BDF8" />
        <Stop offset="100%" stopColor="#A78BFA" />
      </SvgLinearGradient>
      <SvgLinearGradient id="sheetGlow" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFFDFB" />
        <Stop offset="100%" stopColor="#E0F2FE" />
      </SvgLinearGradient>
      <SvgLinearGradient id="featherGlow" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#F472B6" />
        <Stop offset="100%" stopColor="#A855F7" />
      </SvgLinearGradient>
    </Defs>

    <Rect x="10" y="12" width="200" height="156" rx="30" fill="#09162B" />
    <Rect x="18" y="20" width="184" height="140" rx="26" fill="url(#poemSky)" opacity="0.28" />
    <Circle cx="52" cy="48" r="18" fill="#FFFFFF" opacity="0.16" />
    <Circle cx="174" cy="50" r="16" fill="#FDE68A" opacity="0.18" />
    <Ellipse cx="110" cy="142" rx="72" ry="16" fill="#08111F" opacity="0.26" />

    <Rect x="58" y="48" width="98" height="82" rx="18" fill="url(#sheetGlow)" />
    <Rect x="67" y="60" width="56" height="4" rx="2" fill="#38BDF8" opacity="0.72" />
    <Rect x="67" y="72" width="74" height="4" rx="2" fill="#A855F7" opacity="0.72" />
    <Rect x="67" y="84" width="60" height="4" rx="2" fill="#F472B6" opacity="0.72" />
    <Rect x="67" y="96" width="70" height="4" rx="2" fill="#0EA5E9" opacity="0.72" />
    <Rect x="67" y="108" width="52" height="4" rx="2" fill="#8B5CF6" opacity="0.72" />

    <Path
      d="M152 113C136 110 128 96 132 82C137 65 153 55 172 53C173 72 169 88 164 99C161 106 157 111 152 113Z"
      fill="url(#featherGlow)"
    />
    <Path
      d="M142 104C149 95 156 84 160 69"
      stroke="#FDF2F8"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <Path
      d="M146 95C151 94 156 92 160 88"
      stroke="#FCE7F3"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Path
      d="M140 107C147 106 154 103 160 98"
      stroke="#FCE7F3"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    <Path d="M49 121c8-10 15-14 24-15 10-1 17 3 26 12" stroke="#FDE68A" strokeWidth="5" strokeLinecap="round" />
    <Circle cx="47" cy="121" r="5" fill="#FDE68A" />
    <Circle cx="102" cy="118" r="5" fill="#93C5FD" />
    <Path d="M173 72l4 8 8 4-8 4-4 8-4-8-8-4 8-4 4-8Z" fill="#FFFFFF" opacity="0.85" />
  </Svg>
);

export default ChildPoemIllustration;
