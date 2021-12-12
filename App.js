import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import SplashScreen from 'react-native-splash-screen';
import { View } from 'react-native';

import configureAxios from './config/axios-config';
import ProfileNavigation from './src/navigation/ProfileNavigation';
import StartNavigation from './src/navigation/StartNavigation';
import { configureInternationalization } from './src/utils/Internationalization';

configureAxios(axios);

export const TemporaryLoginContext = createContext();


const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    configureInternationalization().then(() => setIsInitialized(true));
    SplashScreen.hide();
  }, []);

  return (
    <TemporaryLoginContext.Provider value={{ setIsSignedIn }}>
      {!isInitialized && <View />}
      {isInitialized && !isSignedIn && <StartNavigation />}
      {isInitialized && isSignedIn && <ProfileNavigation />}
    </TemporaryLoginContext.Provider>
  );
};

export default App;
