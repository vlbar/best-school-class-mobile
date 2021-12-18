import moment from 'moment';
import 'moment/locale/ru';
import 'moment/locale/fr';
import 'moment/locale/ja';
import 'moment/locale/de';
import React, { useEffect, useRef, useState } from 'react';
import { useContext } from 'react';
import {
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import BottomPopup from '../../components/common/BottomPopup';
import Button from '../../components/common/Button';
import IconButton from '../../components/common/IconButton';
import SearchBar from '../../components/common/SearchBar';
import Text from '../../components/common/Text';
import Header from '../../components/navigation/Header';
import { TEACHER } from '../../components/state/State';
import Color from '../../constants';
import { GroupsContext } from '../../navigation/main/GroupsNavigationConstants';
import { ProfileContext } from '../../navigation/NavigationConstants';
import getContrastColor from '../../utils/ContrastColor';
import Resource from '../../utils/Hateoas/Resource';
import { getCurrentLanguage, useTranslation } from '../../utils/Internationalization';
import Icon from 'react-native-vector-icons/Ionicons';

import { CREATE_GROUP_SCREEN } from './CreateGroup';
import { GROUPS_DETAILS_SCREEN } from './GroupDetails';
import { JOIN_GROUP_SCREEN } from './JoinGroup';

const GROUPS_URL = 'v1/groups';

export const GROUPS_SCREEN = 'groups';
function Groups({ navigation }) {
  const { state, user } = useContext(ProfileContext);
  const { groups, setGroups } = useContext(GroupsContext);
  const { translate } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const pageRef = useRef(Resource.basedOnHref(GROUPS_URL));
  const [inviteCode, setInviteCode] = useState('');
  const [createModalShow, setCreateModalShow] = useState(false);
  const currentLanguage = getCurrentLanguage();

  useEffect(() => {
    setGroups([]);
    fetchPage(pageRef.current.link('first').fill('roles', state.name));
  }, [state]);

  useEffect(() => {
    setInviteCode('');
  }, [createModalShow]);

  function onSearch(search) {
    setSearch(search);
    setGroups([]);
    fetchPage(pageRef.current.link('first').fill('name', search));
  }

  function fetchPage(link, refresh = false) {
    link.fetch(refresh ? setRefreshing : setLoading).then(page => {
      pageRef.current = page;
      let newGroups = page.list('groups') ?? [];

      if (page.page.number == 1) setGroups(newGroups);
      else setGroups([...groups, ...newGroups]);
    });
  }

  function onNext() {
    if (!loading && pageRef.current.link('next')) fetchPage(pageRef.current.link('next'));
  }

  function onRefresh() {
    fetchPage(pageRef.current.link('first'), true);
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
        groupId: group.id,
      },
    });
  }

  return (
    <>
      <Header
        title={translate('groups.title')}
        headerRight={<IconButton name="add-outline" onPress={() => setCreateModalShow(true)} />}
      />
      <FlatList
        ListHeaderComponent={
          <View style={{ backgroundColor: Color.white }}>
            <SearchBar
              placeholder={translate('groups.searchPlaceholder')}
              onSearch={onSearch}
              emptyAfterValue={groups.length == 0 ? search : undefined}
              onEmpty={() => {
                onSearch('');
              }}
            />
          </View>
        }
        ListFooterComponent={loading && <ActivityIndicator color={Color.primary} size={50} />}
        ListFooterComponentStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
        stickyHeaderIndices={[0]}
        stickyHeaderHiddenOnScroll={true}
        onEndReached={onNext}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20 }}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyMessage}>
              {search ? (
                <>
                  <Text style={styles.emptyText}>{translate('groups.emptySearch')}</Text>
                  <Text style={styles.emptyText}>{translate('groups.emptySearchAdvice')}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.emptyText}>{translate('groups.empty')}</Text>
                  <Text style={[styles.emptyText, styles.roleText]}> {translate(state.key)}</Text>

                  <Text style={styles.emptyText}>
                    {translate('groups.emptyJoinAdvice')}
                    {'\n'}
                    <TouchableOpacity onPress={() => setCreateModalShow(true)}>
                      <Text style={styles.emptyText}>
                        <Text style={styles.linkText}>{translate('groups.join')}</Text>{' '}
                        {translate('groups.emptyJoinAdviceContinue')}.
                      </Text>
                    </TouchableOpacity>
                  </Text>
                  {state == TEACHER && (
                    <>
                      <Text style={[styles.emptyText, styles.orText]}>{translate('groups.or')}</Text>
                      <TouchableOpacity onPress={onCreatePress}>
                        <Text style={styles.emptyText}>
                          <Text style={styles.linkText}>{translate('groups.create')}</Text>{' '}
                          {translate('groups.emptyCreateAdviceContinue')}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </View>
          )
        }
        onEndReachedThreshold={0.5}
        data={groups}
        renderItem={({ item }) => {
          return (
            <TouchableNativeFeedback onPress={() => onDetailsPress(item)}>
              <View style={[styles.card, { backgroundColor: item.color }]}>
                <Text style={[styles.cardHeader, { color: getContrastColor(item.color) }]}>{item.name}</Text>
                <View style={styles.cardBody}>
                  <Text style={styles.joinedText}>
                    {moment(new Date(item.membership.joinDate), undefined, currentLanguage.languageName).fromNow()}
                  </Text>
                  {user.id == item.creatorId && <Icon name="key-outline" color={Color.gray} size={22} />}
                </View>
              </View>
            </TouchableNativeFeedback>
          );
        }}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      {createModalShow && (
        <BottomPopup show={true} title={translate('groups.groupCreation')} onClose={() => setCreateModalShow(false)}>
          <View style={styles.modal}>
            <Text style={styles.textCenter}>{translate('groups.inviteQuestion')}</Text>
            <View style={styles.codeContainer}>
              <TextInput
                style={styles.input}
                onChangeText={setInviteCode}
                value={inviteCode}
                placeholder={translate('groups.invitePlaceholder')}
              />
              <IconButton
                name="chevron-forward-outline"
                size={40}
                style={styles.inviteButton}
                color={Color.white}
                onPress={onJoinPress}
                disabled={inviteCode.length == 0}
              ></IconButton>
            </View>
            {state == TEACHER && (
              <>
                <Text style={[styles.textCenter, styles.orText]}>{translate('groups.or')}</Text>
                <Button title={translate('groups.createNew')} onPress={onCreatePress}></Button>
              </>
            )}
          </View>
        </BottomPopup>
      )}
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
    marginVertical: 10,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinedText: {
    color: Color.silver,
  },
  emptyMessage: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    color: Color.silver,
  },
  roleText: {
    color: Color.lightPrimary,
    marginVertical: 5,
  },
  linkText: {
    fontWeight: 'bold',
  },
});
