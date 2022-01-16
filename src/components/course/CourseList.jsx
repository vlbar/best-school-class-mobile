import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, ActivityIndicator, TouchableNativeFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import Color from '../../constants';
import IconButton from './../common/IconButton';
import Resource from '../../utils/Hateoas/Resource';
import SearchBar from '../common/SearchBar';
import Text from '../common/Text';
import { useTranslation } from '../../utils/Internationalization';

const baseUrl = '/v1/courses';
const subCoursesPartUrl = 'sub-courses';
const baseLink = Resource.basedOnHref(baseUrl).link();
const pageLink = baseLink.fill('size', 20);

const getSubCoursesLink = id => Resource.basedOnHref(`${baseUrl}/${id}/${subCoursesPartUrl}`).link();

function CourseList(
  {
    parentCourse,
    parentCourseId,
    onCoursePress,
    headerContent,
    actionMenuContent,
    onCourseSelect,
    onPressEmptyMessage,
  },
  ref,
) {
  const { translate } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isHasError, setIsHasError] = useState(false);
  const nextPage = useRef(undefined);

  const [refreshOffset, setRefreshOffset] = useState(0);
  const [isActionMenuShow, setIsActionMenuShow] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);

  const NULL_PARENT_ID = -1;
  const coursesMap = useRef(new Map());

  const filterParams = useRef({
    name: '',
  });

  useEffect(() => {
    setCourses([]);

    const targetId = parentCourseId ?? parentCourse?.id ?? NULL_PARENT_ID;
    if (coursesMap.current.has(targetId)) {
      setCourses(coursesMap.current.get(targetId));
    } else {
      fetchPage();
    }
  }, [parentCourse, parentCourseId]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchPage();
    },
    unselect: () => {
      closeActionMenu();
    },
    setIsFetching: value => setIsFetching(value),
  }));

  function fetchCourses(link, isRefreshing = false) {
    const targetId = parentCourseId ?? parentCourse?.id ?? NULL_PARENT_ID;
    console.log(isRefreshing);
    link
      ?.fetch(isRefreshing ? setIsRefreshing : setIsFetching)
      .then(page => {
        let fetchedCourses = page.list('courses') ?? [];
        nextPage.current = page.link('next');

        if (page.page.number == 1) {
          setCourses(fetchedCourses);
          coursesMap.current.set(targetId, fetchedCourses);
        } else {
          setCourses([...courses, ...fetchedCourses]);
        }
        setIsHasError(false);
      })
      .catch(error => {
        console.log('Не удалось загрузить список курсов.', error);
        setIsHasError(true);
      });
  }

  const fetchPage = (isRefreshing = false) => {
    closeActionMenu();

    let link;
    if (parentCourse) link = parentCourse.link('subCourses');
    else if (parentCourseId) link = getSubCoursesLink(parentCourseId);
    else link = pageLink;
    fetchCourses(link.fill('name', filterParams.current.name ?? ''), isRefreshing);
  };

  const refreshPage = () => {
    fetchPage(true);
  };

  const updatePage = () => {
    if (courses.length > 0) fetchNextPage();
    else fetchPage();
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
      <TouchableNativeFeedback
        onPress={() => (isActionMenuShow ? courseLongPress(item) : onCoursePress?.(item))}
        onLongPress={() => !isActionMenuShow && courseLongPress(item)}
      >
        <View style={[styles.course, isSelected && styles.selected]}>
          <View style={styles.arrowHolder}>
            {!item.isEmpty && <Icon name="caret-forward-outline" size={18} color={Color.darkGray} />}
          </View>
          <Text style={styles.name}>{item.name}</Text>
        </View>
      </TouchableNativeFeedback>
    );
  };

  console.log(isHasError);
  const loadingItemsIndicator = isFetching ? (
    isFetching && !courses.length && <ActivityIndicator color={Color.primary} size={50} />
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
          fetchPage();
        }}
        onDelayStart={() => {
          setIsFetching(true);
          setCourses([]);
        }}
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

  const isSearching = filterParams.current.name.trim().length > 0;
  const emptyMessageArray = parseEmptyMessage(translate('course.empty'));
  const emptyCourse = () => {
    return !isFetching && !isHasError ? (
      isSearching ? (
        <Text style={styles.emptyCourse}>{translate('course.emptySearch')}</Text>
      ) : (
        <TouchableOpacity activeOpacity={0.7} onPress={onPressEmptyMessage}>
          <Text style={styles.emptyCourse}>
            {!parentCourse && !parentCourseId ? (
              <>
                {emptyMessageArray[0]}
                <Text weight="bold">{emptyMessageArray[1]}</Text>
                {emptyMessageArray[2]}
              </>
            ) : (
              <>{translate('course.emptySub')}</>
            )}
          </Text>
        </TouchableOpacity>
      )
    ) : (
      <></>
    );
  };

  return (
    <View style={styles.listContainer}>
      {isActionMenuShow && <View style={styles.actionHeader}>{actionMenu}</View>}
      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={item => item.id}
        refreshing={isRefreshing}
        stickyHeaderIndices={[0]}
        stickyHeaderHiddenOnScroll={true}
        ListHeaderComponent={listHeader}
        ListFooterComponent={loadingItemsIndicator}
        ListFooterComponentStyle={styles.indicator}
        ListEmptyComponent={emptyCourse}
        progressViewOffset={refreshOffset}
        onRefresh={refreshPage}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.7}
        style={[styles.coursesList]}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
}

const parseEmptyMessage = message => {
  const arr = message.split('**');
  return arr;
};

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
    marginHorizontal: 10,
    alignItems: 'center',
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
    paddingTop: 60,
    textAlign: 'center',
    color: Color.silver,
    marginHorizontal: 20,
  },
  listHeader: {
    backgroundColor: Color.white,
    marginHorizontal: 20,
  },
  searchBar: {
    marginBottom: 0,
  },
  indicator: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
