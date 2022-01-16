import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableNativeFeedback, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';

import Bandage from './filters/Bandage';
import Color from '../../constants';
import IconButton from '../common/IconButton';
import SearchBar from './../common/SearchBar';
import TaskFilterPopup from './filters/TaskFilterPopup';
import Text from '../common/Text';
import { MODIFY_TASK_TYPE_SCREEN } from '../../screens/course/ModifyTaskType';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useTranslation } from '../../utils/Internationalization';

// colors
const taskTypesColors = ['#69c44d', '#007bff', '#db4242', '#2cc7b2', '#8000ff', '#e68e29', '#d4d5d9', '#38c7d1'];
export function getTaskTypeColor(id) {
  return taskTypesColors[id % taskTypesColors.length];
}

export function clearHtmlTags(htmlString) {
  if (!htmlString) return;
  return htmlString.replace(/<[^>]*>?/gm, '');
}

export const defaultOrder = 'name-asc';

function TaskList(
  {
    data,
    parentCourse,
    canFetch = true,
    showHeader = true,
    canSelect = false,
    headerContent,
    additionalHeaderContent,
    actionMenuContent,
    additionalEmptyMessage,
    onSelect,
    onTaskPress,
    onPushSelected,
    style,
  },
  ref,
) {
  const { translate } = useTranslation();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [tasks, setTasks] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isRefresing, setIsRefresing] = useState(false);
  const [isHasError, setIsHasError] = useState(false);
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

  useImperativeHandle(ref, () => ({
    refresh: () => {
      refreshPage();
    },
    updateTask: task => {
      const prevTasks = tasks;
      const targetIndex = prevTasks.findIndex(x => x.id === task.id);
      if (targetIndex > -1) {
        prevTasks[targetIndex] = task;
        setTasks([...prevTasks]);
      } else {
        setTasks(
          [...prevTasks, task].sort((a, b) =>
            a.name.toLowerCase() > b.name.toLowerCase() ? 1 : b.name.toLowerCase() > a.name.toLowerCase() ? -1 : 0,
          ),
        );
      }
    },
  }));

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

  useEffect(() => {
    if (canFetch === false) {
      const existsSelectedTasks = selectedTasks.filter(task => {
        return data.find(x => task.id === x.id);
      });
      setSelectedTasks(existsSelectedTasks);
      if (!existsSelectedTasks.length) closeActionMenu();
    }
  }, [data]);

  function fetchTasks(link, isRefres = false) {
    link
      ?.fetch(isRefres ? setIsRefresing : setIsFetching)
      .then(page => {
        let fetchedTasks = page.list('tasks') ?? [];
        nextPage.current = page.link('next');

        if (page.page.number == 1) setTasks(fetchedTasks);
        else setTasks([...tasks, ...fetchedTasks]);
        setIsHasError(false);
      })
      .catch(error => {
        console.log('Не удалось загрузить список курсов.', error);
        setIsHasError(true);
      });
  }

  const fetchPage = (isRefres = false) => {
    if (!parentCourse) {
      setTasks([]);
      return;
    }
    fetchTasks(parentCourse.link('tasks'), isRefres);
  };

  const refreshPage = () => {
    fetchPage(true);
  };

  const fetchNextPage = () => {
    fetchTasks(nextPage.current);
  };

  const updatePage = () => {
    if (tasks.length > 0) fetchNextPage();
    else fetchPage();
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
    if (taskType && taskType.creatorId === null) return;
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

  const pushSelectedTasks = () => {
    closeActionMenu();
    onPushSelected?.(selectedTasks);
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
  const renderTaskItem = ({ item }) => {
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
          <Text style={styles.description} numberOfLines={1}>
            {description?.length ? description : translate('tasks.noDescription')}
          </Text>
        </View>
      </TouchableNativeFeedback>
    );
  };

  const loadingItemsIndicator = isFetching ? (
    !tasks.length && <ActivityIndicator color={Color.primary} size={50} />
  ) : (
    <>
      {isHasError && (
        <TouchableOpacity activeOpacity={0.7} onPress={updatePage}>
          <View style={{ marginVertical: 20 }}>
            <Text color={Color.silver} style={{ textAlign: 'center' }}>
              {translate('common.error')}
            </Text>
            <Text style={{ textAlign: 'center' }}>{translate('common.refresh')}</Text>
          </View>
        </TouchableOpacity>
      )}
    </>
  );

  const defaultActionMenu = (
    <>
      {selectedTasks?.length === 1 && (
        <IconButton
          name="create-outline"
          size={24}
          style={styles.actionIcon}
          onPress={() => onTaskPress(selectedTasks[0])}
        />
      )}
      <IconButton name="push-outline" size={24} style={styles.actionIcon} onPress={pushSelectedTasks} />
      <IconButton name="trash-outline" size={24} style={styles.actionIcon} onPress={showDeleteTasksAlert} />
    </>
  );

  const headerLayoutHandler = event => {
    setRefreshOffset(event.nativeEvent.layout.height);
  };

  const isHasFilters = filterParams.current.taskTypeId !== null || filterParams.current.orderBy !== defaultOrder;
  const listHeader = (
    <>
      <View onLayout={headerLayoutHandler} style={[styles.listHeader, refreshOffset && { height: refreshOffset }]}>
        {additionalHeaderContent}
        {!isActionMenuShow && headerContent && headerContent}
        {!isActionMenuShow && !headerContent && showHeader && (
          <SearchBar placeholder={translate('tasks.search')} style={styles.searchBar} onSearch={searchByName}>
            <SearchBar.IconButton name="filter-outline" onPress={() => setIsTaskFiltersShow(true)} />
            {isHasFilters && <View style={styles.hasFilters} />}
          </SearchBar>
        )}
        {isActionMenuShow && (
          <View style={[styles.actionMenu]}>
            <View style={[styles.actionRow]}>
              <IconButton name="close-outline" onPress={closeActionMenu} />
              <Text style={[styles.selectedCount]}>{selectedTasks.length}</Text>
            </View>
            {<View style={[styles.actionRow]}>{actionMenuContent?.(selectedTasks) ?? defaultActionMenu}</View>}
          </View>
        )}
      </View>
    </>
  );

  const emptyTasks = () => {
    let emptyText;
    if (!isFetching) {
      if (data && !canFetch) emptyText = 'tasks.empty';
      else {
        if (parentCourse) emptyText = 'tasks.empty';
        else emptyText = 'tasks.course-not-selected';
      }
    }
    if (emptyText)
      return (
        <>
          <Text style={styles.emptyTasks}>{translate(emptyText)}</Text>
          <Text style={[styles.emptyTasks, { paddingTop: 10 }]}>{additionalEmptyMessage}</Text>
        </>
      );
    else return <View />;
  };

  return (
    <>
      <FlatList
        data={data ?? tasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id}
        refreshing={isRefresing}
        ListHeaderComponent={listHeader}
        stickyHeaderIndices={[0]}
        stickyHeaderHiddenOnScroll={true}
        ListFooterComponent={loadingItemsIndicator}
        ListFooterComponentStyle={styles.indicator}
        ListEmptyComponent={emptyTasks}
        progressViewOffset={refreshOffset}
        onRefresh={!data && refreshPage}
        onEndReached={!data && fetchNextPage}
        onEndReachedThreshold={0.7}
        style={[styles.container]}
        contentContainerStyle={[{ flexGrow: 1 }, style]}
      />
      <TaskFilterPopup
        show={isTaskFiltersShow}
        onApply={setFilterParams}
        onClose={() => setIsTaskFiltersShow(false)}
        onAddTaskType={addTaskType}
        isNeedRefesh={needOpenPopupAfterMount.current}
      />
    </>
  );
}

const styles = StyleSheet.create({
  smallContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  emptyTasks: {
    paddingTop: 60,
    textAlign: 'center',
    color: Color.silver,
  },
  indicator: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    height: 50,
    backgroundColor: Color.white,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

TaskList = forwardRef(TaskList);
export default TaskList;
