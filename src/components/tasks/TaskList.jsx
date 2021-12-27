import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableNativeFeedback, Alert } from 'react-native';

import Bandage from './filters/Bandage';
import Color from '../../constants';
import IconButton from '../common/IconButton';
import ProcessView from '../common/ProcessView';
import SearchBar from './../common/SearchBar';
import TaskFilterPopup from './filters/TaskFilterPopup';
import Text from '../common/Text';
import { MODIFY_TASK_TYPE_SCREEN } from '../../screens/course/ModifyTaskType';
import { translate } from '../../utils/Internationalization';
import { useIsFocused, useNavigation } from '@react-navigation/native';

// colors
const taskTypesColors = ['#69c44d', '#007bff', '#db4242', '#2cc7b2', '#8000ff', '#e68e29', '#d4d5d9', '#38c7d1'];
export function getTaskTypeColor(id) {
  return taskTypesColors[id % taskTypesColors.length];
}

export function clearHtmlTags(htmlString) {
  if (!htmlString) return;
  return htmlString.replace(/<[^>]*>?/gm, '').trim();
}

export const defaultOrder = 'name-asc';

function TaskList({
  data,
  parentCourse,
  canFetch = true,
  showHeader = true,
  canSelect = false,
  headerContent,
  actionMenuContent,
  onSelect,
  onTaskPress,
}) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [tasks, setTasks] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const nextPage = useRef(undefined);
  const lastParentCourse = useRef(undefined);

  const [refreshOffset, setRefreshOffset] = useState(0);
  const needOpenPopupAfterMount = useRef(false);
  const [isTaskFiltersShow, setIsTaskFiltersShow] = useState(false);

  const [isActionMenuShow, setIsActionMenuShow] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);

  const filterParams = useRef({
    name: '',
    taskTypeId: null,
    orderBy: defaultOrder,
  });

  useEffect(() => {
    if (isFocused) {
      if (needOpenPopupAfterMount.current) {
        setIsTaskFiltersShow(true);
      }
    }
  }, [isFocused]);

  useEffect(() => {
    if (isTaskFiltersShow) needOpenPopupAfterMount.current = false;
  }, [isTaskFiltersShow]);

  useEffect(() => {
    if (lastParentCourse.current !== parentCourse && canFetch) {
      lastParentCourse.current = parentCourse;
      if (parentCourse !== null) {
        fetchFirstPage();
      } else {
        setTasks([]);
        setIsFetching(false);
      }
    }
  }, [parentCourse, canFetch]);

  useEffect(() => {
    if (!data && !canFetch) {
      if (parentCourse !== null) setIsFetching(true);
      setTasks([]);
      closeActionMenu();
    }
  }, [parentCourse]);

  function fetchTasks(link) {
    link
      ?.fetch(setIsFetching)
      .then(page => {
        let fetchedTasks = page.list('tasks') ?? [];
        nextPage.current = page.link('next');

        if (page.page.number == 1) setTasks(fetchedTasks);
        else setTasks([...tasks, ...fetchedTasks]);
      })
      .catch(error => console.log('Не удалось загрузить список курсов.', error));
  }

  const refreshPage = () => {
    if (!parentCourse) setTasks([]);
    fetchTasks(parentCourse.link('tasks'));
  };

  const fetchFirstPage = () => {
    if (!parentCourse) {
      setTasks([]);
      return;
    }

    fetchTasks(
      parentCourse
        .link('tasks')
        .fill('name', filterParams.current.name ?? '')
        .fill('taskTypeId', filterParams.current.taskTypeId ?? null)
        .fill('order', filterParams.current.orderBy),
    );
  };

  const fetchNextPage = () => {
    fetchTasks(nextPage.current);
  };

  const setFilterParams = params => {
    setIsTaskFiltersShow(false);
    filterParams.current = params;
    fetchFirstPage();
  };

  const searchByName = name => {
    filterParams.current.name = name;
    fetchFirstPage();
  };

  const addTaskType = taskType => {
    setIsTaskFiltersShow(false);
    needOpenPopupAfterMount.current = true;
    navigation.navigate(MODIFY_TASK_TYPE_SCREEN, { taskTypeName: taskType.name, taskTypeId: taskType.id });
  };

  // action menu
  const closeActionMenu = () => {
    setIsActionMenuShow(false);
    setSelectedTasks([]);
  };

  const taskLongPress = task => {
    if (canSelect === false) return;

    let targetSelectedTasks = [];
    if (isActionMenuShow) {
      if (selectedTasks.includes(task)) {
        targetSelectedTasks = selectedTasks.filter(x => x.id !== task.id);
        if (targetSelectedTasks.length === 0) setIsActionMenuShow(false);
      } else {
        targetSelectedTasks = [...selectedTasks, task];
      }
    } else {
      setIsActionMenuShow(true);
      targetSelectedTasks = [task];
    }

    setSelectedTasks(targetSelectedTasks);
    onSelect?.(task, targetSelectedTasks);
  };

  const deleteSelectedTasks = async () => {
    setIsFetching(true);
    for await (const task of selectedTasks) {
      await task.link().delete();
    }

    refreshPage();
  };

  const title = translate('common.confirmation');
  const confirmation = translate('tasks.action.delete-confirmation');
  const ok = translate('common.ok');
  const cancel = translate('common.cancel');

  function showDeleteTasksAlert() {
    Alert.alert(title, confirmation, [
      {
        text: cancel,
        style: 'cancel',
      },
      { text: ok, onPress: () => deleteSelectedTasks() },
    ]);
  }

  // render
  const renderCourseItem = ({ item }) => {
    const isSelected = selectedTasks.find(x => x.id === item.id) !== undefined;
    const description = clearHtmlTags(item.description);
    return (
      <TouchableNativeFeedback
        onPress={() => (isActionMenuShow ? taskLongPress(item) : onTaskPress?.(item))}
        onLongPress={() => !isActionMenuShow && taskLongPress(item)}
      >
        <View style={[styles.task, isSelected && styles.selected]}>
          <View style={styles.titleRow}>
            <Text weight="medium" style={styles.title}>
              {item.name}
            </Text>
            {item.taskType && <Bandage color={getTaskTypeColor(item.taskType.id)} title={item.taskType.name} />}
          </View>
          {description?.length && (
            <Text style={styles.description} numberOfLines={1}>
              {description}
            </Text>
          )}
        </View>
      </TouchableNativeFeedback>
    );
  };

  const loadingItemsIndicator = () => {
    return isFetching && !tasks.length ? (
      <View>
        <View style={[styles.fetchingViewContainer]}>
          <ProcessView style={[styles.fetchingView, { width: '70%' }]} />
          <ProcessView style={[styles.fetchingView, { width: '50%' }]} />
        </View>
        <View style={[styles.fetchingViewContainer]}>
          <ProcessView style={[styles.fetchingView, { width: '70%' }]} />
          <ProcessView style={[styles.fetchingView, { width: '50%' }]} />
        </View>
      </View>
    ) : (
      <></>
    );
  };

  const headerLayoutHandler = event => {
    setRefreshOffset(event.nativeEvent.layout.height);
  };

  const isHasFilters = filterParams.current.taskTypeId !== null || filterParams.current.orderBy !== defaultOrder;
  const listHeader = (
    <View onLayout={headerLayoutHandler} style={[styles.listHeader]}>
      {headerContent}
      <SearchBar placeholder={translate('tasks.search')} style={styles.searchBar} onSearch={searchByName}>
        <SearchBar.IconButton name="filter-outline" onPress={() => setIsTaskFiltersShow(true)} />
        {isHasFilters && <View style={styles.hasFilters} />}
      </SearchBar>
    </View>
  );

  const defaultActionMenu = (
    <>
      {selectedTasks?.length === 1 && (
        <IconButton name="create-outline" size={24} style={styles.actionIcon} onPress={() => {}} />
      )}
      <IconButton name="trash-outline" size={24} style={styles.actionIcon} onPress={showDeleteTasksAlert} />
    </>
  );

  const actionMenuContainer = (
    <View style={styles.actionHeader}>
      <View style={[styles.listHeader]}>
        {headerContent}
        <View style={[styles.actionMenu]}>
          <View style={[styles.actionRow]}>
            <IconButton name="close-outline" onPress={closeActionMenu} />
            <Text style={[styles.selectedCount]}>{selectedTasks.length}</Text>
          </View>
          {<View style={[styles.actionRow]}>{actionMenuContent ?? defaultActionMenu}</View>}
        </View>
      </View>
    </View>
  );

  const emptyTasks = () => {
    let emptyText;
    if (!isFetching) {
      if (data) emptyText = 'tasks.empty';
      else {
        if (parentCourse) emptyText = 'tasks.empty';
        else emptyText = 'tasks.course-not-selected';
      }
    }

    if (emptyText) return <Text style={styles.emptyTasks}>{translate(emptyText)}</Text>;
    else return <View />;
  };

  return (
    <View style={[styles.container]}>
      {isActionMenuShow && actionMenuContainer}
      <FlatList
        data={data ?? tasks}
        renderItem={renderCourseItem}
        keyExtractor={item => item.id}
        refreshing={isFetching}
        ListHeaderComponent={showHeader && listHeader}
        stickyHeaderIndices={[0]}
        stickyHeaderHiddenOnScroll={true}
        ListFooterComponent={loadingItemsIndicator}
        ListEmptyComponent={emptyTasks}
        progressViewOffset={refreshOffset}
        onRefresh={!data && refreshPage}
        onEndReached={!data && fetchNextPage}
        onEndReachedThreshold={0.7}
      />
      <TaskFilterPopup
        show={isTaskFiltersShow}
        onApply={setFilterParams}
        onClose={() => setIsTaskFiltersShow(false)}
        onAddTaskType={addTaskType}
        isNeedRefesh={needOpenPopupAfterMount.current}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  smallContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  container: {
    flex: 1,
  },
  emptyTasks: {
    paddingTop: 10,
    textAlign: 'center',
  },
  searchBar: {
    marginBottom: 0,
  },
  task: {
    paddingVertical: 8,
    marginVertical: 2,
    paddingHorizontal: 10,
  },
  selected: {
    backgroundColor: Color.grayPrimary,
    borderRadius: 10,
  },
  selectedCount: {
    marginStart: 4,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  title: {
    marginRight: 10,
  },
  description: {
    color: Color.silver,
  },
  fetchingViewContainer: {
    marginVertical: 8,
  },
  fetchingView: {
    height: 21,
    marginVertical: 3,
  },
  hasFilters: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: Color.primary,
  },
  listHeader: {
    backgroundColor: Color.white,
    marginHorizontal: 10,
  },
  actionHeader: {
    position: 'absolute',
    width: '100%',
    top: 0,
    zIndex: 2,
    elevation: 2,
  },
  actionMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    backgroundColor: Color.white,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default TaskList;
