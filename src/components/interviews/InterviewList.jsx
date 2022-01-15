import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableNativeFeedback, View } from 'react-native';
import Color from '../../constants';
import Resource from '../../utils/Hateoas/Resource';
import { useTranslation } from '../../utils/Internationalization';
import HorizontalMenu from '../common/HorizontalMenu';
import SearchBar from '../common/SearchBar';
import Text from '../common/Text';
import User from '../user/User';

const PAGE_SIZE = 10;

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

    fetchInterviews(fetchLink.fill('name', search).fill('closed', onlyClosed).fill('size', PAGE_SIZE));
    return () => {
      setInterviews([]);
    };
  }, []);

  function fetchInterviews(link) {
    setLoading(true);
    link
      .fetch()
      .then(newPage => {
        let newInterviews;
        if (newPage.list('interviews')) {
          if (page.current) newInterviews = [...interviews, ...newPage.list('interviews')];
          else newInterviews = newPage.list('interviews');
        } else if (!page.current) newInterviews = [];
        page.current = newPage;

        if (!newPage.list('interview') || newPage.list('interviews').length < PAGE_SIZE) fetch(newInterviews);
        else {
          setLoading(false);
          setInterviews(newInterviews);
        }
      })
      .catch(err => {
        console.log(err);
        page.current = null;
        setLoading(false);
      });
  }

  function mapMembers(members) {
    return members.map(member => {
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
    });
  }

  function fetchGroups(link, curInterviews) {
    link
      .fetch(setLoading)
      .then(newPage => {
        if (newPage.list('members')) {
          if (!groupPage.current && !page.current.list('interviews'))
            setInterviews(mapMembers(newPage.list('members')));
          else {
            let newInterviews = curInterviews ?? interviews;
            mapMembers(newPage.list('members')).forEach(i => {
              if (!newInterviews.find(newI => newI.interviewer.id == i.interviewer.id)) newInterviews.push(i);
            });
            setInterviews(newInterviews);
          }
        }
        groupPage.current = newPage;
      })
      .catch(err => {
        console.log(err);
        groupPage.current = null;
      });
  }

  function fetch(interviews) {
    if (page.current) {
      if (page.current.link('next')) fetchInterviews(page.current.link('next'));
      else if (
        withInactive &&
        onlyClosed == null &&
        (groupPage.current === undefined || groupPage.current?.link('next'))
      ) {
        fetchGroups(
          (groupPage.current === undefined
            ? withInactive.fill('name', page.current.link().param('name')).fill('roles', 'student')
            : groupPage.current.link('next')
          ).fill('size', PAGE_SIZE),
          interviews,
        );
      }
    }
  }

  function onNext() {
    if (!loading) fetch();
  }

  function onSearch(search) {
    page.current = undefined;
    groupPage.current = undefined;
    setInterviews([]);
    setSearch(search);
    fetchInterviews(fetchLink.fill('name', search).fill('closed', onlyClosed).fill('size', PAGE_SIZE));
  }

  return (
    <FlatList
      ListHeaderComponent={
        <View>
          {ListHeaderComponent}
          <SearchBar onSearch={onSearch} emptyAfterValue={interviews.length == 0 ? search : null} />
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
