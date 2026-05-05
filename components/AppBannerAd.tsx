import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle, useWindowDimensions } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  useForeground,
} from 'react-native-google-mobile-ads';
import type { RequestOptions } from 'react-native-google-mobile-ads';
import {
  ADMOB_IDS,
  BANNER_RETRY_DELAYS_MS,
  DEFAULT_BANNER_REQUEST_OPTIONS,
} from '../util/adMobConfig';
import { radiusScale } from '../style/responsive';

type AppBannerAdProps = {
  placement?: string;
  unitId?: string;
  size?: BannerAdSize | string;
  requestOptions?: RequestOptions;
  containerStyle?: StyleProp<ViewStyle>;
  minHeight?: number;
  horizontalInset?: number;
  collapseWhenNotLoaded?: boolean;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: Error) => void;
};

function AppBannerAd({
  placement = 'default',
  unitId = ADMOB_IDS.banner,
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
  requestOptions,
  containerStyle,
  minHeight = 56,
  horizontalInset = 0,
  collapseWhenNotLoaded = true,
  onAdLoaded,
  onAdFailedToLoad,
}: AppBannerAdProps) {
  const { width } = useWindowDimensions();
  const bannerRef = useRef<BannerAd>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryAttemptRef = useRef(0);
  const [renderKey, setRenderKey] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sizeIndex, setSizeIndex] = useState(0);

  const sizeFallbacks = useMemo(() => {
    if (size === BannerAdSize.ANCHORED_ADAPTIVE_BANNER) {
      return [
        BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
        BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER,
        BannerAdSize.FULL_BANNER,
      ];
    }

    return [size];
  }, [size]);

  const activeSize = sizeFallbacks[Math.min(sizeIndex, sizeFallbacks.length - 1)] ?? size;

  const resolvedWidth = useMemo(() => {
    const nextWidth = Math.max(0, Math.floor(width - horizontalInset * 2));
    return nextWidth || undefined;
  }, [horizontalInset, width]);

  const resolvedRequestOptions = useMemo(
    () => ({
      ...DEFAULT_BANNER_REQUEST_OPTIONS,
      ...(requestOptions ?? {}),
    }),
    [requestOptions]
  );

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const requestRemount = useCallback(() => {
    setIsLoaded(false);
    setRenderKey((current) => current + 1);
  }, []);

  const scheduleRetry = useCallback(() => {
    clearRetryTimer();

    const retryDelay =
      BANNER_RETRY_DELAYS_MS[Math.min(retryAttemptRef.current, BANNER_RETRY_DELAYS_MS.length - 1)];

    retryTimerRef.current = setTimeout(() => {
      retryAttemptRef.current += 1;
      setSizeIndex(0);
      requestRemount();
    }, retryDelay);
  }, [clearRetryTimer, requestRemount]);

  useForeground(() => {
    clearRetryTimer();

    if (Platform.OS === 'ios') {
      setSizeIndex(0);
      bannerRef.current?.load();
      return;
    }

    setSizeIndex(0);
    requestRemount();
  });

  useEffect(() => () => clearRetryTimer(), [clearRetryTimer]);

  return (
    <View
      style={[
        styles.container,
        { minHeight },
        containerStyle,
        !isLoaded ? styles.unloadedContainer : null,
        collapseWhenNotLoaded && !isLoaded ? styles.collapsedContainer : null,
      ]}
    >
      <BannerAd
        key={`${placement}:${activeSize}:${renderKey}:${resolvedWidth ?? 'auto'}`}
        ref={bannerRef}
        unitId={unitId}
        size={activeSize}
        width={resolvedWidth}
        requestOptions={resolvedRequestOptions}
        onAdLoaded={() => {
          clearRetryTimer();
          retryAttemptRef.current = 0;
          setIsLoaded(true);
          onAdLoaded?.();
        }}
        onAdFailedToLoad={(error) => {
          setIsLoaded(false);

          const nextSizeIndex = sizeIndex + 1;
          if (nextSizeIndex < sizeFallbacks.length) {
            setSizeIndex(nextSizeIndex);
            setRenderKey((current) => current + 1);
            return;
          }

          console.warn(`[AppBannerAd] Failed to load banner`, {
            placement,
            unitId,
            size: activeSize,
            message: error?.message,
            code: (error as Error & { code?: string })?.code,
          });
          onAdFailedToLoad?.(error);
          scheduleRetry();
        }}
      />

      {!isLoaded && !collapseWhenNotLoaded ? <View pointerEvents="none" style={styles.placeholder} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radiusScale(26),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  unloadedContainer: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  collapsedContainer: {
    minHeight: 0,
    height: 0,
  },
});

export default memo(AppBannerAd);
