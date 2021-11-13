import React, { useState } from 'react';
import MainNavigation from './src/navigation/MainNavigation';
import StartNavigation from './src/navigation/StartNavigation';
import { configureInternationalization } from './src/utils/Internationalization';

configureInternationalization();

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  return isSignedIn ? (
    <StartNavigation onLoginSuccess={() => setIsSignedIn(true)} />
  ) : (
    <MainNavigation />
  );
};

export default App;
