import { useEffect, useMemo, useRef } from 'react';
import { AppState } from 'react-native';
import { AdEventType, AppOpenAd } from 'react-native-google-mobile-ads';
import { ADMOB_IDS, APP_OPEN_COOLDOWN_MS } from '../util/adMobConfig';
import { AD_SESSION_KEYS, readAdTimestamp, writeAdTimestamp } from '../util/adSessionStorage';

const sessionState = {
  lastShownAt: readAdTimestamp(AD_SESSION_KEYS.appOpenLastShownAt),
  isShowing: false,
};

export const resetAppOpenSessionState = () => {
  sessionState.lastShownAt = 0;
  sessionState.isShowing = false;
  writeAdTimestamp(AD_SESSION_KEYS.appOpenLastShownAt, 0);
};

export const useAppOpenAdvertisement = () => {
  const appStateRef = useRef(AppState.currentState);
  const appOpenRef = useRef(null);
  const loadedRef = useRef(false);
  const loadingRef = useRef(false);
  const pendingShowRef = useRef(true);
  const activeRef = useRef(true);
  const unsubscribeRef = useRef([]);

  const adUnitId = ADMOB_IDS.appOpen;

  const canShowAppOpen = useMemo(
    () => () => {
      if (!adUnitId || sessionState.isShowing) {
        return false;
      }

      return Date.now() - sessionState.lastShownAt >= APP_OPEN_COOLDOWN_MS;
    },
    [adUnitId]
  );

  const clearListeners = () => {
    (unsubscribeRef.current ?? []).forEach((unsubscribe) => {
      try {
        unsubscribe?.();
      } catch (error) {
        console.warn('[useAppOpenAdvertisement] Failed to remove listener:', error);
      }
    });

    unsubscribeRef.current = [];
  };

  const loadAd = () => {
    if (!appOpenRef.current || loadingRef.current || loadedRef.current) {
      return;
    }

    loadingRef.current = true;

    try {
      appOpenRef.current.load();
    } catch (error) {
      console.warn('[useAppOpenAdvertisement] Failed to load app open ad:', error);
      loadingRef.current = false;
    }
  };

  const showIfReady = () => {
    if (!pendingShowRef.current || !loadedRef.current || !canShowAppOpen()) {
      return false;
    }

    pendingShowRef.current = false;
    sessionState.isShowing = true;
    sessionState.lastShownAt = Date.now();
    writeAdTimestamp(AD_SESSION_KEYS.appOpenLastShownAt, sessionState.lastShownAt);

    try {
      appOpenRef.current?.show();
      return true;
    } catch (error) {
      console.warn('[useAppOpenAdvertisement] Failed to show app open ad:', error);
      sessionState.isShowing = false;
      loadedRef.current = false;
      loadingRef.current = false;
      loadAd();
      return false;
    }
  };

  useEffect(() => {
    if (!adUnitId) {
      return undefined;
    }

    activeRef.current = true;
    appOpenRef.current = AppOpenAd.createForAdRequest(adUnitId);

    unsubscribeRef.current.push(
      appOpenRef.current.addAdEventListener(AdEventType.LOADED, () => {
        if (!activeRef.current) {
          return;
        }

        loadedRef.current = true;
        loadingRef.current = false;
        showIfReady();
      })
    );

    unsubscribeRef.current.push(
      appOpenRef.current.addAdEventListener(AdEventType.OPENED, () => {
        sessionState.isShowing = true;
      })
    );

    unsubscribeRef.current.push(
      appOpenRef.current.addAdEventListener(AdEventType.CLOSED, () => {
        sessionState.isShowing = false;
        loadedRef.current = false;
        loadingRef.current = false;
        loadAd();
      })
    );

    unsubscribeRef.current.push(
      appOpenRef.current.addAdEventListener(AdEventType.ERROR, (error) => {
        console.warn('[useAppOpenAdvertisement] App open ad failed:', error);
        sessionState.isShowing = false;
        loadedRef.current = false;
        loadingRef.current = false;
        pendingShowRef.current = false;
        loadAd();
      })
    );

    loadAd();

    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasBackgrounded =
        appStateRef.current === 'background' || appStateRef.current === 'inactive';

      appStateRef.current = nextState;

      if (nextState !== 'active' || !wasBackgrounded || !canShowAppOpen()) {
        return;
      }

      pendingShowRef.current = true;

      if (!showIfReady()) {
        loadAd();
      }
    });

    return () => {
      activeRef.current = false;
      subscription.remove();
      clearListeners();
      appOpenRef.current = null;
      loadedRef.current = false;
      loadingRef.current = false;
      pendingShowRef.current = false;
    };
  }, [adUnitId, canShowAppOpen]);
};
