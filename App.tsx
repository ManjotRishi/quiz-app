import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import mobileAds from 'react-native-google-mobile-ads';
import MainTabs from './components/navigation/MainTabs';
import SplashScreen from './pages/SplashScreen';
import QuizBoard from './pages/QuizBoard';
import MathQuizz from './pages/MathQuizz';
import EnglishQuizz from './pages/EnglishQuizz';
import ChildQuizz from './pages/ChildQuizz';
import ChildAlphabet from './pages/ChildAlphabet';
import ChildCounting from './pages/ChildCounting';
import ChildAnimals from './pages/ChildAnimals';
import MultiplicationTableLearning from './pages/MultiplicationTableLearning';
import ChildSection from './pages/ChildSection';
import TrickeyQuestions from './pages/TrickeyQuestions';
import StoryScreen from './pages/StoryScreen';
import More from './pages/More';
import Score from './pages/Score';
import { RootStackParamList } from './navigation/types';
import { ROUTES } from './navigation/routes';
import CurrentAffairs from './pages/CurrentAffair';
import AppErrorBoundary from './components/AppErrorBoundary';
import AppToastHost from './components/AppToastHost';
import ExportSuccessModalHost from './components/ExportSuccessModalHost';
import NotificationPermissionGate from './components/NotificationPermissionGate';
import { checkForAppUpdate, detachInAppUpdateListeners } from './util/inAppUpdates';
import { ADMOB_IDS, DEFAULT_REQUEST_CONFIGURATION } from './util/adMobConfig';
import { useAppOpenAdvertisement } from './hooks/useAppOpenAdvertisement';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  useAppOpenAdvertisement();

  useEffect(() => {
    mobileAds()
      .setRequestConfiguration(DEFAULT_REQUEST_CONFIGURATION)
      .then(() => mobileAds().initialize())
      .catch((error) => {
        console.warn('Mobile Ads configuration failed:', error);
      });

    if (!__DEV__ && Platform.OS === 'android' && !ADMOB_IDS.app) {
      console.warn('Android AdMob app ID is missing for release configuration.');
    }

    if (!__DEV__ && Platform.OS === 'ios' && !ADMOB_IDS.iosApp) {
      console.warn('iOS AdMob app ID is missing for release configuration.');
    }

    checkForAppUpdate().catch((error) => {
      console.warn('App update check failed:', error);
    });

    return () => {
      detachInAppUpdateListeners();
    };
  }, []);
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <NavigationContainer>
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name={ROUTES.Splash} component={SplashScreen} />
            <Stack.Screen name={ROUTES.Home} component={MainTabs} />
            <Stack.Screen name={ROUTES.QuizBoard} component={QuizBoard} />
            <Stack.Screen name={ROUTES.MathQuizz} component={MathQuizz} />
            <Stack.Screen name={ROUTES.EnglishQuizz} component={EnglishQuizz} />
            <Stack.Screen name={ROUTES.ChildQuizz} component={ChildQuizz} />
            <Stack.Screen name={ROUTES.ChildAlphabet} component={ChildAlphabet} />
            <Stack.Screen name={ROUTES.ChildCounting} component={ChildCounting} />
            <Stack.Screen name={ROUTES.ChildAnimals} component={ChildAnimals} />
            <Stack.Screen name={ROUTES.MultiplicationTableLearning} component={MultiplicationTableLearning} />
            <Stack.Screen name={ROUTES.ChildSection} component={ChildSection} />
            <Stack.Screen name={ROUTES.GkBoard} component={CurrentAffairs} />
            <Stack.Screen name={ROUTES.TrickeyQuestions} component={TrickeyQuestions} />
            <Stack.Screen name={ROUTES.StoryScreen} component={StoryScreen} />
            <Stack.Screen name={ROUTES.More} component={More} />
            <Stack.Screen name={ROUTES.Score} component={Score} />
          </Stack.Navigator>
          <AppToastHost />
          <ExportSuccessModalHost />
          <NotificationPermissionGate />
        </NavigationContainer>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

export default App;
