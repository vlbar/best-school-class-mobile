import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Color from '../../../constants';
import { MODIFY_HOMEWORK } from '../../../screens/course/ModifyHomework';
import Resource from '../../../utils/Hateoas/Resource';
import { useTranslation } from '../../../utils/Internationalization';
import BottomPopup from '../../common/BottomPopup';
import Button from '../../common/Button';
import Text from '../../common/Text';
import { useNavigation } from '@react-navigation/native';

function HomeworkPopup({ show = true, onClose }) {
  const { translate } = useTranslation();
  const navigation = useNavigation();

  const onCreateNew = () => {
    onClose?.();
    navigation.navigate(MODIFY_HOMEWORK);
  };

  return (
    <BottomPopup title={translate('homeworks.modify.start')} show={show} onClose={onClose}>
      <View style={styles.container}>
        <Text>{translate('homeworks.modify.select')}:</Text>
        <Text color={Color.silver} style={{ textAlign: 'center', marginVertical: 5 }}>
          {translate('homeworks.modify.or')}
        </Text>
        <Button title={translate('homeworks.modify.startNew')} onPress={onCreateNew} />
      </View>
    </BottomPopup>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
});

export default HomeworkPopup;
