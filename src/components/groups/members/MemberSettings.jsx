import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import Slider from '@react-native-community/slider';
import Color from '../../../constants';
import Text from '../../common/Text';
import Button from '../../common/Button';
import BottomPopup from '../../common/BottomPopup';

export default function MemberSettings({ group, onGroupEdit, onClose }) {
  const [closed, setClosed] = useState(group.closed);
  const [limit, setLimit] = useState(group.studentsLimit);

  const [closedLoading, setClosedLoading] = useState(false);
  const [limitLoading, setLimitLoading] = useState(false);

  function updateClosed(closed) {
    return group.link('groupClosed').put({ closed: closed }, setClosedLoading);
  }

  function updateLimit(limit) {
    return group
      .link('groupLimit')
      .put({ studentsLimit: limit }, setLimitLoading);
  }

  function onApply() {
    let updates = [];
    if (group.closed != closed) updates.push(updateClosed(closed));
    if (group.studentsLimit != limit) updates.push(updateLimit(limit));

    if (updates.length == 0) onClose();
    else {
      Promise.all(updates).then(() => {
        onGroupEdit({ ...group, studentsLimit: limit, closed: closed });
        onClose();
      });
    }
  }

  return (
    <BottomPopup title="Настройки участников" onClose={onClose}>
      <View style={{ padding: 20, paddingTop: 10 }}>
        <View style={styles.closed}>
          <Switch
            value={!closed}
            onValueChange={() => setClosed(!closed)}
            thumbColor={closed ? Color.veryLightGray : Color.primary}
          />
          <Text style={{ textAlign: 'center' }}>
            Группа {closed ? 'закрыта' : 'открыта'}
          </Text>
        </View>
        <View style={styles.limit}>
          <View style={styles.row}>
            <Text style={styles.label}>Ограничение количества учеников</Text>
            <Text style={styles.label}>{limit}</Text>
          </View>
          <Slider
            onValueChange={setLimit}
            minimumValue={group.studentsCount}
            maximumValue={50}
            value={group.studentsLimit}
            disabled={closed}
            thumbTintColor={Color.primary}
            step={1}
            style={{ width: '106%', marginHorizontal: '-3%' }}
          />
        </View>
        <Button
          title="Применить"
          onPress={onApply}
          disabled={limitLoading || closedLoading}
        />
      </View>
    </BottomPopup>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
    color: Color.gray,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closed: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  limit: {
    marginVertical: 30,
  },
});
