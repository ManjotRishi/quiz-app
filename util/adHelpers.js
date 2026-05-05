import { QUIZ_AD_MILESTONES } from './adMobConfig';

export const getQuizAdMilestone = (
  attemptedQuestions = 0,
  milestones = QUIZ_AD_MILESTONES
) => milestones.find((milestone) => milestone === attemptedQuestions) ?? 0;

export const shouldShowQuizMilestoneAd = ({
  attemptedQuestions = 0,
  lastShownMilestone = 0,
  milestones = QUIZ_AD_MILESTONES,
} = {}) => {
  const milestone = getQuizAdMilestone(attemptedQuestions, milestones);

  if (!milestone) {
    return {
      shouldShow: false,
      milestone: 0,
    };
  }

  return {
    shouldShow: milestone !== lastShownMilestone,
    milestone,
  };
};

export const pickRandomLoadedAdType = ({
  rewardedLoaded = false,
  interstitialLoaded = false,
} = {}) => {
  const availableTypes = [];

  if (rewardedLoaded) {
    availableTypes.push('rewarded');
  }

  if (interstitialLoaded) {
    availableTypes.push('interstitial');
  }

  if (!availableTypes.length) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * availableTypes.length);
  return availableTypes[randomIndex];
};
