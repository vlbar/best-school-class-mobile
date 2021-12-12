import React from 'react';
import { StyleSheet, View } from 'react-native';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';

import Color from '../../constants';
import Container from '../../components/common/Container';
import Header from '../../components/navigation/Header';
import Text from '../../components/common/Text';
import { translate } from '../../utils/Internationalization';

const user = { firstName: 'Олег', secondName: 'Незабудкин', middleName: 'Прокопьевич', email: 'kek@kek.ru' }

export const WORKSPACE_SCREEN = 'workspace';
function Workspace() {
  const nearestLessonTime = moment.duration(3, 'day').humanize();

  return (
    <>
      <Header title={translate('workspace.title')} />
      <Container>
        <View style={[styles.plannedLessonAlert, styles.notStarted]}>
          <Text weight='bold' style={[styles.alertText]}>{translate('workspace.planned-lesson.not-started')}</Text>
          <Text style={[styles.alertText]}>{translate('workspace.planned-lesson.nearest-from')}:</Text>
          <Text style={[styles.alertText]}>{nearestLessonTime}</Text>
        </View>
        <View style={styles.timetableToday}>
          <Icon name='calendar-outline' size={28} />
          <Text style={styles.timetableTodayTitle}>{translate('workspace.timetable-today.title')}</Text>
        </View>
        <Text style={styles.timetableTodayNoLessons}>{translate('workspace.timetable-today.no-lessons')}</Text>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  plannedLessonAlert: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  notStarted: {
    backgroundColor: Color.lightPrimary,
  },
  alertText: {
    textAlign: 'center',
    color: Color.white,
    fontSize: 16,
  },
  timetableToday: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timetableTodayTitle: {
    marginLeft: 10,
  },
  timetableTodayNoLessons: {
    marginTop: 10,
    textAlign: 'center',
    color: Color.silver,
    fontSize: 14,
  }
});

export default Workspace;
