import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StatusBar } from 'react-native';
import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { REWARDID } from '../util/constants';
import { DEFAULT_FULL_SCREEN_REQUEST_OPTIONS } from '../util/adMobConfig';

const shownPlacements = new Map();

export const useRewardedAd = ({
  adUnitId,
  requestOptions = DEFAULT_FULL_SCREEN_REQUEST_OPTIONS,
  useTestIds = __DEV__,
} = {}) => {
  const [loaded, setLoaded] = useState(false);
  const [rewardEarned, setRewardEarned] = useState(false);

  const rewardedRef = useRef(null);
  const cleanupRef = useRef([]);
  const isActiveRef = useRef(true);
  const isLoadingRef = useRef(false);
  const loadedRef = useRef(false);
  const pendingShowRef = useRef(null);
  const rewardEarnedRef = useRef(false);

  const closeHandlerRef = useRef(null);
  const openHandlerRef = useRef(null);
  const rewardHandlerRef = useRef(null);

  const resolvedAdUnitId = useMemo(() => {
    if (useTestIds) {
      return TestIds.REWARDED;
    }

    return adUnitId ?? REWARDID ?? null;
  }, [adUnitId, useTestIds]);

  const removeListeners = useCallback(() => {
    (cleanupRef.current ?? []).forEach((unsubscribe) => {
      try {
        unsubscribe?.();
      } catch (error) {
        console.warn('[useRewardedAd] Failed to remove ad listener:', error);
      }
    });

    cleanupRef.current = [];
  }, []);

  const ensureRewarded = useCallback(() => {
    if (!resolvedAdUnitId) {
      return null;
    }

    if (!rewardedRef.current) {
      try {
        rewardedRef.current = RewardedAd.createForAdRequest(resolvedAdUnitId, {
          ...requestOptions,
        });
      } catch (error) {
        console.warn('[useRewardedAd] Failed to create rewarded ad:', error);
        return null;
      }

      const rewarded = rewardedRef.current;

      cleanupRef.current.push(
        rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
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

          try {
            rewarded.show();
          } catch (error) {
            console.warn('[useRewardedAd] Failed to show loaded rewarded ad:', error);
            loadedRef.current = false;
            setLoaded(false);
          }
        })
      );

      cleanupRef.current.push(
        rewarded.addAdEventListener(AdEventType.OPENED, () => {
          if (Platform.OS === 'ios') {
            StatusBar.setHidden(true);
          }

          const handler = openHandlerRef.current;
          openHandlerRef.current = null;

          handler?.();
        })
      );

      cleanupRef.current.push(
        rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
          rewardEarnedRef.current = true;
          setRewardEarned(true);
          rewardHandlerRef.current?.(reward);
        })
      );

      cleanupRef.current.push(
        rewarded.addAdEventListener(AdEventType.CLOSED, () => {
          if (Platform.OS === 'ios') {
            StatusBar.setHidden(false);
          }

          loadedRef.current = false;
          setLoaded(false);
          isLoadingRef.current = false;

          const handler = closeHandlerRef.current;
          closeHandlerRef.current = null;
          rewardHandlerRef.current = null;

          handler?.({
            rewardEarned: rewardEarnedRef.current,
          });

          rewardEarnedRef.current = false;
          setRewardEarned(false);

          if (isActiveRef.current) {
            rewarded.load();
            isLoadingRef.current = true;
          }
        })
      );

      cleanupRef.current.push(
        rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
          console.warn('[useRewardedAd] Rewarded ad failed to load:', error);

          loadedRef.current = false;
          pendingShowRef.current = null;
          rewardEarnedRef.current = false;
          setLoaded(false);
          setRewardEarned(false);
          isLoadingRef.current = false;
        })
      );
    }

    return rewardedRef.current;
  }, [removeListeners, requestOptions, resolvedAdUnitId]);

  useEffect(() => {
    isActiveRef.current = true;

    return () => {
      isActiveRef.current = false;

      removeListeners();
      rewardedRef.current = null;
      isLoadingRef.current = false;
      loadedRef.current = false;
      pendingShowRef.current = null;
      rewardEarnedRef.current = false;

      closeHandlerRef.current = null;
      openHandlerRef.current = null;
      rewardHandlerRef.current = null;
    };
  }, [removeListeners]);

  const prepareRewardAd = useCallback(() => {
    const rewarded = ensureRewarded();

    if (!rewarded) return;
    if (loadedRef.current || isLoadingRef.current) return;

    isLoadingRef.current = true;
    try {
      rewarded.load();
    } catch (error) {
      console.warn('[useRewardedAd] Failed to load rewarded ad:', error);
      isLoadingRef.current = false;
    }
  }, [ensureRewarded]);

  const startRewardAd = useCallback(
    (options = {}) => {
      const {
        placementKey = 'default',
        cooldownMs = 0,
        force = false,
        onClosed,
        onOpened,
        onRewardEarned,
      } = options;

      const rewarded = ensureRewarded();

      if (!rewarded) {
        console.warn('[useRewardedAd] No rewarded ad unit ID was provided.');
        return false;
      }

      const lastShownAt = shownPlacements.get(placementKey) ?? 0;

      if (!force && cooldownMs > 0 && Date.now() - lastShownAt < cooldownMs) {
        return false;
      }

      rewardEarnedRef.current = false;
      setRewardEarned(false);

      if (onClosed) {
        closeHandlerRef.current = onClosed;
      }

      if (onOpened) {
        openHandlerRef.current = onOpened;
      }

      if (onRewardEarned) {
        rewardHandlerRef.current = onRewardEarned;
      }

      const showAd = () => {
        if (!isActiveRef.current) return;

        pendingShowRef.current = null;
        shownPlacements.set(placementKey, Date.now());

        try {
          rewarded.show();
        } catch (error) {
          console.warn('[useRewardedAd] Failed to show rewarded ad:', error);
          loadedRef.current = false;
          setLoaded(false);
          isLoadingRef.current = false;
        }
      };

      if (loadedRef.current) {
        showAd();
        return true;
      }

      pendingShowRef.current = { placementKey };

      if (!isLoadingRef.current) {
        isLoadingRef.current = true;

        try {
          rewarded.load();
        } catch (error) {
          console.warn('[useRewardedAd] Failed to request rewarded load:', error);
          isLoadingRef.current = false;
          pendingShowRef.current = null;
          return false;
        }
      }

      return true;
    },
    [ensureRewarded]
  );

  const closeRewardAd = useCallback(() => {
    removeListeners();

    rewardedRef.current = null;
    pendingShowRef.current = null;
    setLoaded(false);
    setRewardEarned(false);
    isLoadingRef.current = false;
    loadedRef.current = false;
    rewardEarnedRef.current = false;

    closeHandlerRef.current = null;
    openHandlerRef.current = null;
    rewardHandlerRef.current = null;

    if (Platform.OS === 'ios') {
      StatusBar.setHidden(false);
    }
  }, [removeListeners]);

  return {
    loaded,
    rewardEarned,
    prepareRewardAd,
    startRewardAd,
    closeRewardAd,
  };
};
