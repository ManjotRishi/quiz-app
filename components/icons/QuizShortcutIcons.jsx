import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export const CurrentAffairsShortcutIcon = ({ size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="5" fill="#3182CE" />
    <Rect x="5.4" y="6" width="10.8" height="12.4" rx="1.9" fill="#FEFEFF" />
    <Path d="M16 7.8h1.6a1.6 1.6 0 0 1 1.6 1.6v7.2a1.6 1.6 0 0 1-1.6 1.6H16" fill="#D8DCE7" />
    <Path d="M7.4 8.3h6.8M7.4 10.3h5.4" stroke="#18214F" strokeWidth="1.2" strokeLinecap="round" />
    <Circle cx="9.4" cy="13.5" r="2.2" fill="#3B82F6" />
    <Path
      d="M9.4 11.6c1 .1 1.7.5 2.2 1.3.4.6.5 1.4.3 2.1-.8.7-1.6 1.1-2.5 1.1-.8 0-1.5-.2-2.2-.8a3.1 3.1 0 0 1 2.2-3.7Z"
      fill="#EAF6FF"
    />
    <Path d="M13.1 13h3.1M13.1 15.1h3.1M7.2 17.1h8.7" stroke="#A0A8BA" strokeWidth="1" strokeLinecap="round" />
    <Rect x="5.4" y="6" width="10.8" height="12.4" rx="1.9" stroke="#1D2A5B" strokeWidth="0.8" />
  </Svg>
);

export const GkShortcutIcon = ({ size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="#23B37C" />
    <Path d="M5.2 16.8 6.1 11c.1-.7.7-1.1 1.3-1.1H16.6c.7 0 1.2.5 1.3 1.1l.9 5.8" fill="#F5E7BF" />
    <Path d="M6.4 16.3c2-.6 3.9-.9 5.6-.9 1.8 0 3.7.3 5.6.9" stroke="#D2B073" strokeWidth="1" strokeLinecap="round" />
    <Path d="M12 10.1v7.3" stroke="#B28A52" strokeWidth="0.8" strokeLinecap="round" />
    <Circle cx="12.2" cy="7.2" r="3.3" fill="#3A8DED" />
    <Path d="M10.2 5.5c.8-.6 1.8-.9 3-.8M9.5 7.6c.2 1.5 1.2 2.5 2.6 3.2M12.4 4.2c-.2.8.1 1.6.7 2.2.5.5 1.1.8 1.8 1" stroke="#A7E26E" strokeWidth="0.9" strokeLinecap="round" />
    <Path d="M17.9 6.4v2.5M16.7 7.6h2.5" stroke="#FDBA16" strokeWidth="1.2" strokeLinecap="round" />
    <Path d="M7.2 8.4h1.5v1.8H7.2z" fill="#F4EFE3" />
    <Path d="M6.9 8.1h2.1" stroke="#DDD3B4" strokeWidth="0.8" strokeLinecap="round" />
    <Path d="M5.2 16.8 6.1 11c.1-.7.7-1.1 1.3-1.1H16.6c.7 0 1.2.5 1.3 1.1l.9 5.8" stroke="#20315E" strokeWidth="1" strokeLinejoin="round" />
  </Svg>
);

export const PuzzleShortcutIcon = ({ size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="#7C3AED" />
    <Path d="M5.3 5.6h6.1v4.8a1.7 1.7 0 1 1-2.2 2.2H5.3V5.6Z" fill="#FFC533" />
    <Path d="M11.4 5.6h7.2v7h-3.2a1.7 1.7 0 1 1-4-1.5V5.6Z" fill="#3493EA" />
    <Path d="M5.3 12.6h4a1.7 1.7 0 1 1 2.1 2.1v3.7H5.3v-5.8Z" fill="#58BE56" />
    <Path d="M11.4 14.5a1.7 1.7 0 1 0 2.2-2.1v6h5v-5.8h-3.2a1.7 1.7 0 1 1-4 1.9Z" fill="#FF4F8A" />
    <Circle cx="17.8" cy="18.1" r="3.2" fill="#FFF7E8" />
    <Path d="M17.3 17.1c0-.7.4-1.1 1.1-1.1.6 0 1 .4 1 .9 0 .4-.2.7-.6 1l-.3.2c-.3.2-.4.4-.4.8M18.1 20.2h.1" stroke="#18214F" strokeWidth="1.1" strokeLinecap="round" />
    <Path d="M5.3 5.6h13.3v12.8H5.3z" stroke="#1D2559" strokeWidth="0.8" />
    <Path d="M11.4 5.6v12.8M5.3 12.6h13.3" stroke="#1D2559" strokeWidth="0.8" />
  </Svg>
);

export const EnglishShortcutIcon = ({ size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="#EC4899" />
    <Rect x="5.1" y="5.5" width="13.8" height="13" rx="2.4" fill="#FFF7FD" />
    <Path d="M7.6 8.2h5.7M7.6 10.8h4.4M7.6 13.4h6.9" stroke="#243162" strokeWidth="1.1" strokeLinecap="round" />
    <Path d="m14.5 9.1 1.2 1.2 1.6-1.8" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14.2 13.7h2.8M15.6 12.3v2.8" stroke="#F59E0B" strokeWidth="1.1" strokeLinecap="round" />
    <Rect x="5.1" y="5.5" width="13.8" height="13" rx="2.4" stroke="#243162" strokeWidth="0.8" />
  </Svg>
);

export const MathShortcutIcon = ({ size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="#14B8A6" />
    <Rect x="5.2" y="5.3" width="13.6" height="13.4" rx="2.2" fill="#F8FFFE" />
    <Path d="M8 9.1h7.8M11.9 7.1v4M8.2 14.4h3.8M14.4 13v3M12.9 14.5h3" stroke="#163042" strokeWidth="1.2" strokeLinecap="round" />
    <Rect x="5.2" y="5.3" width="13.6" height="13.4" rx="2.2" stroke="#163042" strokeWidth="0.8" />
  </Svg>
);
