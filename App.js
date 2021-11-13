import React, { useState } from 'react';
import ProfileNavigation from './src/navigation/ProfileNavigation';
import StartNavigation from './src/navigation/StartNavigation';
import { configureInternationalization } from './src/utils/Internationalization';

configureInternationalization();

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  return isSignedIn ? (
    <StartNavigation onLoginSuccess={() => setIsSignedIn(true)} />
  ) : (
    <ProfileNavigation />
  );
};

export default App;
