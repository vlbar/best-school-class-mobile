import React, { useState } from 'react';
import StartNavigation from './src/components/navigation/StartNavigation';
import MainNavigation from './src/components/navigation/MainNavigation';
import configureAxios from './config/axios-config';
import axios from 'axios';

configureAxios(axios);

const App = () => {

  const [isSignedIn, setIsSignedIn] = useState(false);

  return !isSignedIn ? (
    <StartNavigation onLoginSuccess={() => setIsSignedIn(true)} />
  ) : (
    <MainNavigation />
  );
};

export default App;
