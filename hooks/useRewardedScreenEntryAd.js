import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { RESULT_SCREEN_REWARDED_RETRY_MS } from '../util/adMobConfig';
import { buildPlacementTimestampKey, readAdTimestamp, writeAdTimestamp } from '../util/adSessionStorage';
import { useAdManager } from './useAdManager';

/**
 * @typedef {Object} RewardedScreenEntryClosedEvent
 * @property {boolean} [rewardEarned]
 */

/**
 * @typedef {Object} RewardedScreenEntryOptions
 * @property {boolean} [enabled]
 * @property {string} [placement]
 * @property {number} [attemptedQuestions]
 * @property {number} [cooldownMs]
 * @property {number} [retryDelayMs]
 * @property {() => void} [onOpened]
 * @property {() => void} [onRewardEarned]
 * @property {(event?: RewardedScreenEntryClosedEvent) => void} [onClosed]
 */

/** @param {RewardedScreenEntryOptions} options */
export const useRewardedScreenEntryAd = ({
  enabled = true,
  placement,
  attemptedQuestions = 1,
  cooldownMs = 0,
  retryDelayMs = RESULT_SCREEN_REWARDED_RETRY_MS,
  onOpened,
  onRewardEarned,
  onClosed,
} = {}) => {
  const { preloadRewarded, showRewarded } = useAdManager();
  const hasHandledFocusRef = useRef(false);
  const requestInFlightRef = useRef(false);
  const retryTimerRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      if (!enabled || !placement) {
        return undefined;
      }

      let isActive = true;
      const storageKey = buildPlacementTimestampKey(placement);

      const clearRetryTimer = () => {
        if (retryTimerRef.current) {
          clearTimeout(retryTimerRef.current);
          retryTimerRef.current = null;
        }
      };

      const tryShow = () => {
        if (!isActive || hasHandledFocusRef.current || requestInFlightRef.current) {
          return;
        }

        const lastShownAt = readAdTimestamp(storageKey);

        if (cooldownMs > 0 && Date.now() - lastShownAt < cooldownMs) {
          hasHandledFocusRef.current = true;
          return;
        }

        const didStart = showRewarded({
          placement,
          attemptedQuestions,
          force: true,
          onOpened: () => {
            requestInFlightRef.current = false;
            hasHandledFocusRef.current = true;
            clearRetryTimer();
            writeAdTimestamp(storageKey, Date.now());
            onOpened?.();
          },
          onRewardEarned: () => {
            onRewardEarned?.();
          },
          onClosed: (event) => {
            requestInFlightRef.current = false;
            hasHandledFocusRef.current = true;
            clearRetryTimer();
            onClosed?.(event);
          },
        });

        if (didStart) {
          requestInFlightRef.current = true;
          clearRetryTimer();
          retryTimerRef.current = setTimeout(() => {
            requestInFlightRef.current = false;
            tryShow();
          }, retryDelayMs);
          return;
        }

        preloadRewarded();
        clearRetryTimer();
        retryTimerRef.current = setTimeout(() => {
          if (!isActive) {
            return;
          }

          tryShow();
        }, retryDelayMs);
      };

      hasHandledFocusRef.current = false;
      requestInFlightRef.current = false;
      preloadRewarded();
      tryShow();

      return () => {
        isActive = false;
        requestInFlightRef.current = false;
        clearRetryTimer();
      };
    }, [
      attemptedQuestions,
      cooldownMs,
      enabled,
      onClosed,
      onOpened,
      onRewardEarned,
      placement,
      preloadRewarded,
      retryDelayMs,
      showRewarded,
    ])
  );
};
