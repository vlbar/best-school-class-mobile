import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import StartNavigation from './src/components/navigation/StartNavigation';
import MainNavigation from './src/components/navigation/MainNavigation';
import { configureInternationalization } from './src/utils/Internationalization';

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    configureInternationalization().then(() => setIsInitialized(true));
  }, []);

  if (!isInitialized) return <View />;
  else if (!isSignedIn) return <StartNavigation onLoginSuccess={() => setIsSignedIn(true)} />;
  else return <MainNavigation />;
};

export default App;
