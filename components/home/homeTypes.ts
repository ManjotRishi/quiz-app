import React from 'react';
import { ImageSourcePropType } from 'react-native';
import { RouteName } from '../../navigation/routes';

export type HomeQuickGridMetrics = {
  contentPadding: number;
  quickGap: number;
  quickCardWidth: number;
  quickCardPaddingHorizontal: number;
  quickCardPaddingVertical: number;
  quickCardMinHeight: number;
  quickIconShellSize: number;
  quickIconSize: number;
  quickEyebrowFontSize: number;
  quickTitleFontSize: number;
  quickTitleLineHeight: number;
  quickMetaFontSize: number;
  quickMetaLineHeight: number;
};

export type SpotlightPost = {
  id: string;
  authorName: string;
  title: string;
  body: string;
  likeCount: number;
  createdAtMs: number;
  createdAtLabel: string;
};

export type TopicSummaryItem = {
  key: string;
  title: string;
  attempted: number;
  accuracy: number;
  totalQuestions: number;
  accent: string;
};

type IconComponent = React.ComponentType<{
  color?: string;
  size?: number;
}>;

export type HomeQuickAction = {
  key: string;
  title: string;
  subtitle: string;
  accent: string;
  colors: string[];
  image?: ImageSourcePropType;
  glow: string;
  route: RouteName;
  Icon: IconComponent;
};

export type HomeTopicItem = {
  key: string;
  label: string;
  meta: string;
  kicker: string;
  accent: string;
  colors: string[];
  image?: ImageSourcePropType;
  route: RouteName;
  Icon: IconComponent;
};

export type ProgressCardItem = {
  label: string;
  value: number;
};
