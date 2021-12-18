import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, FlatList, View, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import Color from '../../constants';
import IconButton from './../common/IconButton';
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

function CourseList(
  { parentCourse, parentCourseId, onCoursePress, headerContent, actionMenuContent, onCourseSelect },
  ref,
) {
  const [courses, setCourses] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const nextPage = useRef(undefined);

  const [refreshOffset, setRefreshOffset] = useState(0);
  const [isActionMenuShow, setIsActionMenuShow] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);

  const filterParams = useRef({
    name: '',
  });

  useEffect(() => {
    setCourses([]);
    refreshPage();
  }, [parentCourse, parentCourseId]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      refreshPage();
    },
    unselect: () => {
      closeActionMenu();
    },
    setIsFetching: value => setIsFetching(value),
  }));

  function fetchCourses(link) {
    link
      ?.fetch(setIsFetching)
      .then(page => {
        let fetchedCourses = page.list('courses') ?? [];
        nextPage.current = page.link('next');

        if (page.page.number == 1) setCourses(fetchedCourses);
        else setCourses([...courses, ...fetchedCourses]);
      })
      .catch(error => console.log('Не удалось загрузить список курсов.', error));
  }

  const refreshPage = () => {
    closeActionMenu();

    let link;
    if (parentCourse) link = parentCourse.link('subCourses');
    else if (parentCourseId) link = getSubCoursesLink(parentCourseId);
    else link = pageLink;
    fetchCourses(link.fill('name', filterParams.current.name ?? ''));
  };

  const fetchNextPage = () => {
    fetchCourses(nextPage.current);
  };

  const courseLongPress = course => {
    if (!actionMenuContent) return;

    let targetSelectedCourses = [];
    if (isActionMenuShow) {
      if (selectedCourses.includes(course)) {
        targetSelectedCourses = selectedCourses.filter(x => x.id !== course.id);
        setSelectedCourses(targetSelectedCourses);
        if (targetSelectedCourses.length === 0) setIsActionMenuShow(false);
      } else {
        targetSelectedCourses = [...selectedCourses, course];
        setSelectedCourses(targetSelectedCourses);
      }
    } else {
      setIsActionMenuShow(true);
      targetSelectedCourses = [course];
      setSelectedCourses(targetSelectedCourses);
    }

    onCourseSelect?.(course, targetSelectedCourses);
  };

  const closeActionMenu = () => {
    setIsActionMenuShow(false);
    setSelectedCourses([]);
  };

  // render
  const renderCourseItem = ({ item }) => {
    const isSelected = selectedCourses.find(x => x.id === item.id) !== undefined;
    return (
      <Pressable
        style={[styles.course, isSelected && styles.selected]}
        onPress={() => (isActionMenuShow ? courseLongPress(item) : onCoursePress?.(item))}
        onLongPress={() => !isActionMenuShow && courseLongPress(item)}
      >
        <View style={styles.arrowHolder}>
          {!item.isEmpty && <Icon name="caret-forward-outline" size={18} color={Color.darkGray} />}
        </View>
        <Text style={styles.name}>{item.name}</Text>
      </Pressable>
    );
  };

  const loadingItemsIndicator = () => {
    return isFetching && !courses.length ? (
      <View>
        <ProcessView style={[styles.processView, { width: '70%' }]} />
        <ProcessView style={[styles.processView, { width: '50%' }]} />
        <ProcessView style={[styles.processView, { width: '60%' }]} />
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
      <SearchBar
        placeholder={translate('course.search')}
        style={styles.searchBar}
        onSearch={value => {
          filterParams.current.name = value;
          refreshPage();
        }}
        onDelayStart={() => setIsFetching(true)}
      />
    </View>
  );

  const actionMenu = (
    <View style={[styles.listHeader]}>
      {headerContent}
      <View style={[styles.actionMenu]}>
        <View style={[styles.flexRow]}>
          <IconButton name="close-outline" onPress={closeActionMenu} />
          <Text style={[styles.selectedCount]}>{selectedCourses.length}</Text>
        </View>
        <View style={[styles.flexRow]}>{actionMenuContent}</View>
      </View>
    </View>
  );

  const emptyCourse = () => {
    return !isFetching ? <Text style={styles.emptyCourse}>{translate('course.empty')}</Text> : <></>;
  };

  return (
    <View style={styles.listContainer}>
      {isActionMenuShow && <View style={styles.actionHeader}>{actionMenu}</View>}
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
        progressViewOffset={refreshOffset}
        onRefresh={refreshPage}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.7}
        style={[styles.coursesList]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  coursesList: {
    marginTop: 0,
    flex: 1,
  },
  course: {
    flexDirection: 'row',
    paddingVertical: 12,
    marginVertical: 2,
    paddingHorizontal: 10,
    alignItems: 'center',
    width: '100%',
  },
  arrowHolder: {
    minWidth: 30,
  },
  processView: {
    height: 20,
    marginVertical: 16,
    marginStart: 32,
  },
  emptyCourse: {
    paddingTop: 10,
    textAlign: 'center',
  },
  listHeader: {
    backgroundColor: Color.white,
    marginHorizontal: 10,
  },
  searchBar: {
    marginBottom: 0,
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
  selectedCount: {
    marginStart: 4,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: Color.grayPrimary,
    borderRadius: 10,
  },
});

CourseList = forwardRef(CourseList);
export default CourseList;
