import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const baseProps = {
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const GkTopicIcon = ({ color = '#FFFFFF', size = 22, strokeWidth = 1.9 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M5 7.5 8.2 10l3.8-5 4 5 3-2.5V8c0 5.2-2.5 8-7 8s-7-2.8-7-8v-.5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      {...baseProps}
    />
    <Path d="M9 18h6M10.5 15.8V18m3-2.2V18" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
  </Svg>
);

export const EnglishTopicIcon = ({ color = '#FFFFFF', size = 22, strokeWidth = 1.9 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="4" y="5" width="16" height="14" rx="3" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
    <Path d="M8 9h8M8 12h5M8 15h8" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
    <Path d="M15.5 4v3M18 4v3" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
  </Svg>
);

export const MathTopicIcon = ({ color = '#FFFFFF', size = 22, strokeWidth = 1.9 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="4" y="4.5" width="16" height="15" rx="3" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
    <Path d="M8 9h8M12 7v4M8.2 14.2h3.6M15.2 13v3.2M13.6 14.6h3.2" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
  </Svg>
);

export const ChildTopicIcon = ({ color = '#FFFFFF', size = 22, strokeWidth = 1.9 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="8" cy="8" r="2.2" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
    <Circle cx="16" cy="8" r="2.2" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
    <Circle cx="12" cy="13" r="4.2" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
    <Path d="M9.5 13.8c.6.7 1.4 1.1 2.5 1.1s1.9-.4 2.5-1.1" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
  </Svg>
);

export const CurrentAffairsTopicIcon = ({ color = '#FFFFFF', size = 22, strokeWidth = 1.9 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="3.5" y="5" width="17" height="14" rx="2.5" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
    <Rect x="6.2" y="8" width="5.2" height="4" rx="1.2" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
    <Path d="M13 8h4.6M13 11h4.6M6.2 14.3H17.6M6.2 17h7.5" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
  </Svg>
);

export const PuzzleTopicIcon = ({ color = '#FFFFFF', size = 22, strokeWidth = 1.9 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M9 5.5a1.8 1.8 0 1 1 3.6 0c0 .6-.3 1.2-.8 1.5H15a2 2 0 0 1 2 2v3.1c-.3-.3-.8-.5-1.3-.5a1.8 1.8 0 1 0 0 3.6c.5 0 1-.2 1.3-.5V18a2 2 0 0 1-2 2h-3.1c.3-.3.5-.8.5-1.3a1.8 1.8 0 1 0-3.6 0c0 .5.2 1 .5 1.3H6a2 2 0 0 1-2-2v-3.2c.4.5.9.8 1.6.8a1.8 1.8 0 0 0 0-3.6c-.7 0-1.2.3-1.6.8V9a2 2 0 0 1 2-2h3.8c-.5-.3-.8-.9-.8-1.5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      {...baseProps}
    />
  </Svg>
);

export const ScoreTopicIcon = ({ color = '#FFFFFF', size = 22, strokeWidth = 1.9 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 6 13.8 9.7l4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L6.2 10.3l4-.6L12 6Z" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
    <Path d="M5 19h14" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
  </Svg>
);

export const StoryTopicIcon = ({ color = '#FFFFFF', size = 22, strokeWidth = 1.9 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M6 6.5A3.5 3.5 0 0 1 9.5 3H19v14h-9.5A3.5 3.5 0 0 0 6 20.5V6.5Z" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
    <Path d="M9.5 7.8h6M9.5 10.8h6M9.5 13.8h4" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
    <Path d="m5.2 6.8-.7 1.6-1.6.7 1.6.7.7 1.6.7-1.6 1.6-.7-1.6-.7-.7-1.6Z" stroke={color} strokeWidth={1.5} {...baseProps} />
  </Svg>
);

export const PoemTopicIcon = ({ color = '#FFFFFF', size = 22, strokeWidth = 1.9 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M17.5 5.5c-4 .4-7 3.1-8.7 8.2-.8 2.3-2 3.8-3.8 4.8 2.8.5 5-.2 6.8-2.2 2.5-2.8 2-6.3 5.7-10.8Z" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
    <Path d="M9.8 15.2c1.6-.5 3.1-1.5 4.7-3.1" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
    <Path d="M14.8 6.2c.9.2 1.6.8 2.1 1.7" stroke={color} strokeWidth={strokeWidth} {...baseProps} />
  </Svg>
);

export default {
  GkTopicIcon,
  EnglishTopicIcon,
  MathTopicIcon,
  ChildTopicIcon,
  CurrentAffairsTopicIcon,
  PuzzleTopicIcon,
  ScoreTopicIcon,
  StoryTopicIcon,
  PoemTopicIcon,
};
