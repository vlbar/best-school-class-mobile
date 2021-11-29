import md5 from 'md5';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, StyleSheet, TouchableNativeFeedback, View } from 'react-native';
import Color from '../../../constants';
import Resource from '../../../utils/Hateoas/Resource';
import BottomPopup from '../../common/BottomPopup';
import SearchBar from '../../common/SearchBar';
import Text from '../../common/Text';

export default function MemberList({ fetchLink, searchPlaceholder }) {
  const memberPage = useRef(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemContextMenu, setItemContextMenu] = useState(null);

  useEffect(() => {
    if (fetchLink) {
      memberPage.current = Resource.based(fetchLink);
      fetchPage(fetchLink);
    }
  }, [fetchLink]);

  function fetchPage(link) {
    link.fetch(setLoading).then(newPage => {
      memberPage.current = newPage;
      let newMembers = newPage.list('members') ?? [];
      if (newPage.page.number === 1) setMembers(newMembers);
      else setMembers([...members, ...newMembers]);
    });
  }

  function onNext() {
    memberPage.current.onLink('next', fetchPage);
  }

  function onSearch(search) {
    fetchPage(memberPage.current.link('first').fill('name', search));
  }

  function onRefresh() {
    fetchPage(memberPage.current.link('first'));
  }

  function onKick() {
    members[itemContextMenu]
      .link()
      .remove(setLoading)
      .then(() => {
        setMembers(members.filter(member => member != members[itemContextMenu]));
        setItemContextMenu(null);
      });
  }

  return (
    <>
      <FlatList
        ListHeaderComponent={
          <View style={{ backgroundColor: Color.white }}>
            {members.length > 0 && (
              <SearchBar
                placeholder={searchPlaceholder ?? 'Введите имя...'}
                style={styles.memberSearch}
                onChange={onSearch}
              />
            )}
          </View>
        }
        ListEmptyComponent={<Text style={{ textAlign: 'center' }}>Похоже, тут пока никого нет :(</Text>}
        onEndReached={onNext}
        onEndReachedThreshold={0.2}
        data={members}
        renderItem={({ item, index }) => {
          return (
            <TouchableNativeFeedback onPress={() => setItemContextMenu(index)}>
              <View style={styles.row}>
                <Image
                  style={styles.icon}
                  source={{
                    uri: `http://cdn.libravatar.org/avatar/${md5(item.user.email)}?s=100&&d=${
                      item.user.email ? 'identicon' : 'mm'
                    }&&r=g`,
                  }}
                ></Image>
                <Text>
                  {item.user.secondName} {item.user.firstName} {item.user.middleName ?? ''}
                </Text>
              </View>
            </TouchableNativeFeedback>
          );
        }}
        keyExtractor={item => item.id}
      />
      {itemContextMenu != null && (
        <BottomPopup onClose={() => setItemContextMenu(null)} title="Действия">
          <TouchableNativeFeedback onPress={onKick}>
            <View style={{ borderTopWidth: StyleSheet.hairlineWidth }}>
              <Text style={{ color: Color.danger, textAlign: 'center', padding: 15 }}>Выгнать</Text>
            </View>
          </TouchableNativeFeedback>
        </BottomPopup>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  memberSearch: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  icon: {
    borderRadius: 50,
    width: 50,
    height: 50,
    marginRight: 20,
  },
});
