import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import configureAxios from './src/config/axios-config';
import MainNavigation from './src/components/navigation/MainNavigation';
import StartNavigation from './src/components/navigation/StartNavigation';
import { configureInternationalization } from './src/utils/Internationalization';

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    Promise.all([
      configureAxios(() => setIsSignedIn(false)),
      configureInternationalization(),
    ]).then(() => setIsInitialized(true));
  }, []);

  useEffect(() => {
    if (isInitialized) SplashScreen.hide();
  }, [isInitialized]);

  if (!isInitialized) return <View />;
  else if (!isSignedIn)
    return <StartNavigation onLoginSuccess={() => setIsSignedIn(true)} />;
  else return <MainNavigation />;
};

export default App;
