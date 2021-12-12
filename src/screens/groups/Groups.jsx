import moment from 'moment';
import 'moment/locale/ru';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TextInput, TouchableNativeFeedback, View } from 'react-native';
import BottomPopup from '../../components/common/BottomPopup';
import Button from '../../components/common/Button';
import Container from '../../components/common/Container';
import IconButton from '../../components/common/IconButton';
import SearchBar from '../../components/common/SearchBar';
import Text from '../../components/common/Text';
import useDelay from '../../components/common/useDelay';
import Header from '../../components/navigation/Header';
import Color from '../../constants';
import getContrastColor from '../../utils/ContrastColor';
import Resource from '../../utils/Hateoas/Resource';
import { getCurrentLanguage } from '../../utils/Internationalization';

import { CREATE_GROUP_SCREEN } from './CreateGroup';
import { GROUPS_DETAILS_SCREEN } from './GroupDetails';
import { JOIN_GROUP_SCREEN } from './JoinGroup';

const GROUPS_URL = 'v1/groups';

export const GROUPS_SCREEN = 'groups';
function Groups({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState([]);
  const pageRef = useRef(Resource.basedOnHref(GROUPS_URL));
  const [inviteCode, setInviteCode] = useState('');
  const [createModalShow, setCreateModalShow] = useState(false);
  const currentLanguage = getCurrentLanguage();

  useEffect(() => {
    fetchPage(pageRef.current.link());
  }, []);

  function onSearch(search) {
    setSearch(search);
    fetchPage(pageRef.current.link('first').fill('name', search));
  }

  function fetchPage(link) {
    if (loading) return;

    link.fetch(setLoading).then(page => {
      pageRef.current = page;
      let newGroups = page.list('groups') ?? [];

      if (page.page.number == 1) setGroups(newGroups);
      else setGroups([...groups, ...newGroups]);
    });
  }

  function onNext() {
    if (pageRef.current.link('next')) fetchPage(pageRef.current.link('next'));
  }

  function onRefresh() {
    fetchPage(pageRef.current.link('first'));
  }

  function onJoinPress() {
    setCreateModalShow(false);
    navigation.navigate({
      name: JOIN_GROUP_SCREEN,
      params: {
        inviteCode,
      },
    });
  }

  function onCreatePress() {
    setCreateModalShow(false);
    navigation.navigate({
      name: CREATE_GROUP_SCREEN,
      params: {
        createLink: pageRef.current.link().href,
      },
    });
  }

  function onDetailsPress(group) {
    navigation.navigate({
      name: GROUPS_DETAILS_SCREEN,
      params: {
        fetchLink: group.link().href,
      },
    });
  }

  return (
    <>
      <Header title="Группы" headerRight={<IconButton name="add-outline" onPress={() => setCreateModalShow(true)} />} />
      <Container style={styles.container}>
        <FlatList
          ListHeaderComponent={
            <View style={{ backgroundColor: Color.white }}>
              <SearchBar
                placeholder="Введите название группы..."
                onSearch={onSearch}
                emptyAfterValue={groups.length == 0 ? search : undefined}
                onEmpty={() => {
                  onSearch('');
                }}
              />
            </View>
          }
          stickyHeaderIndices={[0]}
          stickyHeaderHiddenOnScroll={true}
          onEndReached={onNext}
          onEndReachedThreshold={0.2}
          data={groups}
          renderItem={({ item }) => {
            return (
              <TouchableNativeFeedback onPress={() => onDetailsPress(item)}>
                <View style={[styles.card, { backgroundColor: item.color }]}>
                  <Text style={[styles.cardHeader, { color: getContrastColor(item.color) }]}>{item.name}</Text>
                  <Text style={styles.cardBody}>
                    {moment(new Date(item.membership.joinDate), undefined, currentLanguage.languageName).fromNow()}
                  </Text>
                </View>
              </TouchableNativeFeedback>
            );
          }}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
        />
        {createModalShow && (
          <BottomPopup show={true} title="Добавление группы" onClose={() => setCreateModalShow(false)}>
            <View style={styles.modal}>
              <Text style={styles.textCenter}>У вас есть приглашение?</Text>
              <View style={styles.codeContainer}>
                <TextInput
                  style={styles.input}
                  onChangeText={setInviteCode}
                  placeholder={'Введите код приглашения...'}
                />
                <IconButton
                  name="chevron-forward-outline"
                  size={40}
                  style={styles.inviteButton}
                  color={Color.white}
                  onPress={onJoinPress}
                ></IconButton>
              </View>
              <Text style={[styles.textCenter, styles.orText]}>или</Text>
              <Button title="Создать новую" onPress={onCreatePress}></Button>
            </View>
          </BottomPopup>
        )}
      </Container>
    </>
  );
}

export default Groups;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    textAlign: 'center',
  },
  modal: {
    padding: 20,
    paddingTop: 0,
  },
  textCenter: {
    textAlign: 'center',
    marginVertical: 10,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    backgroundColor: Color.ultraLightPrimary,
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 17,
    flexGrow: 2,
    marginRight: 5,
  },
  inviteButton: {
    backgroundColor: Color.primary,
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  orText: {
    marginVertical: 15,
  },
  card: {
    borderRadius: 15,
    marginBottom: 10,
  },
  cardHeader: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: 'white',
  },
  cardBody: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: Color.veryLightGray,
    marginBottom: 4,
    marginHorizontal: 4,
    borderRadius: 13,
    color: Color.silver,
  },
});
