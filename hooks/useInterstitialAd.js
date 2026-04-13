import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StatusBar } from 'react-native';
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';

const DEFAULT_KEYWORDS = ['fashion', 'clothing'];

const shownPlacements = new Map();

export const useInterstitialAd = ({
  adUnitId,
  keywords = DEFAULT_KEYWORDS,
  useTestIds = __DEV__,
} = {}) => {
  const [loaded, setLoaded] = useState(false);

  const interstitialRef = useRef(null);
  const cleanupRef = useRef([]);
  const isActiveRef = useRef(true);
  const isLoadingRef = useRef(false);
  const loadedRef = useRef(false);
  const pendingShowRef = useRef(null);

  const closeHandlerRef = useRef(null);
  const openHandlerRef = useRef(null);

  const resolvedAdUnitId = useMemo(() => {
    if (useTestIds) {
      return TestIds.INTERSTITIAL;
    }

    return adUnitId ?? null;
  }, [adUnitId, useTestIds]);

  const removeListeners = useCallback(() => {
    cleanupRef.current.forEach((unsubscribe) => {
      try {
        unsubscribe?.();
      } catch (error) {
        console.warn(
          '[useInterstitialAd] Failed to remove ad listener:',
          error
        );
      }
    });

    cleanupRef.current = [];
  }, []);

  const ensureInterstitial = useCallback(() => {
    if (!resolvedAdUnitId) {
      return null;
    }

    if (!interstitialRef.current) {
      interstitialRef.current = InterstitialAd.createForAdRequest(
        resolvedAdUnitId,
        { keywords }
      );

      const interstitial = interstitialRef.current;

      cleanupRef.current.push(
        interstitial.addAdEventListener(AdEventType.LOADED, () => {
          if (!isActiveRef.current) return;

          isLoadingRef.current = false;
          loadedRef.current = true;
          setLoaded(true);

          if (!pendingShowRef.current) {
            return;
          }

          const { placementKey } = pendingShowRef.current;
          pendingShowRef.current = null;
          shownPlacements.set(placementKey, Date.now());
          interstitial.show();
        })
      );

      cleanupRef.current.push(
        interstitial.addAdEventListener(AdEventType.OPENED, () => {
          if (Platform.OS === 'ios') {
            StatusBar.setHidden(true);
          }

          const handler = openHandlerRef.current;
          openHandlerRef.current = null;

          handler?.();
        })
      );

      cleanupRef.current.push(
        interstitial.addAdEventListener(AdEventType.CLOSED, () => {
          if (Platform.OS === 'ios') {
            StatusBar.setHidden(false);
          }

          loadedRef.current = false;
          setLoaded(false);
          isLoadingRef.current = false;

          const handler = closeHandlerRef.current;
          closeHandlerRef.current = null;

          handler?.();

          if (isActiveRef.current) {
            interstitial.load();
            isLoadingRef.current = true;
          }
        })
      );

      cleanupRef.current.push(
        interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
          console.warn(
            '[useInterstitialAd] Interstitial failed to load:',
            error
          );

          loadedRef.current = false;
          pendingShowRef.current = null;
          setLoaded(false);
          isLoadingRef.current = false;
        })
      );
    }

    return interstitialRef.current;
  }, [keywords, resolvedAdUnitId]);

  useEffect(() => {
    isActiveRef.current = true;

    return () => {
      isActiveRef.current = false;

      removeListeners();
      interstitialRef.current = null;
      isLoadingRef.current = false;
      loadedRef.current = false;
      pendingShowRef.current = null;

      closeHandlerRef.current = null;
      openHandlerRef.current = null;
    };
  }, [removeListeners]);

  const prepareAdv = useCallback(() => {
    const interstitial = ensureInterstitial();

    if (!interstitial) return;
    if (loadedRef.current || isLoadingRef.current) return;

    isLoadingRef.current = true;
    interstitial.load();
  }, [ensureInterstitial]);

  const startAdv = useCallback(
    (options = {}) => {
      const {
        placementKey = 'default',
        cooldownMs = 0,
        force = false,
        onClosed,
        onOpened,
      } = options;

      const interstitial = ensureInterstitial();

      if (!interstitial) {
        console.warn(
          '[useInterstitialAd] No interstitial ad unit ID was provided.'
        );
        return false;
      }

      const lastShownAt = shownPlacements.get(placementKey) ?? 0;

      if (
        !force &&
        cooldownMs > 0 &&
        Date.now() - lastShownAt < cooldownMs
      ) {
        return false;
      }

      if (onClosed) {
        closeHandlerRef.current = onClosed;
      }

      if (onOpened) {
        openHandlerRef.current = onOpened;
      }

      const showAd = () => {
        if (!isActiveRef.current) return;

        pendingShowRef.current = null;
        shownPlacements.set(placementKey, Date.now());
        interstitial.show();
      };

      if (loadedRef.current) {
        showAd();
        return true;
      }

      pendingShowRef.current = { placementKey };

      if (!isLoadingRef.current) {
        isLoadingRef.current = true;
        interstitial.load();
      }

      return true;
    },
    [ensureInterstitial]
  );

  const closeAdv = useCallback(() => {
    removeListeners();

    interstitialRef.current = null;
    pendingShowRef.current = null;
    setLoaded(false);
    isLoadingRef.current = false;
    loadedRef.current = false;

    closeHandlerRef.current = null;
    openHandlerRef.current = null;

    if (Platform.OS === 'ios') {
      StatusBar.setHidden(false);
    }
  }, [removeListeners]);

  return {
    loaded,
    prepareAdv,
    startAdv,
    closeAdv,
  };
};
