import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useForeground,
} from 'react-native-google-mobile-ads';
import type { RequestOptions } from 'react-native-google-mobile-ads';

type AdvertisementUnitIds = {
  banner?: string;
};

export type AdvertisementProps = {
  banner?: boolean;
  unitIds?: AdvertisementUnitIds;
  useTestIds?: boolean;
  bannerSize?: BannerAdSize | string;
  bannerWidth?: number;
  bannerMaxHeight?: number;
  requestOptions?: RequestOptions;
  containerStyle?: StyleProp<ViewStyle>;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
  onAdOpened?: () => void;
  onAdClosed?: () => void;
  onAdClicked?: () => void;
  onAdImpression?: () => void;
};

function Advertisement({
  banner = false,
  unitIds,
  useTestIds = __DEV__,
  bannerSize = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
  bannerWidth,
  bannerMaxHeight,
  requestOptions,
  containerStyle,
  onAdLoaded,
  onAdFailedToLoad,
  onAdOpened,
  onAdClosed,
  onAdClicked,
  onAdImpression,
}: AdvertisementProps) {
  const bannerRef = useRef<BannerAd>(null);
  const hasWarnedForMissingUnitId = useRef(false);

  useForeground(() => {
    if (banner && Platform.OS === 'ios') {
      bannerRef.current?.load();
    }
  });

  const resolvedBannerUnitId = useMemo(() => {
    if (!banner) {
      return null;
    }

    if (useTestIds) {
      return TestIds.ADAPTIVE_BANNER;
    }

    return unitIds?.banner ?? null;
  }, [banner, unitIds, useTestIds]);

  useEffect(() => {
    if (resolvedBannerUnitId) {
      hasWarnedForMissingUnitId.current = false;
    }
  }, [resolvedBannerUnitId]);

  if (!banner) {
    return null;
  }

  if (!resolvedBannerUnitId) {
    if (!hasWarnedForMissingUnitId.current) {
      hasWarnedForMissingUnitId.current = true;
      console.warn(
        '[Advertisement] No banner ad unit ID was provided. Pass unitIds.banner or keep useTestIds enabled while testing.'
      );
    }
    return null;
  }

  return (
    <View style={containerStyle}>
      <BannerAd
        ref={bannerRef}
        unitId={resolvedBannerUnitId}
        size={bannerSize}
        width={bannerWidth}
        maxHeight={bannerMaxHeight}
        requestOptions={requestOptions}
        onAdLoaded={() => onAdLoaded?.()}
        onAdFailedToLoad={error => onAdFailedToLoad?.(error)}
        onAdOpened={() => onAdOpened?.()}
        onAdClosed={() => onAdClosed?.()}
        onAdClicked={() => onAdClicked?.()}
        onAdImpression={() => onAdImpression?.()}
      />
    </View>
  );
}

export default memo(Advertisement);
