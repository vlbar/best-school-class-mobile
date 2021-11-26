import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import StartNavigation from './src/components/navigation/StartNavigation.jsx';
import MainNavigation from './src/components/navigation/MainNavigation.jsx';
import configureAxios from './config/axios-config.js';
import axios from 'axios';
import { configureInternationalization } from './src/utils/Internationalization.js';

configureAxios(axios);

const App = () => {

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    configureInternationalization().then(() => setIsInitialized(true));
    SplashScreen.hide();
  }, []);

  if (!isInitialized) return <View />;
  else if (!isSignedIn) return <StartNavigation onLoginSuccess={() => setIsSignedIn(true)} />;
  else return <MainNavigation />;
};

export default App;
