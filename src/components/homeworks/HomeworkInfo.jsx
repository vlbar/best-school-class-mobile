import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Color from '../../constants';
import { useTranslation } from '../../utils/Internationalization';
import Text from '../common/Text';
import { GroupItem } from '../groups/GroupSelect';
import UserName from '../user/UserName';
import HomeworkDate from './HomeworkDate';

export default function HomeworkInfo({ homework }) {
  const { translate } = useTranslation();
  const [creator, setCreator] = useState(null);

  useEffect(() => {
    if (homework) homework.link('creator').fetch().then(setCreator);
  }, [homework]);

  if (!creator)
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Color.primary} size={50} />
      </View>
    );
  else
    return (
      <>
        <View style={styles.row}>
          <Text>{translate('homeworks.details.info.group')}</Text>
          <View style={styles.infoContainer}>
            <GroupItem group={homework.group} textStyle={[styles.infoText, { flex: 0 }]} />
          </View>
        </View>
        <View style={styles.row}>
          <Text>{translate('homeworks.details.info.appointed')}</Text>
          <View style={styles.infoContainer}>
            <UserName user={creator} style={styles.infoText} numberOfLines={1} />
          </View>
        </View>
        <View style={styles.row}>
          <Text>{translate('homeworks.details.info.deadline')}</Text>
          <View style={[styles.row, styles.infoContainer, { flexWrap: 'wrap' }]}>
            <HomeworkDate style={styles.infoText} date={homework.openingDate} />
            <HomeworkDate style={styles.infoText} until date={homework.endingDate} />
          </View>
        </View>
      </>
    );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoContainer: {
    marginLeft: 40,
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: Color.silver,
    marginLeft: 3,
    textAlign: 'right',
  },
  loading: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
