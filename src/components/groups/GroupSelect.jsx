import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableNativeFeedback, View } from 'react-native';
import Color from '../../constants';
import Link from '../../utils/Hateoas/Link';
import Resource from '../../utils/Hateoas/Resource';
import { useTranslation } from '../../utils/Internationalization';
import SearchBar from '../common/SearchBar';
import Text from '../common/Text';

const GROUPS_URL = 'v1/groups';

export default function GroupSelect({ onSelect, roles, numberOfItems = 10 }) {
  const pageRef = useRef(Resource.basedOnHref(GROUPS_URL));
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const { translate } = useTranslation();

  useEffect(() => {
    setGroups([]);
    fetchPage(
      pageRef.current
        .link('first')
        .fill(
          'roles',
          (roles ?? []).map(role => role.name),
        )
        .fill('name', search)
        .fill('size', numberOfItems),
    );
  }, [roles]);

  function fetchPage(link) {
    link.fetch(setLoading).then(page => {
      pageRef.current = page;
      let newGroups = page.list('groups') ?? [];
      setGroups(newGroups);
    });
  }

  function onSearch(search) {
    setSearch(search);
    setGroups([]);
    fetchPage(pageRef.current.link('first').fill('name', search));
  }

  function handleSelect(group) {
    setSelectedGroup(group);
    onSelect?.(group);
  }

  return (
    <View>
      <Text style={styles.title}>{translate('groups.group')}</Text>
      {!selectedGroup && (
        <View>
          <SearchBar
            placeholder={translate('groups.searchPlaceholder')}
            onSearch={onSearch}
            emptyAfterValue={groups.length == 0 ? search : undefined}
          />
          {!loading && (
            <View>
              {groups.map(item => {
                return <GroupItem key={item.id} group={item} onPress={handleSelect} />;
              })}
            </View>
          )}
          {loading && <ActivityIndicator size={50} color={Color.primary} />}
        </View>
      )}
      {selectedGroup && <GroupItem group={selectedGroup} onPress={() => handleSelect(null)} />}
    </View>
  );
}

export function GroupItem({ group, onPress, circleStyle, textStyle }) {
  return (
    <TouchableNativeFeedback disabled={!onPress} onPress={() => onPress?.(group)}>
      <View style={styles.group}>
        <View style={[styles.groupColor, { backgroundColor: group.color }, circleStyle]} />
        <Text style={[styles.groupName, textStyle]} numberOfLines={1}>
          {group.name}
        </Text>
      </View>
    </TouchableNativeFeedback>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 10,
  },
  groupColor: {
    borderRadius: 999,
    height: 18,
    width: 18,
    marginRight: 5,
  },
  groupName: { flex: 1 },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
});