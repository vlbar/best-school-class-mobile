import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SplashScreen from 'react-native-splash-screen';
import { View } from 'react-native';

import configureAxios from './config/axios-config';
import ProfileNavigation from './src/navigation/ProfileNavigation';
import StartNavigation from './src/navigation/StartNavigation';
import { configureInternationalization } from './src/utils/Internationalization';

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
  else return <ProfileNavigation />;
};

export default App;
