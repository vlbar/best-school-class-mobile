import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, FlatList, View, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import Color from '../../constants';
import ProcessView from './../common/ProcessView';
import Resource from '../../utils/Hateoas/Resource';
import SearchBar from '../common/SearchBar';
import Text from '../common/Text';
import translate from '../../utils/Internationalization';

const baseUrl = '/v1/courses';
const subCoursesPartUrl = 'sub-courses';
const baseLink = Resource.basedOnHref(baseUrl).link();
const pageLink = baseLink.fill('size', 20);

const getSubCoursesLink = id => Resource.basedOnHref(`${baseUrl}/${id}/${subCoursesPartUrl}`).link();

function CourseList({ parentCourse, parentCourseId, onCoursePress, headerContent }, ref) {
  const [courses, setCourses] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const nextPage = useRef(undefined);

  useEffect(() => {
    refreshPage();
  }, [parentCourse, parentCourseId]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      refreshPage();
    },
  }));

  function fetchCourses(link) {
    link
      ?.fetch(setIsFetching)
      .then(page => {
        let fetchedCourses = page.list('courses');
        nextPage.current = page.link('next');

        if (page.page.number == 1) setCourses(fetchedCourses);
        else setCourses([...courses, ...fetchedCourses]);
      })
      .catch(error => console.log('Не удалось загрузить список курсов.', error));
  }

  const refreshPage = () => {
    setCourses([]);
    if (parentCourse) fetchCourses(parentCourse.link('subCourses'));
    else if (parentCourseId) fetchCourses(getSubCoursesLink(parentCourseId));
    else fetchCourses(pageLink);
  };

  const fetchNextPage = () => {
    fetchCourses(nextPage.current);
  };

  // render
  const renderCourseItem = ({ item }) => {
    return (
      <Pressable style={styles.course} onPress={() => onCoursePress?.(item)}>
        <View style={styles.arrowHolder}>
          {!item.isEmpty && <Icon name="caret-forward-outline" size={18} color={Color.darkGray} />}
        </View>
        <Text style={styles.name}>{item.name}</Text>
      </Pressable>
    );
  };

  const loadingItemsIndicator = () => {
    return isFetching ? (
      <View>
        <ProcessView style={[styles.processView, { width: '70%' }]} />
        <ProcessView style={[styles.processView, { width: '50%' }]} />
        <ProcessView style={[styles.processView, { width: '60%' }]} />
      </View>
    ) : (
      <></>
    );
  };

  const listHeader = (
    <>
      {headerContent}
      <SearchBar placeholder={translate('course.search')} style={styles.searchBar} />
    </>
  );

  const emptyCourse = () => {
    return !isFetching ? <Text style={styles.emptyCourse}>{translate('course.empty')}</Text> : <></>;
  };

  return (
    <FlatList
      data={courses}
      renderItem={renderCourseItem}
      keyExtractor={item => item.id}
      refreshing={isFetching}
      ListHeaderComponent={listHeader}
      stickyHeaderIndices={[0]}
      stickyHeaderHiddenOnScroll={true}
      ListFooterComponent={loadingItemsIndicator}
      ListEmptyComponent={emptyCourse}
      onRefresh={refreshPage}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={0.7}
      style={[styles.coursesList]}
    />
  );
}

const styles = StyleSheet.create({
  coursesList: {
    marginTop: 0,
    flex: 1,
  },
  course: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  arrowHolder: {
    minWidth: 40,
  },
  processView: {
    height: 20,
    marginVertical: 12,
    marginStart: 40,
  },
  emptyCourse: {
    textAlign: 'center',
  },
});

CourseList = forwardRef(CourseList);
export default CourseList;
