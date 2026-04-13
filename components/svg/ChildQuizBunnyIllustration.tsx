import React from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient as SvgLinearGradient, Path, Rect, Stop, SvgProps } from 'react-native-svg';

const ChildQuizBunnyIllustration = ({ style }: SvgProps) => (
  <Svg width="100%" height="100%" viewBox="0 0 360 240" style={style}>
    <Defs>
      <SvgLinearGradient id="bunnySky" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#F9A8D4" />
        <Stop offset="45%" stopColor="#C4B5FD" />
        <Stop offset="100%" stopColor="#93C5FD" />
      </SvgLinearGradient>
      <SvgLinearGradient id="bunnyBody" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFF7ED" />
        <Stop offset="100%" stopColor="#FBCFE8" />
      </SvgLinearGradient>
    </Defs>

    <Rect x="20" y="18" width="320" height="204" rx="34" fill="#2A123F" />
    <Rect x="28" y="26" width="304" height="188" rx="30" fill="url(#bunnySky)" opacity="0.24" />
    <Circle cx="74" cy="68" r="30" fill="#FFFFFF" opacity="0.12" />
    <Circle cx="282" cy="70" r="42" fill="#FFF0A8" opacity="0.2" />
    <Ellipse cx="180" cy="189" rx="130" ry="24" fill="#08111F" opacity="0.28" />
    <Path d="M46 182C98 154 148 148 198 164C248 180 296 190 334 176V212H46V182Z" fill="#FBCFE8" opacity="0.92" />

    <Ellipse cx="180" cy="140" rx="50" ry="54" fill="url(#bunnyBody)" />
    <Ellipse cx="162" cy="78" rx="16" ry="40" fill="#FFF7ED" />
    <Ellipse cx="198" cy="78" rx="16" ry="40" fill="#FFF7ED" />
    <Ellipse cx="162" cy="78" rx="8" ry="28" fill="#F9A8D4" opacity="0.72" />
    <Ellipse cx="198" cy="78" rx="8" ry="28" fill="#F9A8D4" opacity="0.72" />

    <Circle cx="170" cy="132" r="4.5" fill="#172554" />
    <Circle cx="190" cy="132" r="4.5" fill="#172554" />
    <Path d="M174 143C178 148 182 148 186 143" stroke="#172554" strokeWidth="3" strokeLinecap="round" />
    <Ellipse cx="180" cy="137" rx="7" ry="5" fill="#FB7185" opacity="0.78" />
    <Circle cx="155" cy="145" r="7" fill="#FDA4AF" opacity="0.45" />
    <Circle cx="205" cy="145" r="7" fill="#FDA4AF" opacity="0.45" />

    <Path d="M154 167C150 186 142 197 130 204" stroke="#172554" strokeWidth="4" strokeLinecap="round" />
    <Path d="M206 167C210 186 218 197 230 204" stroke="#172554" strokeWidth="4" strokeLinecap="round" />
    <Path d="M145 174C132 176 125 185 120 194" stroke="#172554" strokeWidth="4" strokeLinecap="round" opacity="0.65" />
    <Path d="M215 174C228 176 235 185 240 194" stroke="#172554" strokeWidth="4" strokeLinecap="round" opacity="0.65" />

    <Path d="M164 198C170 190 176 187 180 187C184 187 190 190 196 198" stroke="#172554" strokeWidth="4" strokeLinecap="round" />
    <Path d="M177 156C180 159 183 159 186 156" stroke="#172554" strokeWidth="3" strokeLinecap="round" />
  </Svg>
);

export default ChildQuizBunnyIllustration;
