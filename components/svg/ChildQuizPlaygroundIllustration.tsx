import React from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
  SvgProps,
} from 'react-native-svg';

const ChildQuizPlaygroundIllustration = ({ style }: SvgProps) => (
  <Svg width="100%" height="100%" viewBox="0 0 360 240" style={style}>
    <Defs>
      <SvgLinearGradient id="skyGlow" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#66D9FF" />
        <Stop offset="55%" stopColor="#8B5CF6" />
        <Stop offset="100%" stopColor="#FF8BB2" />
      </SvgLinearGradient>
      <SvgLinearGradient id="grassGlow" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0%" stopColor="#7EE787" />
        <Stop offset="100%" stopColor="#FDE68A" />
      </SvgLinearGradient>
      <SvgLinearGradient id="cardFace" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFF8E7" />
        <Stop offset="100%" stopColor="#FFE1F1" />
      </SvgLinearGradient>
    </Defs>

    <Rect x="20" y="18" width="320" height="204" rx="34" fill="#120A25" />
    <Rect x="28" y="26" width="304" height="188" rx="30" fill="url(#skyGlow)" opacity="0.28" />

    <Circle cx="76" cy="68" r="34" fill="#FFFFFF" opacity="0.15" />
    <Circle cx="282" cy="70" r="44" fill="#FFF0A8" opacity="0.22" />
    <Ellipse cx="180" cy="190" rx="128" ry="24" fill="#08111F" opacity="0.28" />
    <Path d="M44 184C102 150 149 148 202 168C251 186 293 190 332 174V212H44V184Z" fill="url(#grassGlow)" />

    <G>
      <Rect x="128" y="82" width="108" height="76" rx="24" fill="url(#cardFace)" />
      <Rect x="136" y="90" width="92" height="60" rx="20" fill="#FFFFFF" opacity="0.72" />
      <Path
        d="M158 118C168 106 182 104 192 114C200 106 216 108 220 122C224 136 213 145 193 154C172 145 161 138 158 126"
        fill="#FF8BB2"
      />
      <Circle cx="152" cy="98" r="6" fill="#8B5CF6" opacity="0.3" />
      <Circle cx="214" cy="142" r="5" fill="#60A5FA" opacity="0.28" />
    </G>

    <G>
      <Ellipse cx="96" cy="145" rx="30" ry="26" fill="#F8C56E" />
      <Circle cx="96" cy="120" r="26" fill="#FFD98E" />
      <Circle cx="78" cy="100" r="10" fill="#FFD98E" />
      <Circle cx="114" cy="100" r="10" fill="#FFD98E" />
      <Circle cx="78" cy="100" r="5" fill="#F5A524" />
      <Circle cx="114" cy="100" r="5" fill="#F5A524" />
      <Circle cx="88" cy="118" r="3.5" fill="#2A1B4D" />
      <Circle cx="104" cy="118" r="3.5" fill="#2A1B4D" />
      <Ellipse cx="96" cy="129" rx="7" ry="5" fill="#F59E0B" />
      <Path d="M88 136C92 141 100 141 104 136" stroke="#2A1B4D" strokeWidth="3" strokeLinecap="round" />
      <Circle cx="73" cy="138" r="8" fill="#FFB3C7" opacity="0.45" />
      <Circle cx="119" cy="138" r="8" fill="#FFB3C7" opacity="0.45" />
    </G>

    <G>
      <Ellipse cx="270" cy="148" rx="28" ry="22" fill="#8FD3FF" />
      <Circle cx="270" cy="124" r="24" fill="#B7E5FF" />
      <Path d="M252 108L260 90L270 107Z" fill="#7C3AED" />
      <Path d="M288 108L280 90L270 107Z" fill="#7C3AED" />
      <Circle cx="261" cy="123" r="3.5" fill="#172554" />
      <Circle cx="279" cy="123" r="3.5" fill="#172554" />
      <Path d="M264 133C268 137 272 137 276 133" stroke="#172554" strokeWidth="3" strokeLinecap="round" />
      <Ellipse cx="250" cy="147" rx="7" ry="10" fill="#B7E5FF" />
      <Ellipse cx="290" cy="147" rx="7" ry="10" fill="#B7E5FF" />
      <Circle cx="245" cy="142" r="8" fill="#FFFFFF" opacity="0.24" />
    </G>

    <G>
      <Path d="M170 58l5 10 10 5-10 5-5 10-5-10-10-5 10-5 5-10Z" fill="#FFF7C2" />
      <Path d="M303 50l4 8 8 4-8 4-4 8-4-8-8-4 8-4 4-8Z" fill="#FFFFFF" opacity="0.86" />
      <Circle cx="60" cy="50" r="4" fill="#FDE68A" />
      <Circle cx="315" cy="108" r="5" fill="#C4B5FD" />
      <Circle cx="46" cy="116" r="5" fill="#F9A8D4" />
    </G>
  </Svg>
);

export default ChildQuizPlaygroundIllustration;
