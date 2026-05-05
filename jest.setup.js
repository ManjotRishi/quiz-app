jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaProvider: ({ children }) => React.createElement(View, null, children),
    SafeAreaView: ({ children }) => React.createElement(View, null, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('react-native-worklets', () => ({
  createSerializable: (value) => value,
}));
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: {
      View,
      Text: View,
      ScrollView: View,
      createAnimatedComponent: (Component) => Component,
    },
    Easing: {
      linear: jest.fn(),
      quad: jest.fn(),
      inOut: jest.fn((value) => value),
    },
    Extrapolate: {
      CLAMP: 'clamp',
    },
    interpolate: jest.fn((value, inputRange, outputRange) => {
      if (!Array.isArray(outputRange) || !outputRange.length) {
        return value;
      }

      return outputRange[Math.min(outputRange.length - 1, 0)];
    }),
    useAnimatedStyle: jest.fn((factory) => factory()),
    useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
    withRepeat: jest.fn((value) => value),
    withTiming: jest.fn((value) => value),
    withSequence: jest.fn((...values) => values[values.length - 1]),
  };
});

jest.mock('react-native-google-mobile-ads', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    AdEventType: {
      LOADED: 'loaded',
      OPENED: 'opened',
      CLOSED: 'closed',
      ERROR: 'error',
    },
    RewardedAdEventType: {
      LOADED: 'loaded',
      EARNED_REWARD: 'earned_reward',
    },
    BannerAd: React.forwardRef((props, ref) => React.createElement(View, { ...props, ref })),
    BannerAdSize: {
      ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
    },
    InterstitialAd: {
      createForAdRequest: () => ({
        addAdEventListener: () => jest.fn(),
        load: jest.fn(),
        show: jest.fn(),
      }),
    },
    RewardedAd: {
      createForAdRequest: () => ({
        addAdEventListener: () => jest.fn(),
        load: jest.fn(),
        show: jest.fn(),
      }),
    },
    TestIds: {
      INTERSTITIAL: 'test-interstitial-id',
      REWARDED: 'test-rewarded-id',
      ADAPTIVE_BANNER: 'test-banner-id',
    },
    useForeground: jest.fn(),
  };
});

jest.mock('sp-react-native-in-app-updates', () => {
  const MockUpdates = function MockUpdates() {
    return {
      addStatusUpdateListener: jest.fn(),
      removeStatusUpdateListener: jest.fn(),
      checkNeedsUpdate: jest.fn().mockResolvedValue({
        shouldUpdate: false,
        other: {
          isFlexibleUpdateAllowed: false,
          isImmediateUpdateAllowed: false,
        },
      }),
      startUpdate: jest.fn(),
      installUpdate: jest.fn(),
    };
  };

  return {
    __esModule: true,
    default: MockUpdates,
    IAUInstallStatus: {
      DOWNLOADED: 'DOWNLOADED',
    },
    IAUUpdateKind: {
      FLEXIBLE: 'FLEXIBLE',
      IMMEDIATE: 'IMMEDIATE',
    },
  };
});
