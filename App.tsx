import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './pages/SplashScreen';
import QuizBoard from './pages/QuizBoard';
import Score from './pages/Score';
import { RootStackParamList } from './navigation/types';
import './util/firebase';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen}/>
          <Stack.Screen name="QuizBoard" component={QuizBoard}/>
          <Stack.Screen name="Score" component={Score}/>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
