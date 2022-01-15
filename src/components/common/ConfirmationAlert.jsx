import React, { useEffect } from 'react';
import { Alert } from 'react-native';

import { useTranslation } from '../../utils/Internationalization';

export default function ConfirmationAlert({ title, text, onConfirm, onReject, show = false, children }) {
  const { translate } = useTranslation();

  useEffect(() => {
    if (show) confirm();
  }, [show]);

  function confirm() {
    Alert.alert(title ?? translate('common.confirmation'), text, [
      {
        text: translate('common.cancel'),
        style: 'cancel',
        onPress: () => onReject?.(),
      },
      {
        text: translate('common.ok'),
        onPress: () => onConfirm?.(),
      },
    ]);
  }

  return children({ confirm });
}

export function ButtonedConfirmationAlert({ title, text, buttons, show = false }) {
  const { translate } = useTranslation();

  useEffect(() => {
    if (show) confirm();
  }, [show]);

  function confirm() {
    Alert.alert(title ?? translate('common.confirmation'), text, buttons);
  }

  return <></>;
}
