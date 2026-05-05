/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

const createScreenMock = (name: string) => () => null;

jest.mock('react-native-tts', () => ({
  getInitStatus: jest.fn(() => Promise.resolve()),
  setDefaultLanguage: jest.fn(),
  setDefaultRate: jest.fn(),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  stop: jest.fn(() => Promise.resolve()),
  speak: jest.fn(() => Promise.resolve()),
  voices: jest.fn(() => Promise.resolve([])),
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');

  return {
    ...actual,
    NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
    useNavigationState: jest.fn((selector) =>
      selector({
        index: 0,
        routes: [{ key: 'mock-route' }],
      })
    ),
    useIsFocused: jest.fn(() => true),
  };
});

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: () => null,
  })),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn(() => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: () => null,
  })),
}));

jest.mock('../pages/SplashScreen', () => createScreenMock('SplashScreen'));
jest.mock('../pages/Home', () => createScreenMock('Home'));
jest.mock('../pages/TestsScreen', () => createScreenMock('TestsScreen'));
jest.mock('../pages/PostsScreen', () => createScreenMock('PostsScreen'));
jest.mock('../pages/BookmarksScreen', () => createScreenMock('BookmarksScreen'));
jest.mock('../pages/ProfileScreen', () => createScreenMock('ProfileScreen'));
jest.mock('../pages/QuizBoard', () => createScreenMock('QuizBoard'));
jest.mock('../pages/MathQuizz', () => createScreenMock('MathQuizz'));
jest.mock('../pages/EnglishQuizz', () => createScreenMock('EnglishQuizz'));
jest.mock('../pages/ChildQuizz', () => createScreenMock('ChildQuizz'));
jest.mock('../pages/ChildSection', () => createScreenMock('ChildSection'));
jest.mock('../pages/TrickeyQuestions', () => createScreenMock('TrickeyQuestions'));
jest.mock('../pages/StoryScreen', () => createScreenMock('StoryScreen'));
jest.mock('../pages/More', () => createScreenMock('More'));
jest.mock('../pages/Score', () => createScreenMock('Score'));
jest.mock('../pages/CurrentAffair', () => createScreenMock('CurrentAffair'));
jest.mock('../components/NotificationPermissionGate', () => createScreenMock('NotificationPermissionGate'));
jest.mock('../hooks/useAppOpenAdvertisement', () => ({
  useAppOpenAdvertisement: jest.fn(),
}));
jest.mock('../util/inAppUpdates', () => ({
  checkForAppUpdate: jest.fn(() => Promise.resolve()),
  detachInAppUpdateListeners: jest.fn(),
}));
jest.mock('react-native-google-mobile-ads', () => {
  const mobileAdsFactory = () => ({
    initialize: jest.fn(() => Promise.resolve()),
    setRequestConfiguration: jest.fn(() => Promise.resolve()),
  });

  return {
    __esModule: true,
    default: mobileAdsFactory,
    TestIds: {
      ADAPTIVE_BANNER: 'test-banner',
      INTERSTITIAL: 'test-interstitial',
      REWARDED: 'test-rewarded',
      APP_OPEN: 'test-app-open',
    },
    MaxAdContentRating: {
      PG: 'PG',
    },
  };
});

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
