import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableNativeFeedback } from 'react-native';

import Bandage from './filters/Bandage';
import Color from '../../constants';
import ProcessView from '../common/ProcessView';
import SearchBar from './../common/SearchBar';
import TaskFilterPopup from './filters/TaskFilterPopup';
import Text from '../common/Text';
import { translate } from '../../utils/Internationalization';

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

function TaskList({ data, parentCourse, canFetch = true, showHeader = true, headerContent }) {
  const [tasks, setTasks] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const nextPage = useRef(undefined);
  const lastParentCourse = useRef(undefined);

  const [refreshOffset, setRefreshOffset] = useState(0);
  const [isTaskFiltersShow, setIsTaskFiltersShow] = useState(false);

  const filterParams = useRef({
    name: '',
    taskTypeId: null,
    orderBy: defaultOrder,
  });

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
    }
  }, [parentCourse]);

  function fetchTasks(link) {
    link
      ?.fetch(setIsFetching)
      .then(page => {
        let fetchedTasks = page.list('tasks') ?? [];
        nextPage.current = page.link('next');

        if (page.page.number == 1) setTasks(fetchedTasks);
        else setTasks([...courses, ...fetchedTasks]);
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

  const addTaskType = () => {
    setIsTaskFiltersShow(false);
  };

  // render
  const renderCourseItem = ({ item }) => {
    return (
      <TouchableNativeFeedback>
        <View style={styles.task} onPress={() => !item.isEmpty && onCoursePress(item)}>
          <View style={styles.titleRow}>
            <Text weight="medium" style={styles.title}>
              {item.name}
            </Text>
            {item.taskType && <Bandage color={getTaskTypeColor(item.taskType.id)} title={item.taskType.name} />}
          </View>
          <Text style={styles.description} numberOfLines={1}>
            {clearHtmlTags(item.description)}
          </Text>
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
        style={[styles.coursesList]}
      />
      <TaskFilterPopup
        show={isTaskFiltersShow}
        onApply={setFilterParams}
        onClose={() => setIsTaskFiltersShow(false)}
        onAddTaskType={addTaskType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingVertical: 10,
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
});

export default TaskList;
