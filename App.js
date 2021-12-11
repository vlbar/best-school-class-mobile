import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import configureAxios from './src/config/axios-config';
import MainNavigation from './src/components/navigation/MainNavigation';
import StartNavigation from './src/components/navigation/StartNavigation';
import { configureInternationalization } from './src/utils/Internationalization';

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    Promise.all([
      configureAxios(() => setIsSignedIn(false)),
      configureInternationalization(),
    ]).then(() => setIsInitialized(true));
    SplashScreen.hide();
  }, []);

  if (!isInitialized) return <View />;
  else if (!isSignedIn)
    return <StartNavigation onLoginSuccess={() => setIsSignedIn(true)} />;
  else return <MainNavigation />;
};

export default App;
