import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, TouchableNativeFeedback, View } from 'react-native';
import { useScrollIntoView } from 'react-native-scroll-into-view';
import Color from '../../../constants';
import Resource from '../../../utils/Hateoas/Resource';
import { useTranslation } from '../../../utils/Internationalization';
import BottomPopup from '../../common/BottomPopup';
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
  const [itemContextMenu, setItemContextMenu] = useState(null);

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

  function fetchPage(link) {
    link?.fetch(setLoading).then(newPage => {
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
    fetchPage(memberPage.current?.link('first').fill('name', search));
  }

  function onRefresh() {
    fetchPage(memberPage.current?.link('first'));
  }

  function onKick() {
    members[itemContextMenu]
      .link()
      ?.remove(setLoading)
      .then(() => {
        if (currentUser?.id == members[itemContextMenu].user.id) onLeave?.();
        setItemContextMenu(null);
        setMembers(members.filter(member => member != members[itemContextMenu]));
      });
  }

  return (
    <View style={{ minHeight: keyboardHeight }}>
      <FlatList
        ListHeaderComponent={
          <View ref={active ? viewRef : undefined} style={{ backgroundColor: Color.white }}>
            <SearchBar
              placeholder={searchPlaceholder ?? 'Введите имя...'}
              style={styles.memberSearch}
              onSearch={onSearch}
              emptyAfterValue={members.length == 0 ? search : undefined}
              onEmpty={() => onSearch('')}
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
        onEndReached={onNext}
        onRefresh={onRefresh}
        refreshing={loading}
        onEndReachedThreshold={0.2}
        data={members}
        renderItem={({ item, index }) => {
          let isCurrent = item.user.id == currentUser.id;
          return (
            <TouchableNativeFeedback
              onPress={() => (isCreator || currentUser?.id == item.user.id) && setItemContextMenu(index)}
            >
              <View style={styles.row}>
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
      {itemContextMenu != null && (
        <BottomPopup onClose={() => setItemContextMenu(null)} title={translate('groups.groupDetails.actions')}>
          <TouchableNativeFeedback onPress={onKick}>
            <View style={{ borderTopWidth: StyleSheet.hairlineWidth }}>
              <Text style={{ color: Color.danger, textAlign: 'center', padding: 15 }}>
                {translate(
                  currentUser?.id == members[itemContextMenu]?.user.id
                    ? 'groups.groupDetails.leave'
                    : 'groups.groupDetails.kick',
                )}
              </Text>
            </View>
          </TouchableNativeFeedback>
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
    paddingVertical: 7,
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
