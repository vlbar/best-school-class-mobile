import React, { createContext, useEffect, useState } from 'react';
import SplashScreen from 'react-native-splash-screen';
import { View } from 'react-native';

import configureAxios from './src/config/axios-config';
import { configureInternationalization } from './src/utils/Internationalization';
import ProfileNavigation from './src/navigation/ProfileNavigation';
import StartNavigation from './src/navigation/StartNavigation';

export const TemporaryLoginContext = createContext();

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    Promise.all([configureAxios(() => setIsSignedIn(false)), configureInternationalization()]).then(() =>
      setIsInitialized(true),
    );
  }, []);

  useEffect(() => {
    if (isInitialized) SplashScreen.hide();
  }, [isInitialized]);

  return (
    <TemporaryLoginContext.Provider value={{ setIsSignedIn }}>
      {!isInitialized && <View />}
      {isInitialized && !isSignedIn && <StartNavigation />}
      {isInitialized && isSignedIn && <ProfileNavigation />}
    </TemporaryLoginContext.Provider>
  );
};

export default App;
