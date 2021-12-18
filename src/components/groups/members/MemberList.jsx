import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, StyleSheet, TouchableNativeFeedback, View } from 'react-native';
import { useScrollIntoView } from 'react-native-scroll-into-view';
import Color from '../../../constants';
import Resource from '../../../utils/Hateoas/Resource';
import { useTranslation } from '../../../utils/Internationalization';
import BottomPopup from '../../common/BottomPopup';
import ConfirmationAlert from '../../common/ConfirmationAlert';
import SearchBar from '../../common/SearchBar';
import Text from '../../common/Text';
import { types } from '../../state/State';
import User from '../../user/User';

export default function MemberList({
  active,
  fetchLink,
  searchPlaceholder,
  currentUser,
  onLeave,
  withRoles,
  isCreator = false,
}) {
  const { translate } = useTranslation();
  const scrollIntoView = useScrollIntoView();
  const viewRef = useRef();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [search, setSearch] = useState('');
  const memberPage = useRef(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(e.endCoordinates.screenY - 56);
      if (viewRef.current)
        setTimeout(() => {
          scrollIntoView(viewRef.current);
        }, 500);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', e => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (active && fetchLink && !memberPage.current) {
      memberPage.current = Resource.based(fetchLink);
      fetchPage(fetchLink);
    }
  }, [fetchLink, active]);

  function fetchPage(link, refresh) {
    link?.fetch(refresh ? setRefreshing : setLoading).then(newPage => {
      memberPage.current = newPage;
      let newMembers = newPage.list('members') ?? [];
      if (newPage.page.number === 1) setMembers(newMembers);
      else setMembers([...members, ...newMembers]);
    });
  }

  function onNext() {
    memberPage.current?.onLink('next', fetchPage);
  }

  function onSearch(search) {
    setSearch(search);
    setMembers([]);
    fetchPage(memberPage.current?.link('first').fill('name', search));
  }

  function onRefresh() {
    fetchPage(memberPage.current?.link('first'), true);
  }

  function onKick(member) {
    setContextMenu(null);
    member
      .link()
      ?.remove(setLoading)
      .then(() => {
        if (currentUser?.id == member.user.id) onLeave?.();
        setMembers(members.filter(m => m != member));
      });
  }

  return (
    <View style={{ minHeight: keyboardHeight, overflow: 'hidden', flexGrow: 1 }}>
      <FlatList
        ListHeaderComponent={
          <View ref={active ? viewRef : undefined} style={{ backgroundColor: Color.white }}>
            <SearchBar
              placeholder={searchPlaceholder ?? 'Введите имя...'}
              style={styles.memberSearch}
              onSearch={onSearch}
              emptyAfterValue={members.length == 0 ? search : undefined}
            />
          </View>
        }
        nestedScrollEnabled={false}
        scrollEnabled={false}
        ListEmptyComponent={
          !loading && (
            <Text style={[styles.emptyMessage, styles.emptyText]}>
              {translate(search ? 'groups.groupDetails.emptySearchMembers' : 'groups.groupDetails.emptyMembers')}
            </Text>
          )
        }
        ListFooterComponent={loading && <ActivityIndicator color={Color.primary} size={50} />}
        onEndReached={onNext}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReachedThreshold={0.2}
        data={members}
        renderItem={({ item }) => {
          let isCurrent = item.user.id == currentUser.id;
          return (
            <TouchableNativeFeedback
              onPress={() => (isCreator || currentUser?.id == item.user.id) && setContextMenu({ item, show: true })}
            >
              <View style={[styles.row, item == contextMenu?.item && styles.active]}>
                <User
                  user={item.user}
                  iconSize={55}
                  showCurrent={isCurrent}
                  containerStyle={styles.memberName}
                  nameStyle={{ marginRight: 10, flex: 1 }}
                >
                  {withRoles && <Text style={styles.roleBadge}>{translate(types[item.role].key)}</Text>}
                </User>
              </View>
            </TouchableNativeFeedback>
          );
        }}
        keyExtractor={item => item.id}
      ></FlatList>
      {contextMenu != null && (
        <BottomPopup
          show={contextMenu.show}
          onClose={() => setContextMenu(null)}
          title={translate('groups.groupDetails.actions')}
        >
          <ConfirmationAlert
            onConfirm={() => onKick(contextMenu.item)}
            onReject={() => setContextMenu(null)}
            text={translate(
              currentUser?.id == contextMenu.item.user.id
                ? 'groups.groupDetails.leaveConfirmation'
                : 'groups.groupDetails.kickConfirmation',
            )}
          >
            {({ confirm }) => {
              return (
                <TouchableNativeFeedback
                  onPress={() => {
                    confirm();
                    setContextMenu({ ...contextMenu, show: false });
                  }}
                >
                  <View style={{ borderTopWidth: StyleSheet.hairlineWidth }}>
                    <Text style={{ color: Color.danger, textAlign: 'center', padding: 15 }}>
                      {translate(
                        currentUser?.id == contextMenu.item.user.id
                          ? 'groups.groupDetails.leave'
                          : 'groups.groupDetails.kick',
                      )}
                    </Text>
                  </View>
                </TouchableNativeFeedback>
              );
            }}
          </ConfirmationAlert>
        </BottomPopup>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  memberSearch: {
    marginVertical: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  active: {
    borderColor: Color.primary,
    borderWidth: 2,
    borderRadius: 20,
  },
  roleBadge: {
    color: Color.white,
    backgroundColor: Color.lightPrimary,
    borderRadius: 50,
    padding: 5,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  memberName: {
    flexWrap: 'wrap',
    flex: 1,
    marginLeft: 20,
  },
  emptyMessage: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    color: Color.silver,
  },
});
