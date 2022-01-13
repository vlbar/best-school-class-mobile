import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableNativeFeedback, View } from 'react-native';
import Color from '../../constants';
import Resource from '../../utils/Hateoas/Resource';
import { useTranslation } from '../../utils/Internationalization';
import HorizontalMenu from '../common/HorizontalMenu';
import SearchBar from '../common/SearchBar';
import Text from '../common/Text';
import User from '../user/User';

export default function InterviewList({
  fetchLink,
  interviews,
  setInterviews,
  withInactive,
  onSelect: handleSelect,
  ListHeaderComponent,
}) {
  const { translate } = useTranslation();
  const page = useRef(undefined);
  const groupPage = useRef(undefined);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyClosed, setOnlyClosed] = useState(null);

  function onSelect(interview) {
    handleSelect?.(interview);
  }

  useEffect(() => {
    page.current = undefined;
    groupPage.current = undefined;

    fetchInterviews(fetchLink.fill('name', search).fill('closed', onlyClosed));
    return () => {
      setInterviews([]);
    };
  }, []);

  function fetchInterviews(link) {
    link
      .fetch(setLoading)
      .then(newPage => {
        if (newPage.list('interviews')) {
          if (page.current)
            setInterviews([...interviews, ...newPage.list('interviews')]).filter(
              (value, index, self) => self.findIndex(elem => elem.interviewer.id === value.interviewer.id) === index,
            );
          else setInterviews(newPage.list('interviews'));
        } else if (!page.current) setInterviews([]);
        page.current = newPage;
      })
      .catch(err => {
        page.current = null;
      });
  }

  function fetchGroups(link) {
    link
      .fetch(setLoading)
      .then(newPage => {
        groupPage.current = newPage;
        if (newPage.list('members'))
          setInterviews(
            [
              ...interviews,
              ...newPage.list('members').map(member => {
                return Resource.basedList(
                  {
                    undefined: fetchLink.withPathTale(member.user.id),
                    interviewMessages: fetchLink.withPathTale(member.user.id).withPathTale('messages'),
                    changeMark: fetchLink.withPathTale(member.user.id),
                  },
                  {
                    interviewer: member.user,
                    inactive: true,
                  },
                );
              }),
            ].filter(
              (value, index, self) => self.findIndex(elem => elem.interviewer.id === value.interviewer.id) === index,
            ),
          );
      })
      .catch(err => {
        groupPage.current = null;
      });
  }

  function fetch() {
    if (page.current && page.current.link('next')) fetchInterviews(page.current.link('next'));
    else if (
      page.current &&
      withInactive &&
      onlyClosed == null &&
      (groupPage.current === undefined || groupPage.current?.link('next'))
    )
      fetchGroups(
        groupPage.current === undefined
          ? withInactive.fill('name', search).fill('roles', 'student')
          : groupPage.current.link('next'),
      );
  }

  function onNext() {
    if (!loading) fetch();
  }

  function onSearch(search) {
    page.current = undefined;
    groupPage.current = undefined;
    setInterviews([]);
    setSearch(search);
    fetchInterviews(fetchLink.fill('name', search).fill('closed', onlyClosed));
  }

  return (
    <FlatList
      ListHeaderComponent={
        <View>
          {ListHeaderComponent}
          <SearchBar onSearch={onSearch} />
        </View>
      }
      ListFooterComponent={loading && <ActivityIndicator color={Color.primary} size={50} />}
      ListEmptyComponent={
        !loading && (
          <View style={styles.emptyMessage}>
            {!search ? (
              <View>
                <Text style={styles.emptyText}>{translate('homeworks.details.members.empty')}</Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>{translate('homeworks.details.members.emptySearch')}</Text>
            )}
          </View>
        )
      }
      data={interviews}
      renderItem={({ item }) => {
        return (
          <TouchableNativeFeedback onPress={() => onSelect(item)}>
            <View style={styles.row}>
              <User
                user={item.interviewer}
                iconSize={50}
                containerStyle={styles.memberName}
                nameStyle={{ marginRight: 10, flex: 1 }}
              >
                <Text style={styles.result}>{item.result}</Text>
              </User>
            </View>
          </TouchableNativeFeedback>
        );
      }}
      onEndReached={onNext}
      onEndReachedThreshold={1}
      keyExtractor={interview => interview.interviewer.id}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 4,
    marginVertical: 2,
  },
  memberName: {
    flexWrap: 'wrap',
    flex: 1,
    marginLeft: 20,
  },
  result: {
    color: Color.success,
    fontSize: 23,
  },
  emptyMessage: {
    marginVertical: 50,
  },
  emptyText: {
    textAlign: 'center',
    color: Color.silver,
  },
});
