import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import DatePicker from 'react-native-date-picker';

import BottomPopup from '../common/BottomPopup';
import Button from '../common/Button';
import { ButtonedConfirmationAlert } from '../common/ConfirmationAlert';
import { getCurrentLanguage, useTranslation } from '../../utils/Internationalization';

function DatePickerPopup({ show = true, title, date, onClose, onSelect }) {
  const { translate } = useTranslation();
  const [selectedDate, setDate] = useState(date ?? new Date());
  const [isConfirmAlertShow, setIsConfirmAlertShow] = useState(false);

  useEffect(() => {
    if (show) setDate(new Date(date));
  }, [show]);

  const onCloseHandle = () => {
    if (date.getTime() === selectedDate.getTime()) {
      onClose?.();
    } else {
      setIsConfirmAlertShow(true);
    }
  };

  const onConfirmHadler = () => {
    onSelect?.(selectedDate);
    onClose?.();
    setIsConfirmAlertShow(false);
  };

  return (
    <BottomPopup title={title} show={show} onClose={onCloseHandle}>
      <View style={styles.container}>
        <View style={{ justifyContent: 'center' }}>
          <View style={{ marginLeft: 30, marginBottom: 20 }}>
            <DatePicker
              date={selectedDate}
              onDateChange={setDate}
              androidVariant="nativeAndroid"
              locale={getCurrentLanguage().languageName}
              style={{ marginHorizontal: 'auto' }}
            />
          </View>
        </View>
        <Button title={translate('common.ok')} onPress={onConfirmHadler} />
      </View>
      <ButtonedConfirmationAlert
        show={isConfirmAlertShow}
        title={translate('common.applyChanges')}
        text={translate('common.applyChangesText')}
        onReject={() => {
          onClose?.();
          setIsConfirmAlertShow(false);
        }}
        onConfirm={onConfirmHadler}
      />
    </BottomPopup>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
});

export default DatePickerPopup;
