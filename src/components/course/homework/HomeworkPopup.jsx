import React, { useContext } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import BottomPopup from '../../common/BottomPopup';
import Button from '../../common/Button';
import Color from '../../../constants';
import HomeworkList from '../../homeworks/HomeworkList';
import Text from '../../common/Text';
import { CourseNavigationContext } from '../CourseNavigationContext';
import { MODIFY_HOMEWORK } from '../../../screens/course/ModifyHomework';
import { ProfileContext } from '../../../navigation/NavigationConstants';
import { useTranslation } from '../../../utils/Internationalization';

function HomeworkPopup({ show = true, onClose }) {
  const { translate } = useTranslation();
  const navigation = useNavigation();
  const { state } = useContext(ProfileContext);
  const { setContextHomework } = useContext(CourseNavigationContext);

  const onCreateNew = () => {
    onClose?.();
    navigation.navigate(MODIFY_HOMEWORK);
  };

  const editHomework = homework => {
    onClose?.();
    setContextHomework(homework);
    navigation.navigate(MODIFY_HOMEWORK);
  };

  return (
    <BottomPopup title={translate('homeworks.modify.start')} show={show} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.margin}>{translate('homeworks.modify.select')}:</Text>
        <View style={{ maxHeight: Dimensions.get('window').height / 2.3 }}>
          <HomeworkList
            active={true}
            role={state.name}
            order="openingDate-desc"
            containerStyles={{ paddingHorizontal: 20 }}
            onSelect={editHomework}
          />
        </View>
        <Text color={Color.silver} style={{ textAlign: 'center', marginVertical: 5 }}>
          {translate('homeworks.modify.or')}
        </Text>
        <Button title={translate('homeworks.modify.startNew')} onPress={onCreateNew} style={styles.margin} />
      </View>
    </BottomPopup>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  margin: {
    marginHorizontal: 20,
  },
});

export default HomeworkPopup;
