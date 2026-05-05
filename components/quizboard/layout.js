import { fontScale, radiusScale, spaceScale, verticalScale } from '../../style/responsive';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const getQuizBoardLayout = (width = 375, height = 812) => {
  const safeWidth = Math.max(320, Number(width) || 375);
  const safeHeight = Math.max(568, Number(height) || 812);
  const isVeryNarrow = safeWidth < 350;
  const isNarrow = safeWidth < 380;
  const isShort = safeHeight < 720;
  const contentHorizontalPadding = isVeryNarrow ? spaceScale(12) : isNarrow ? spaceScale(14) : spaceScale(16);
  const contentMaxWidth = Math.min(safeWidth - contentHorizontalPadding * 2, 720);
  const topButtonHeight = clamp(Math.round(safeWidth * 0.11), 38, 44);
  const topButtonRadius = radiusScale(topButtonHeight / 2);
  const navButtonSize = clamp(Math.round(safeWidth * 0.11), 40, 44);
  const actionButtonSize = isVeryNarrow ? spaceScale(38) : isNarrow ? spaceScale(40) : spaceScale(42);
  const optionMinHeight = isVeryNarrow ? verticalScale(56) : isNarrow ? verticalScale(60) : verticalScale(62);
  return {
    isVeryNarrow,
    isNarrow,
    isShort,
    contentHorizontalPadding,
    contentMaxWidth,
    sectionTopPadding: isShort ? spaceScale(10) : spaceScale(16),
    sectionGap: isVeryNarrow ? spaceScale(6) : spaceScale(8),
    topButtonHeight,
    topButtonRadius,
    topButtonTextSize: isVeryNarrow ? fontScale(11) : fontScale(12),
    navButtonSize,
    navIconSize: isVeryNarrow ? 16 : 18,
    screenActionGap: isVeryNarrow ? spaceScale(6) : spaceScale(8),
    questionCardMarginTop: isVeryNarrow ? spaceScale(10) : spaceScale(14),
    questionCardPadding: isVeryNarrow ? spaceScale(10) : spaceScale(12),
    questionPanelRadius: isVeryNarrow ? radiusScale(22) : radiusScale(26),
    questionPanelPaddingHorizontal: isVeryNarrow ? spaceScale(14) : isNarrow ? spaceScale(16) : spaceScale(18),
    questionPanelPaddingTop: isVeryNarrow ? spaceScale(14) : spaceScale(18),
    questionPanelPaddingBottom: isVeryNarrow ? spaceScale(16) : spaceScale(20),
    panelTitleFontSize: isVeryNarrow ? fontScale(9) : fontScale(10),
    questionCounterFontSize: isVeryNarrow ? fontScale(12) : fontScale(13),
    questionTitleFontSize: isVeryNarrow ? fontScale(15) : isNarrow ? fontScale(16.5) : fontScale(18),
    questionTitleLineHeight: isVeryNarrow ? fontScale(22) : isNarrow ? fontScale(24) : fontScale(25),
    longQuestionTitleFontSize: isVeryNarrow ? fontScale(14) : fontScale(15.5),
    longQuestionTitleLineHeight: isVeryNarrow ? fontScale(20) : fontScale(22),
    questionActionsMarginTop: isVeryNarrow ? spaceScale(10) : spaceScale(14),
    questionLanguageMarginTop: isVeryNarrow ? spaceScale(10) : spaceScale(12),
    questionControlButtonSize: actionButtonSize,
    questionControlIconSize: isVeryNarrow ? 17 : 19,
    questionControlGap: isVeryNarrow ? spaceScale(6) : spaceScale(8),
    languageContainerMaxWidth: contentMaxWidth,
    languageContainerPadding: isVeryNarrow ? spaceScale(2) : spaceScale(3),
    languageContainerGap: isVeryNarrow ? spaceScale(3) : spaceScale(4),
    languageChipMinWidth: 0,
    languageChipMinHeight: isVeryNarrow ? 30 : 34,
    languageChipPaddingHorizontal: isVeryNarrow ? spaceScale(3) : spaceScale(5),
    languageLabelFontSize: isVeryNarrow ? fontScale(10) : fontScale(11),
    languageHeadingFontSize: isVeryNarrow ? fontScale(10) : fontScale(11),
    timeRowMarginTop: isVeryNarrow ? spaceScale(10) : spaceScale(12),
    timeClockSize: isVeryNarrow ? 40 : 44,
    timeBarHeight: isVeryNarrow ? 7 : 8,
    timeValueFontSize: isVeryNarrow ? fontScale(11) : fontScale(12),
    timeValueMinWidth: isVeryNarrow ? 46 : 52,
    optionsMarginTop: isVeryNarrow ? spaceScale(12) : spaceScale(16),
    optionMinHeight,
    optionRadius: isVeryNarrow ? radiusScale(20) : radiusScale(22),
    optionPadding: isVeryNarrow ? spaceScale(12) : spaceScale(14),
    optionBadgeSize: isVeryNarrow ? spaceScale(30) : spaceScale(34),
    optionBadgeMarginRight: isVeryNarrow ? spaceScale(10) : spaceScale(14),
    optionBadgeFontSize: isVeryNarrow ? fontScale(11) : fontScale(12),
    optionTextFontSize: isVeryNarrow ? fontScale(13) : fontScale(14),
    optionTextLineHeight: isVeryNarrow ? fontScale(18) : fontScale(20),
    feedbackMarginTop: isVeryNarrow ? spaceScale(12) : spaceScale(16),
    feedbackFontSize: isVeryNarrow ? fontScale(13) : fontScale(14),
    feedbackLineHeight: isVeryNarrow ? fontScale(18) : fontScale(20),
    answerTextFontSize: isVeryNarrow ? fontScale(12) : fontScale(13),
    answerTextLineHeight: isVeryNarrow ? fontScale(17) : fontScale(18),
  };
};
