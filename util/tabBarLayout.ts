import { isCompactScreen, radiusScale, spaceScale } from '../style/responsive';

type TabBarMetrics = {
  barHeight: number;
  barRadius: number;
  bottomOffset: number;
  contentBottomInset: number;
  fabBottomOffset: number;
  horizontalInset: number;
  iconBoxSize: number;
  iconSize: number;
  labelFontSize: number;
  tabGap: number;
  verticalPadding: number;
};

export const getMainTabBarMetrics = (width: number, bottomInset: number): TabBarMetrics => {
  const compact = width < 370 || isCompactScreen;
  const spacious = width >= 430;
  const horizontalInset = spacious ? spaceScale(16) : compact ? spaceScale(8) : spaceScale(10);
  const bottomOffset = Math.max(0, bottomInset);
  const barHeight = compact ? spaceScale(74) : spacious ? spaceScale(88) : spaceScale(82);
  const verticalPadding = compact ? spaceScale(8) : spaceScale(10);
  const contentBottomInset = bottomOffset + barHeight + spaceScale(66);
  const fabBottomOffset = bottomOffset + barHeight + spaceScale(14);

  return {
    barHeight,
    barRadius: radiusScale(compact ? 22 : 26),
    bottomOffset,
    contentBottomInset,
    fabBottomOffset,
    horizontalInset,
    iconBoxSize: compact ? spaceScale(32) : spaceScale(36),
    iconSize: compact ? 18 : 20,
    labelFontSize: compact ? 9 : 10,
    tabGap: compact ? spaceScale(4) : spaceScale(6),
    verticalPadding,
  };
};
