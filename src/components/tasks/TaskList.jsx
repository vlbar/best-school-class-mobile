import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableNativeFeedback } from 'react-native';

import Bandage from './filters/Bandage';
import Color from '../../constants';
import ProcessView from '../common/ProcessView';
import SearchBar from './../common/SearchBar';
import Text from '../common/Text';
import { translate } from '../../utils/Internationalization';

// colors
const taskTypesColors = ['#69c44d', '#007bff', '#db4242', '#2cc7b2', '#8000ff', '#e68e29', '#d4d5d9', '#38c7d1'];
export function getTaskTypeColor(id) {
  return taskTypesColors[id % taskTypesColors.length];
}

export function clearHtmlTags(htmlString) {
  return htmlString.replace(/<[^>]*>?/gm, '');
}

function TaskList({ data, parentCourse, autoFetch = true, showHeader = true, headerContent }) {
  const [tasks, setTasks] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const nextPage = useRef(undefined);
  const lastParentCourse = useRef(undefined);

  const [refreshOffset, setRefreshOffset] = useState(0);

  useEffect(() => {
    if (parentCourse && lastParentCourse.current !== parentCourse && autoFetch) {
      fetchTasks(parentCourse.link('tasks'));
      lastParentCourse.current = parentCourse;
    }

    if (!autoFetch && !data && parentCourse && lastParentCourse.current !== parentCourse) {
      setIsFetching(true);
      setTasks([]);
    }
  }, [parentCourse, autoFetch]);

  function fetchTasks(link) {
    link
      ?.fetch(setIsFetching)
      .then(page => {
        let fetchedTasks = page.list('tasks');
        nextPage.current = page.link('next');

        if (page.page.number == 1) setTasks(fetchedTasks);
        else setTasks([...courses, ...fetchedTasks]);
      })
      .catch(error => console.log('Не удалось загрузить список курсов.', error));
  }

  const refreshPage = () => {
    setTasks([]);
    fetchTasks(parentCourse.link('tasks'));
  };

  const fetchNextPage = () => {
    fetchTasks(nextPage.current);
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
    return isFetching ? (
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

  const listHeader = (
    <View onLayout={headerLayoutHandler} style={[styles.listHeader]}>
      {headerContent}
      <SearchBar placeholder={translate('tasks.search')} style={styles.searchBar}>
        <SearchBar.IconButton name='filter-outline' />
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
    marginVertical: 12,
  },
  fetchingView: {
    height: 21,
    marginVertical: 5,
  },
});

export default TaskList;
