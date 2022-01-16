import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Pressable, ScrollView, Vibration, ToastAndroid, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import Bandage from './Bandage';
import BottomPopup from './../../common/BottomPopup';
import Button from '../../common/Button';
import Color from '../../../constants';
import Resource from '../../../utils/Hateoas/Resource';
import SearchBar from './../../common/SearchBar';
import Text from '../../common/Text';
import { useTranslation } from '../../../utils/Internationalization';
import { getTaskTypeColor, defaultOrder } from './../TaskList';

const baseUrl = '/v1/task-types';
const baseLink = Resource.basedOnHref(baseUrl).link();
const pageLink = baseLink.fill('size', 20);

function TaskFilterPopup({ show, onApply, onClose, onAddTaskType, isNeedRefesh = false }) {
  const { translate } = useTranslation();

  const orders = {
    'name-asc': translate('tasks.sortBy.name'),
    'createdAt-desc': translate('tasks.sortBy.newest'),
    'createdAt-asc': translate('tasks.sortBy.oldest'),
    'isCompleted-desc': translate('tasks.sortBy.completed'),
  };

  const [orderBy, setOrderBy] = useState(defaultOrder);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const [taskTypes, setTaskTypes] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const nextPage = useRef(undefined);

  const filterParams = useRef({
    name: '',
  });

  useEffect(() => {
    if ((show && !taskTypes.length) || isNeedRefesh) fetchFirstPage();
  }, [show]);

  const fetchFirstPage = () => {
    fetchTypes(pageLink.fill('name', filterParams.current.name));
  };

  const fetchTypes = link => {
    link
      ?.fetch(setIsFetching)
      .then(page => {
        let types = page.list('taskTypes') ?? [];
        nextPage.current = page.link('next');

        if (page.page.number == 1) setTaskTypes(types);
        else setTaskTypes([...taskTypes, ...types]);
      })
      .catch(error => console.error('Не удалось загрузить список типов заданий.', error));
  };

  const selectType = type => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(x => x.id !== type.id));
    } else {
      //setSelectedTypes([...selectedTypes, type]); TODO: multy types filtering on backend
      setSelectedTypes([type]);
    }
  };

  const onApplyHandler = () => {
    const selectedType = selectedTypes?.[0];
    onApply({
      orderBy,
      taskTypeId: selectedType?.id ?? null,
    });
  };

  const onCancelHandler = () => {
    setOrderBy(defaultOrder);
    setSelectedTypes([]);

    onApply({
      orderBy: defaultOrder,
      taskTypeId: null,
    });
  };

  const onSearch = name => {
    filterParams.current.name = name;
    fetchFirstPage();
  };

  const onTaskTypeLongPress = taskType => {
    if (taskType && taskType.creatorId === null) {
      Vibration.vibrate(400);
      ToastAndroid.show(translate('task-types.modify.modifyDefaultNotAllowed'), ToastAndroid.LONG);
    } else onAddTaskType(taskType);
  };

  // render
  const emptyTypes = <Text style={{ textAlign: 'center' }}>{translate('common.filters.empty-filtered')}</Text>;

  return (
    <BottomPopup title={translate('common.filters.title')} show={show} onClose={onClose}>
      <View style={styles.container}>
        <Text>{translate('tasks.sortBy.title')}</Text>
        <View style={styles.bandageList}>
          {Object.keys(orders).map((order, index) => {
            return (
              <Pressable key={index} onPress={() => setOrderBy(order)} style={styles.bandage}>
                <Bandage
                  title={orders[order]}
                  size={18}
                  color={order === orderBy ? Color.primary : Color.veryLightGray}
                />
              </Pressable>
            );
          })}
        </View>
        <View style={styles.filterHeader}>
          <Text>{translate('tasks.filters.task-types.title')}</Text>
          <Pressable onPress={onAddTaskType}>
            <Text color={Color.silver}>{translate('tasks.filters.task-types.add')}</Text>
          </Pressable>
        </View>
        <SearchBar
          placeholder={translate('task-types.search')}
          style={styles.searchBar}
          onDelayStart={() => setIsFetching(true)}
          onSearch={onSearch}
        />
        <ScrollView horizontal fadingEdgeLength={50} contentContainerStyle={styles.filterList}>
          {!isFetching &&
            taskTypes.map(taskType => {
              return (
                <Pressable
                  key={taskType.id}
                  style={[styles.bandage]}
                  onPress={() => selectType(taskType)}
                  onLongPress={() => onTaskTypeLongPress(taskType)}
                >
                  <Bandage
                    title={taskType.name}
                    size={18}
                    color={selectedTypes.includes(taskType) ? getTaskTypeColor(taskType.id) : Color.veryLightGray}
                  >
                    {taskType.creatorId !== null && (
                      <>
                        {'  '}
                        <Icon name={'ellipsis-horizontal-outline'} size={20} />
                      </>
                    )}
                  </Bandage>
                </Pressable>
              );
            })}
        </ScrollView>
        {isFetching && (
          <ActivityIndicator size={30} color={Color.primary} style={{ width: '100%', marginVertical: 10 }} />
        )}
        {!taskTypes?.length && !isFetching && emptyTypes}
        {!isFetching && (
          <Text fontSize={14} color={Color.silver} style={{ textAlign: 'center' }}>
            *{translate('task-types.longPressToModify')}
          </Text>
        )}
        <View style={styles.filterHeader}>
          <Pressable onPress={onCancelHandler}>
            <Text color={Color.silver} fontSize={16}>
              {translate('common.filters.cancel-all')}
            </Text>
          </Pressable>
          <Button title={translate('common.filters.apply')} onPress={onApplyHandler} style={styles.apply} />
        </View>
      </View>
    </BottomPopup>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  bandageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  bandage: {
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 999,
    textAlign: 'center',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  filterList: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    maxHeight: 130,
    marginTop: 10,
  },
  searchBar: {
    marginTop: 10,
  },
  apply: {
    flex: 0,
    paddingHorizontal: 20,
  },
});

export default TaskFilterPopup;
