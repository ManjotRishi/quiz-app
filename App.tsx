import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './pages/SplashScreen';
import Home from './pages/Home';
import QuizBoard from './pages/QuizBoard';
import EnglishQuizz from './pages/EnglishQuizz';
import TrickeyQuestions from './pages/TrickeyQuestions';
import More from './pages/More';
import Score from './pages/Score';
import { RootStackParamList } from './navigation/types';
import { ROUTES } from './navigation/routes';
import CurrentAffairs from './pages/CurrentAffair';
import AppErrorBoundary from './components/AppErrorBoundary';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <NavigationContainer>
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name={ROUTES.Splash} component={SplashScreen} />
            <Stack.Screen name={ROUTES.Home} component={Home} />
            <Stack.Screen name={ROUTES.QuizBoard} component={QuizBoard} />
            <Stack.Screen name={ROUTES.EnglishQuizz} component={EnglishQuizz} />
            <Stack.Screen name={ROUTES.GkBoard} component={CurrentAffairs} />
            <Stack.Screen name={ROUTES.TrickeyQuestions} component={TrickeyQuestions} />
            <Stack.Screen name={ROUTES.More} component={More} />
            <Stack.Screen name={ROUTES.Score} component={Score} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

export default App;
