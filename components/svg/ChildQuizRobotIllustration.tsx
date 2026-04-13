import React from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient as SvgLinearGradient, Path, Rect, Stop, SvgProps } from 'react-native-svg';

const ChildQuizRobotIllustration = ({ style }: SvgProps) => (
  <Svg width="100%" height="100%" viewBox="0 0 360 240" style={style}>
    <Defs>
      <SvgLinearGradient id="robotSky" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#60A5FA" />
        <Stop offset="50%" stopColor="#22C55E" />
        <Stop offset="100%" stopColor="#F59E0B" />
      </SvgLinearGradient>
      <SvgLinearGradient id="robotBody" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#E2E8F0" />
        <Stop offset="100%" stopColor="#94A3B8" />
      </SvgLinearGradient>
    </Defs>

    <Rect x="20" y="18" width="320" height="204" rx="34" fill="#0F172A" />
    <Rect x="28" y="26" width="304" height="188" rx="30" fill="url(#robotSky)" opacity="0.22" />
    <Circle cx="70" cy="68" r="28" fill="#FFFFFF" opacity="0.1" />
    <Circle cx="282" cy="70" r="40" fill="#FDE68A" opacity="0.18" />
    <Ellipse cx="180" cy="190" rx="128" ry="24" fill="#07111B" opacity="0.3" />
    <Path d="M48 182C96 154 146 150 196 166C244 182 294 190 332 176V212H48V182Z" fill="#93C5FD" opacity="0.82" />

    <Rect x="126" y="76" width="108" height="88" rx="24" fill="url(#robotBody)" />
    <Rect x="138" y="88" width="84" height="26" rx="13" fill="#0F172A" opacity="0.9" />
    <Circle cx="160" cy="101" r="6" fill="#38BDF8" />
    <Circle cx="200" cy="101" r="6" fill="#38BDF8" />
    <Path d="M156 120C166 113 174 111 180 111C186 111 194 113 204 120" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
    <Ellipse cx="180" cy="134" rx="10" ry="8" fill="#F97316" />
    <Circle cx="150" cy="130" r="6" fill="#A78BFA" />
    <Circle cx="210" cy="130" r="6" fill="#A78BFA" />

    <Path d="M135 90L116 74" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
    <Circle cx="112" cy="70" r="8" fill="#FDE047" />
    <Path d="M225 90L244 74" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
    <Circle cx="248" cy="70" r="8" fill="#FDE047" />
    <Path d="M156 170V196" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" />
    <Path d="M204 170V196" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" />
    <Circle cx="156" cy="200" r="8" fill="#0F172A" />
    <Circle cx="204" cy="200" r="8" fill="#0F172A" />

    <Path d="M144 64C150 50 160 44 170 44" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
    <Path d="M216 64C210 50 200 44 190 44" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
    <Circle cx="180" cy="42" r="7" fill="#F9A8D4" />
  </Svg>
);

export default ChildQuizRobotIllustration;
