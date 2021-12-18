import React, { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

function useIsKeyboardShow() {
  const [isKeyboardShow, setIsKeyboardShow] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardShow(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardShow(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return isKeyboardShow;
}

export default useIsKeyboardShow;
