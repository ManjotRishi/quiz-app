import { MaxAdContentRating, TestIds } from 'react-native-google-mobile-ads';
import { APPOPEN, BANNERID, INTENTIALID, REWARDID } from './constants';

const TEST_ADMOB_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_BANNER_ID = TestIds.ADAPTIVE_BANNER;
const TEST_INTERSTITIAL_ID = TestIds.INTERSTITIAL;
const TEST_REWARDED_ID = TestIds.REWARDED;
const TEST_APP_OPEN_ID = TestIds.APP_OPEN;

const RELEASE_ADMOB_ANDROID_APP_ID = 'ca-app-pub-8954280599634551~7250714958';
const RELEASE_ADMOB_IOS_APP_ID = '';

export const ADMOB_IDS = {
  app: __DEV__ ? TEST_ADMOB_APP_ID : RELEASE_ADMOB_ANDROID_APP_ID,
  iosApp: __DEV__ ? TEST_ADMOB_APP_ID : RELEASE_ADMOB_IOS_APP_ID,
  appOpen: __DEV__ ? TEST_APP_OPEN_ID : APPOPEN,
  banner: __DEV__ ? TEST_BANNER_ID : BANNERID,
  interstitial: __DEV__ ? TEST_INTERSTITIAL_ID : INTENTIALID,
  rewarded: __DEV__ ? TEST_REWARDED_ID : REWARDID,
} as const;

export const DEFAULT_REQUEST_CONFIGURATION = {
  maxAdContentRating: MaxAdContentRating.PG,
} as const;

export const DEFAULT_BANNER_REQUEST_OPTIONS = {
  requestNonPersonalizedAdsOnly: false,
} as const;

export const DEFAULT_FULL_SCREEN_REQUEST_OPTIONS = {
  requestNonPersonalizedAdsOnly: false,
} as const;

export const APP_OPEN_COOLDOWN_MS = 5 * 60 * 1000;
export const CHILD_READING_REWARDED_COOLDOWN_MS = 2 * 60 * 1000;
export const RESULT_SCREEN_REWARDED_RETRY_MS = 1800;
export const BANNER_RETRY_DELAYS_MS = [1500, 5000, 15000] as const;
export const QUIZ_AD_MILESTONES = [5, 10, 15, 20] as const;
