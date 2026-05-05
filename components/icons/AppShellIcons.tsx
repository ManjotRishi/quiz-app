import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

const iconProps = {
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const TabHomeIcon = ({ color = '#FFFFFF', size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M4.5 10.5 12 4l7.5 6.5" stroke={color} strokeWidth={1.8} {...iconProps} />
    <Path d="M7.5 9.8V19h9V9.8" stroke={color} strokeWidth={1.8} {...iconProps} />
    <Path d="M10 19v-4.2h4V19" stroke={color} strokeWidth={1.8} {...iconProps} />
  </Svg>
);

export const TabTestsIcon = ({ color = '#FFFFFF', size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="4.5" y="4.5" width="15" height="15" rx="3.5" stroke={color} strokeWidth={1.8} {...iconProps} />
    <Path d="M8 9.2h8M8 12.2h5.5M8 15.2h8" stroke={color} strokeWidth={1.8} {...iconProps} />
  </Svg>
);

export const TabBookmarkIcon = ({ color = '#FFFFFF', size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v13l-6.5-3.6L5.5 19V6A1.5 1.5 0 0 1 7 4.5Z" stroke={color} strokeWidth={1.8} {...iconProps} />
  </Svg>
);

export const TabPostsIcon = ({ color = '#FFFFFF', size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="4.5" y="5" width="15" height="14" rx="4" stroke={color} strokeWidth={1.8} {...iconProps} />
    <Path d="M8 10h8M8 14h5.3" stroke={color} strokeWidth={1.8} {...iconProps} />
    <Circle cx="17.3" cy="16.8" r="2.2" stroke={color} strokeWidth={1.8} {...iconProps} />
  </Svg>
);

export const BookmarkOutlineIcon = ({
  color = '#FFFFFF',
  size = 18,
  filled = false,
}: IconProps & { filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v13l-6.5-3.6L5.5 19V6A1.5 1.5 0 0 1 7 4.5Z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const TabProfileIcon = ({ color = '#FFFFFF', size = 22 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="8.2" r="3.2" stroke={color} strokeWidth={1.8} {...iconProps} />
    <Path d="M5.5 18c1.4-2.8 3.6-4.2 6.5-4.2s5.1 1.4 6.5 4.2" stroke={color} strokeWidth={1.8} {...iconProps} />
  </Svg>
);

export const BellOutlineIcon = ({ color = '#FFFFFF', size = 18 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M7.5 9.2a4.5 4.5 0 1 1 9 0c0 4.2 1.7 5 2.2 5.8H5.3c.5-.8 2.2-1.6 2.2-5.8Z" stroke={color} strokeWidth={1.8} {...iconProps} />
    <Path d="M10 18.2c.5.9 1.1 1.3 2 1.3s1.5-.4 2-1.3" stroke={color} strokeWidth={1.8} {...iconProps} />
  </Svg>
);

export const BrainOutlineIcon = ({ color = '#FFFFFF', size = 18 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M9.2 6.2A2.9 2.9 0 0 1 12 4.5a3 3 0 0 1 2.8 1.8 2.7 2.7 0 0 1 3.3 3.3 3.1 3.1 0 0 1 1.4 2.6 3.1 3.1 0 0 1-2.8 3.1 3 3 0 0 1-2.9 2.4H10a3 3 0 0 1-2.9-2.4 3.1 3.1 0 0 1-2.8-3.1 3.1 3.1 0 0 1 1.4-2.6A2.7 2.7 0 0 1 9.2 6.2Z" stroke={color} strokeWidth={1.8} {...iconProps} />
    <Path d="M12 7.2v9.4M9.1 9.1c1 .2 1.7.8 1.9 1.8M14.9 9.1c-1 .2-1.7.8-1.9 1.8M8.8 13.5c1 .1 1.8.7 2.2 1.6M15.2 13.5c-1 .1-1.8.7-2.2 1.6" stroke={color} strokeWidth={1.8} {...iconProps} />
  </Svg>
);

export const TrophyOutlineIcon = ({ color = '#FFFFFF', size = 18 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M8 5.5h8v3.2A4 4 0 0 1 12 12.7 4 4 0 0 1 8 8.7V5.5Z" stroke={color} strokeWidth={1.8} {...iconProps} />
    <Path d="M8 7H5.7a1.2 1.2 0 0 0-1.2 1.2A3.8 3.8 0 0 0 8 12M16 7h2.3a1.2 1.2 0 0 1 1.2 1.2A3.8 3.8 0 0 1 16 12" stroke={color} strokeWidth={1.8} {...iconProps} />
    <Path d="M12 12.7v3.1M9 19h6" stroke={color} strokeWidth={1.8} {...iconProps} />
  </Svg>
);

export const DownloadOutlineIcon = ({ color = '#FFFFFF', size = 18 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 4.8v9.4" stroke={color} strokeWidth={1.8} {...iconProps} />
    <Path d="m8.6 11.1 3.4 3.5 3.4-3.5" stroke={color} strokeWidth={1.8} {...iconProps} />
    <Path d="M5.5 18.5h13" stroke={color} strokeWidth={1.8} {...iconProps} />
  </Svg>
);

export const PlusIcon = ({ color = '#FFFFFF', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 5.5v13M5.5 12h13" stroke={color} strokeWidth={2} {...iconProps} />
  </Svg>
);

export const CloseIcon = ({ color = '#FFFFFF', size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="m6.5 6.5 11 11M17.5 6.5l-11 11" stroke={color} strokeWidth={2} {...iconProps} />
  </Svg>
);

export const TrashIcon = ({ color = '#FFFFFF', size = 18 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5.5 7.5h13" stroke={color} strokeWidth={1.8} {...iconProps} />
    <Path d="M9 7.5V5.7a1.2 1.2 0 0 1 1.2-1.2h3.6A1.2 1.2 0 0 1 15 5.7v1.8" stroke={color} strokeWidth={1.8} {...iconProps} />
    <Path d="M7.2 7.5 8 18a1.7 1.7 0 0 0 1.7 1.5h4.6A1.7 1.7 0 0 0 16 18l.8-10.5" stroke={color} strokeWidth={1.8} {...iconProps} />
    <Path d="M10.2 10.4v5.6M13.8 10.4v5.6" stroke={color} strokeWidth={1.8} {...iconProps} />
  </Svg>
);

export const PostLikeIcon = ({ color = '#FFFFFF', size = 18, filled = false }: IconProps & { filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="m12 20-1.4-1.2C6.2 15 3.5 12.6 3.5 9.2A4.7 4.7 0 0 1 8.2 4.5c1.6 0 3 .7 3.8 1.9a5 5 0 0 1 3.8-1.9 4.7 4.7 0 0 1 4.7 4.7c0 3.4-2.7 5.8-7.1 9.6L12 20Z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PostDislikeIcon = ({ color = '#FFFFFF', size = 18, filled = false }: IconProps & { filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="m13.9 13.8-2.3 4.3c-.4.7-.4 1.5 0 2.2.3.7 1 1.2 1.8 1.2l.9-4.8h3.1c1 0 1.8-.8 1.8-1.8V7.4c0-1-.8-1.8-1.8-1.8H9.6c-.8 0-1.6.5-1.8 1.4L6.4 12a1.9 1.9 0 0 0 1.9 2.4h5.6Z"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M16.6 14.9V5.6" stroke={filled ? '#FFFFFF' : color} strokeWidth={1.8} {...iconProps} />
  </Svg>
);

export const VerifiedBadgeIcon = ({ color = '#A855F7', size = 18 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="m12 2.8 2.3 1.7 2.8-.3 1.3 2.5 2.4 1.4-.4 2.8 1.6 2.3-1.6 2.3.4 2.8-2.4 1.4-1.3 2.5-2.8-.3L12 21.2l-2.3 1.7-2.8-.3-1.3-2.5-2.4-1.4.4-2.8L2 13.6l1.6-2.3-.4-2.8 2.4-1.4 1.3-2.5 2.8.3L12 2.8Z"
      fill={color}
    />
    <Path d="m8.9 12.2 2 2 4.2-4.7" stroke="#16091F" strokeWidth={2} {...iconProps} />
  </Svg>
);

export const GlobeIcon = ({ color = '#A1A1C2', size = 16 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="8.7" stroke={color} strokeWidth={1.7} {...iconProps} />
    <Path d="M3.9 12h16.2M12 3.4c2.2 2.3 3.4 5.3 3.4 8.6 0 3.2-1.2 6.3-3.4 8.6M12 3.4C9.8 5.7 8.6 8.8 8.6 12c0 3.3 1.2 6.3 3.4 8.6" stroke={color} strokeWidth={1.7} {...iconProps} />
  </Svg>
);

export const CurvedArrowDownIcon = ({ color = '#3B82F6', size = 16 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 4.8v8.8" stroke={color} strokeWidth={2.2} {...iconProps} />
    <Path d="m6.8 12.2 5.2 5.2 5.2-5.2" stroke={color} strokeWidth={2.4} {...iconProps} />
  </Svg>
);

export const CurvedArrowUpIcon = ({ color = '#3B82F6', size = 16 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 19.2v-8.8" stroke={color} strokeWidth={2.2} {...iconProps} />
    <Path d="m6.8 11.8 5.2-5.2 5.2 5.2" stroke={color} strokeWidth={2.4} {...iconProps} />
  </Svg>
);
