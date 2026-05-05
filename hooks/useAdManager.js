import { useCallback, useEffect } from 'react';
import { useInterstitialAd } from './useInterstitialAd';
import { useRewardedAd } from './useRewardedAd';
import { ADMOB_IDS } from '../util/adMobConfig';
import { pickRandomLoadedAdType, shouldShowQuizMilestoneAd } from '../util/adHelpers';

export const resetAdSessionState = () => {};

/**
 * @typedef {Object} RewardedClosedEvent
 * @property {boolean} [rewardEarned]
 */

/**
 * @typedef {Object} ShowInterstitialOptions
 * @property {string} [placement]
 * @property {boolean} [force]
 * @property {() => void} [onOpened]
 * @property {() => void} [onClosed]
 */

/**
 * @typedef {Object} ShowRewardedOptions
 * @property {string} [placement]
 * @property {number} [attemptedQuestions]
 * @property {boolean} [force]
 * @property {() => void} [onOpened]
 * @property {() => void} [onRewardEarned]
 * @property {(event?: RewardedClosedEvent) => void} [onClosed]
 */

export const useAdManager = () => {
  const {
    loaded: interstitialLoaded,
    prepareAdv,
    startAdv,
  } = useInterstitialAd({
    adUnitId: ADMOB_IDS.interstitial,
  });
  const {
    loaded: rewardedLoaded,
    prepareRewardAd,
    startRewardAd,
  } = useRewardedAd({
    adUnitId: ADMOB_IDS.rewarded,
  });

  useEffect(() => {
    prepareAdv();
    prepareRewardAd();
  }, [prepareAdv, prepareRewardAd]);

  const preloadInterstitial = useCallback(() => {
    prepareAdv();
  }, [prepareAdv]);

  const preloadRewarded = useCallback(() => {
    prepareRewardAd();
  }, [prepareRewardAd]);

  /** @type {(options?: ShowInterstitialOptions) => boolean} */
  const showInterstitial = useCallback(
    ({ placement, force = false, onOpened, onClosed } = {}) => {
      const didStart = startAdv({
        placementKey: `managed-${placement ?? 'default'}`,
        cooldownMs: 0,
        force,
        onOpened: () => {
          onOpened?.();
        },
        onClosed: () => {
          preloadInterstitial();
          onClosed?.();
        },
      });

      if (!didStart) {
        preloadInterstitial();
      }

      return didStart;
    },
    [preloadInterstitial, startAdv]
  );

  /** @type {(options?: ShowRewardedOptions) => boolean} */
  const showRewarded = useCallback(
    ({
      placement,
      attemptedQuestions = 0,
      force = false,
      onOpened,
      onRewardEarned,
      onClosed,
    } = {}) => {
      if (!force && attemptedQuestions < 1) {
        preloadRewarded();
        return false;
      }

      const didStart = startRewardAd({
        placementKey: `managed-${placement ?? 'default'}`,
        cooldownMs: 0,
        force,
        onOpened: () => {
          onOpened?.();
        },
        onRewardEarned: () => {
          onRewardEarned?.();
        },
        onClosed: (event) => {
          preloadRewarded();
          onClosed?.(event);
        },
      });

      if (!didStart) {
        preloadRewarded();
      }

      return didStart;
    },
    [preloadRewarded, startRewardAd]
  );

  const showRandomQuizBreakAd = useCallback(
    ({
      attemptedQuestions = 0,
      lastShownMilestone = 0,
      onClosed,
      onRewardEarned,
    } = {}) => {
      const { shouldShow, milestone } = shouldShowQuizMilestoneAd({
        attemptedQuestions,
        lastShownMilestone,
      });

      if (!shouldShow) {
        return {
          didShow: false,
          milestone: 0,
          adType: null,
        };
      }

      const adType = pickRandomLoadedAdType({
        rewardedLoaded,
        interstitialLoaded,
      }) ?? (interstitialLoaded ? 'interstitial' : rewardedLoaded ? 'rewarded' : 'interstitial');

      if (adType === 'rewarded') {
        const didShow = showRewarded({
          placement: `quiz_break_rewarded_${milestone}`,
          attemptedQuestions: milestone,
          force: true,
          onRewardEarned,
          onClosed,
        });

        return {
          didShow,
          milestone,
          adType,
        };
      }

      const didShow = showInterstitial({
        placement: `quiz_break_interstitial_${milestone}`,
        force: true,
        onClosed,
      });

      return {
        didShow,
        milestone,
        adType,
      };
    },
    [
      interstitialLoaded,
      rewardedLoaded,
      showInterstitial,
      showRewarded,
    ]
  );

  return {
    interstitialLoaded,
    rewardedLoaded,
    preloadInterstitial,
    preloadRewarded,
    showInterstitial,
    showRewarded,
    showRandomQuizBreakAd,
  };
};
