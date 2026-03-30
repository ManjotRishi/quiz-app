import React from 'react';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Path, Rect, Stop, Text as SvgText, SvgProps } from 'react-native-svg';

const EmptyQuizIllustration = ({ style }: SvgProps) => (
  <Svg width="100%" height="100%" viewBox="0 0 320 260" style={style}>
    <Defs>
      <SvgLinearGradient id="emptyBg" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#2B115A" />
        <Stop offset="52%" stopColor="#1A0B33" />
        <Stop offset="100%" stopColor="#090612" />
      </SvgLinearGradient>
      <SvgLinearGradient id="emptyGlow" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.95" />
        <Stop offset="100%" stopColor="#60A5FA" stopOpacity="0.12" />
      </SvgLinearGradient>
      <SvgLinearGradient id="bookWarm" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFD8A8" stopOpacity="0.92" />
        <Stop offset="100%" stopColor="#C98C56" stopOpacity="0.78" />
      </SvgLinearGradient>
    </Defs>

    <Rect x="32" y="28" width="256" height="180" rx="36" fill="url(#emptyBg)" />
    <Circle cx="162" cy="96" r="70" fill="url(#emptyGlow)" opacity="0.35" />
    <Circle cx="162" cy="96" r="92" fill="#8B5CF6" opacity="0.05" />

    <Path
      d="M78 126C110 104 130 98 160 98C190 98 214 108 244 126"
      stroke="#FFFFFF"
      strokeOpacity="0.18"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="3 10"
    />

    <Path
      d="M104 152C116 138 130 132 148 132H172C190 132 204 138 216 152L228 176H92L104 152Z"
      fill="url(#bookWarm)"
      opacity="0.88"
    />
    <Path d="M111 150H209L219 170H101L111 150Z" fill="#FFF3E0" opacity="0.16" />
    <Path d="M142 120H178L186 132H134L142 120Z" fill="#FFFFFF" opacity="0.12" />

    <Circle cx="84" cy="72" r="8" fill="#F472B6" opacity="0.9" />
    <Circle cx="96" cy="58" r="4" fill="#FF9BE6" opacity="0.85" />
    <Circle cx="240" cy="62" r="5" fill="#60A5FA" opacity="0.9" />
    <Circle cx="230" cy="84" r="3" fill="#FFFFFF" opacity="0.8" />
    <Circle cx="62" cy="176" r="3.5" fill="#F59E0B" opacity="0.85" />
    <Circle cx="258" cy="174" r="4" fill="#C084FC" opacity="0.78" />

    <Path d="M48 54l5 11 11 5-11 5-5 11-5-11-11-5 11-5 5-11Z" fill="#FFFFFF" opacity="0.9" />
    <Path d="M256 30l4 8 8 4-8 4-4 8-4-8-8-4 8-4 4-8Z" fill="#8B5CF6" opacity="0.95" />

    <SvgText
      x="190"
      y="96"
      fill="#FFF2D8"
      fontSize="52"
      fontWeight="800"
      fontStyle="italic"
      textAnchor="middle"
    >
      ?
    </SvgText>
  </Svg>
);

export default EmptyQuizIllustration;
