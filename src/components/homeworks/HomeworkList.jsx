import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableNativeFeedback, View } from 'react-native';
import Color from '../../constants';
import Link from '../../utils/Hateoas/Link';
import Resource from '../../utils/Hateoas/Resource';
import { getCurrentLanguage, useTranslation } from '../../utils/Internationalization';
import Text from '../common/Text';
import { GroupItem } from '../groups/GroupSelect';
import HomeworkDate from './HomeworkDate';

const HOMEWORK_URL = 'v1/homeworks';
const fetchLink = new Link(HOMEWORK_URL);

export default function HomeworkList({ active, role, order, groupId, containerStyles, onSelect }) {
  const { translate } = useTranslation();
  const homeworkPage = useRef(Resource.based(fetchLink));
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const currentLanguage = getCurrentLanguage();

  useEffect(() => {
    if (active && fetchLink && !homeworkPage.current)
      fetchPage(fetchLink.fill('role', role).fill('order', order).fill('groupId', groupId));
  }, [active]);

  useEffect(() => {
    setHomeworks([]);
    homeworkPage.current = null;
    if (active) fetchPage(fetchLink.fill('role', role).fill('order', order).fill('groupId', groupId));
  }, [role, order, groupId]);

  function fetchPage(link, refresh = false) {
    link?.fetch(refresh ? setRefreshing : setLoading).then(page => {
      homeworkPage.current = page;
      let newHomeworks = page.list('homeworks') ?? [];

      if (page.page.number == 1) setHomeworks(newHomeworks);
      else setHomeworks([...homeworks, ...newHomeworks]);
    });
  }

  function onNext() {
    fetchPage(homeworkPage.current?.link('next'));
  }

  function onRefresh() {
    fetchPage(homeworkPage.current?.link('first'), true);
  }

  return (
    <FlatList
      ListEmptyComponent={
        !loading && <Text style={[styles.emptyMessage, styles.emptyText]}>{translate('homeworks.empty')}</Text>
      }
      ListFooterComponent={loading && <ActivityIndicator color={Color.primary} size={50} />}
      ListFooterComponentStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
      contentContainerStyle={[containerStyles, { flexGrow: 1 }]}
      onEndReached={onNext}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onEndReachedThreshold={0.7}
      data={homeworks}
      renderItem={({ item }) => {
        return (
          <View style={[styles.homework]}>
            <TouchableNativeFeedback onPress={() => onSelect?.(item)}>
              <View>
                <View style={styles.row}>
                  <Text>{translate('homeworks.homework')}</Text>
                  <Text style={styles.tasks}>
                    {translate('homeworks.taskCount_interval', {
                      postProcess: 'interval',
                      count: item.tasks?.length,
                    })}
                  </Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.group}>
                    <GroupItem
                      group={item.group}
                      circleStyle={styles.groupCircle}
                      textStyle={[styles.subtext, styles.groupName]}
                    />
                  </View>
                  <HomeworkDate date={item.endingDate} until style={[styles.time, styles.subtext]} />
                </View>
              </View>
            </TouchableNativeFeedback>
          </View>
        );
      }}
      keyExtractor={item => item.id}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  emptyMessage: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    color: Color.silver,
  },
  homework: {
    marginBottom: 10,
  },
  tasks: {
    fontSize: 16,
  },
  groupCircle: {
    width: 18,
    height: 18,
  },
  subtext: {
    fontSize: 16,
    color: Color.silver,
  },
  group: {
    flexGrow: 1,
  },
  groupName: {
    marginLeft: 5,
  },
  time: {
    marginLeft: 10,
    flexShrink: 1,
  },
});
