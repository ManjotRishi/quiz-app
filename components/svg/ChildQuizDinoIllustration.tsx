import React from 'react';
import Svg, { Circle, Defs, Ellipse, LinearGradient as SvgLinearGradient, Path, Rect, Stop, SvgProps } from 'react-native-svg';

const ChildQuizDinoIllustration = ({ style }: SvgProps) => (
  <Svg width="100%" height="100%" viewBox="0 0 360 240" style={style}>
    <Defs>
      <SvgLinearGradient id="dinoSky" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#7DD3FC" />
        <Stop offset="55%" stopColor="#86EFAC" />
        <Stop offset="100%" stopColor="#FDE68A" />
      </SvgLinearGradient>
      <SvgLinearGradient id="dinoBody" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#34D399" />
        <Stop offset="100%" stopColor="#10B981" />
      </SvgLinearGradient>
    </Defs>

    <Rect x="20" y="18" width="320" height="204" rx="34" fill="#10203A" />
    <Rect x="28" y="26" width="304" height="188" rx="30" fill="url(#dinoSky)" opacity="0.22" />
    <Circle cx="72" cy="66" r="28" fill="#FFFFFF" opacity="0.12" />
    <Circle cx="286" cy="70" r="40" fill="#FDE68A" opacity="0.22" />
    <Ellipse cx="180" cy="188" rx="130" ry="24" fill="#06111F" opacity="0.3" />

    <Path d="M48 182C98 152 150 150 198 168C245 185 296 190 330 176V212H48V182Z" fill="#86EFAC" opacity="0.9" />

    <Path
      d="M106 153C101 128 113 100 142 88C171 76 206 83 226 103C245 121 247 147 236 165C226 181 207 192 185 193C161 194 125 184 106 153Z"
      fill="url(#dinoBody)"
    />
    <Path
      d="M148 88C145 75 150 61 164 55C178 49 194 54 201 66C208 78 206 92 197 101"
      fill="#34D399"
      opacity="0.7"
    />
    <Path
      d="M132 104L123 87L140 94L148 78L156 94L173 88L165 104L173 121L156 114L148 130L140 114L123 121Z"
      fill="#FDE68A"
      opacity="0.92"
    />
    <Circle cx="173" cy="120" r="25" fill="#CFFAFE" />
    <Circle cx="163" cy="115" r="4.5" fill="#0F172A" />
    <Circle cx="183" cy="115" r="4.5" fill="#0F172A" />
    <Path d="M166 127C171 132 177 132 182 127" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
    <Circle cx="149" cy="127" r="6" fill="#FB7185" opacity="0.4" />
    <Circle cx="194" cy="127" r="6" fill="#FB7185" opacity="0.4" />

    <Path d="M128 166C116 166 111 178 114 186C117 195 128 198 135 191L141 184" fill="#34D399" />
    <Path d="M208 166C220 166 225 178 222 186C219 195 208 198 201 191L195 184" fill="#34D399" />
    <Path d="M140 193C136 205 128 212 118 212" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
    <Path d="M196 193C200 205 208 212 218 212" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
    <Path d="M129 146C139 133 151 128 164 128" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
    <Path d="M213 146C203 133 191 128 178 128" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
  </Svg>
);

export default ChildQuizDinoIllustration;
