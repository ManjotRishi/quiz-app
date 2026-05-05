import React from 'react';
import Svg, { Path } from 'react-native-svg';

type PostCardWavesProps = {
  color?: string;
  height?: number;
  width?: number;
};

const PostCardWaves = ({
  color = 'rgba(128, 90, 213, 0.28)',
  height = 180,
  width = 210,
}: PostCardWavesProps) => (
  <Svg width={width} height={height} viewBox="0 0 210 180">
    {[0, 1, 2, 3, 4, 5, 6].map((index) => (
      <Path
        key={`wave-${index}`}
        d={`M18 ${18 + index * 14}c22-8 39-7 52 5 13 11 29 15 49 11 17-3 31 2 41 15 9 12 24 19 45 18`}
        fill="none"
        opacity={0.95 - index * 0.1}
        stroke={color}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
    ))}
  </Svg>
);

export default PostCardWaves;
