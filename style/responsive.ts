import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
const baseWidth = 375;
const baseHeight = 812;

const shortSide = Math.min(width, height);

export const isCompactScreen = shortSide < 360;
export const isLargeScreen = shortSide >= 430;
export const isTablet = shortSide >= 768;

export const scale = (size: number) => (width / baseWidth) * size;
export const verticalScale = (size: number) => (height / baseHeight) * size;

export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const fontScale = (size: number) => {
  const scaled = moderateScale(size, isTablet ? 0.7 : 0.5);
  const adjusted = scaled / PixelRatio.getFontScale();
  return Math.max(size * 0.85, adjusted);
};

export const radiusScale = (size: number) => moderateScale(size, 0.35);
export const spaceScale = (size: number) => moderateScale(size, 0.4);
