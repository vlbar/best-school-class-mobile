import React, { useState } from 'react';
import { StyleSheet, TouchableHighlight, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import Color from '../../../constants';
import HomeworkPopup from './HomeworkPopup';
import IconButton from './../../common/IconButton';
import Text from '../../common/Text';
import { MODIFY_HOMEWORK } from '../../../screens/course/ModifyHomework';
import { useTranslation } from '../../../utils/Internationalization';
import { GroupItem } from '../../groups/GroupSelect';

function HomeworkBuilderPanel({ homework, onCancel }) {
  const { translate } = useTranslation();
  const navigation = useNavigation();
  const [isHomeworkPopupShow, setIsHomeworkPopupShow] = useState(false);

  const openHomeworkEditor = () => {
    if (!homework) {
      setIsHomeworkPopupShow(true);
    } else {
      navigation.navigate(MODIFY_HOMEWORK);
    }
  };

  const isHomeworkExsists = homework !== undefined;
  return (
    <>
      <TouchableHighlight onPress={openHomeworkEditor} style={styles.touchableHightlight}>
        <View style={[styles.panel, !isHomeworkExsists && styles.closed]}>
          <View style={styles.flexRowBetween}>
            <View style={[styles.directionRow]}>
              <Icon name="school-outline" size={17} style={styles.colorWhite} />
              <Text style={[styles.panelHeaderText, { marginLeft: 10 }]} weight="medium">
                {translate('homeworks.homework')}
              </Text>
            </View>
            {isHomeworkExsists ? (
              <IconButton
                name="close-outline"
                size={21}
                color={Color.white}
                style={{ padding: 0 }}
                onPress={() => onCancel?.()}
              />
            ) : (
              <Text style={styles.panelText}>{translate('homeworks.modify.start')}</Text>
            )}
          </View>
          <View style={styles.homeworkInfoRow}>
            <Text style={styles.panelText}>{translate('homeworks.modify.group')}:</Text>
            <View style={{ flexShrink: 1, marginHorizontal: 8}}>
              {homework?.group ? (
                <GroupItem group={homework.group} circleStyle={styles.groupCircle} textStyle={styles.groupName} />
              ) : (
                <Text style={styles.panelText}>{translate('homeworks.modify.noGroup')}</Text>
              )}
            </View>
            <View style={{flexGrow: 1}}>
              <Text style={[styles.panelText, {textAlign: 'right'}]}>
                {translate('homeworks.taskCount_interval', {
                  postProcess: 'interval',
                  count: homework?.tasks?.length,
                })}
              </Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
      <HomeworkPopup show={isHomeworkPopupShow} onClose={() => setIsHomeworkPopupShow(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  touchableHightlight: {
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  panel: {
    backgroundColor: Color.lightPrimary,
    padding: 12,
    borderRadius: 10,
  },
  groupCircle: {
    width: 18,
    height: 18,
    borderWidth: 3,
    borderColor: Color.white,
  },
  groupName: {
    color: Color.white,
    fontSize: 14,
    flex: 0,
  },
  closed: {
    height: 45,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelHeaderText: {
    color: Color.white,
    fontSize: 15,
  },
  panelText: {
    color: Color.white,
    fontSize: 14,
  },
  homeworkInfoRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorWhite: {
    color: Color.white,
  },
});

export default HomeworkBuilderPanel;
