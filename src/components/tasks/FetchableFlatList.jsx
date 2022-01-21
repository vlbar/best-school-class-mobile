import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import Check from '../common/Check';
import Color from '../../constants';
import Header from '../navigation/Header';
import IconButton from '../common/IconButton';
import SearchBar from '../common/SearchBar';
import Text from '../common/Text';
import { ButtonedConfirmationAlert } from '../common/ConfirmationAlert';
import { useTranslation } from '../../utils/Internationalization';

function FetchableFlatList({
  title = 'name',
  link,
  listName,
  headerTitle,
  renderItem,
  initialItems,
  initialSelectedItem,
  emptySearchMessage,
  emptyListMessage,
  onSelect,
  onFetchItems,
  navigation,
}) {
  const { translate } = useTranslation();

  const [selectedItem, setSelectedItem] = useState(initialSelectedItem);
  const [isFetching, setIsFetching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [items, setItems] = useState(initialItems ? (initialItems.list ? initialItems.list : initialItems) : undefined);
  const nextPage = useRef(initialItems?.nextPage);
  const emptyResultAfterName = useRef('');

  const [isApplyChangesAlertShow, setIsApplyChangesAlertShow] = useState(false);

  const filterParam = useRef('');
  const isHasFilterParams = filterParam.current.trim().length;

  useEffect(() => {
    if (items === undefined) fetchPage(false);
  }, []);

  const onSelectTaskType = taskTypeId => {
    setSelectedItem(items.find(x => x.id === taskTypeId));
  };

  const onSave = () => {
    onSelect(selectedItem);
    navigation.goBack();
  };

  const onBack = () => {
    if (selectedItem?.id === initialSelectedItem?.id) return true;
    setIsApplyChangesAlertShow(true);
    return false;
  };

  // fetching
  const fetchItems = (link, refresh) => {
    link
      ?.fetch(refresh ? setIsRefreshing : setIsFetching)
      .then(page => {
        const fetchedItems = page.list(listName);
        nextPage.current = page.link('next');
        let itemsList = [];

        if (page.page.totalElements == 0) emptyResultAfterName.current = link.param(title);
        if (page.page.number == 1) itemsList = fetchedItems;
        else itemsList = [...items, ...fetchedItems];

        setItems(itemsList);
        if (!isHasFilterParams) onFetchItems?.({ list: itemsList, nextPage: nextPage.current });
      })
      .catch(error => {
        console.log('Не удалось загрузить список', title, error);
      });
  };

  const fetchPage = (refresh = true) => {
    fetchItems(link.fill(title, filterParam.current), refresh);
  };

  const fetchNextPage = () => {
    fetchItems(nextPage.current, false);
  };

  const searchByTitle = value => {
    filterParam.current = value;
    fetchPage(false);
  };

  // render
  const defaultRenderItem = ({ item }) => {
    return <Check.Item key={item.id} title={item[title]} name={item.id} type="radio" />;
  };

  const emptyList = (
    <>
      {isHasFilterParams ? (
        <Text style={{ marginTop: 50, textAlign: 'center', color: Color.silver }}>
          {emptySearchMessage ?? translate('common.emptySearch')}
        </Text>
      ) : (
        <Text style={{ marginTop: 50, textAlign: 'center', color: Color.silver }}>
          {emptyListMessage ?? translate('common.emptyList')}
        </Text>
      )}
    </>
  );

  const searchBar = (
    <SearchBar
      onSearch={searchByTitle}
      onDelayStart={() => {
        setIsFetching(true);
        setItems([]);
      }}
    />
  );

  const buttons = [
    {
      text: translate('common.discard'),
      onPress: () => navigation.goBack(),
    },
    {
      text: translate('common.apply'),
      onPress: () => onSave(),
    },
  ];

  return (
    <>
      <Header
        title={headerTitle}
        headerRight={<IconButton name="checkmark-outline" onPress={onSave} />}
        onBack={onBack}
      />
      <ButtonedConfirmationAlert
        show={isApplyChangesAlertShow}
        title={translate('common.applyChanges')}
        text={translate('common.applyChangesText')}
        buttons={buttons}
      />
      <Check.Group onChange={target => onSelectTaskType(target.name)} defaultValue={selectedItem?.id}>
        <FlatList
          data={items}
          refreshing={isRefreshing}
          renderItem={renderItem ?? defaultRenderItem}
          ListHeaderComponent={searchBar}
          ListFooterComponent={isFetching && <ActivityIndicator color={Color.primary} size={50} />}
          ListEmptyComponent={!isFetching && !isRefreshing && emptyList}
          stickyHeaderIndices={[0]}
          stickyHeaderHiddenOnScroll={true}
          onRefresh={fetchPage}
          onEndReached={fetchNextPage}
          onEndReachedThreshold={0.7}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20 }}
        />
      </Check.Group>
    </>
  );
}

export default FetchableFlatList;
