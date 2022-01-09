import React, { useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';

import Check from '../common/Check';
import Header from '../navigation/Header';
import IconButton from '../common/IconButton';
import SearchBar from '../common/SearchBar';
import { ButtonedConfirmationAlert } from '../common/ConfirmationAlert';
import { useTranslation } from '../../utils/Internationalization';

function FetchableFlatList({
  initialItems,
  initialSelectedItem,
  onFetchItems,
  listName,
  renderItem,
  title = 'name',
  headerTitle,
  link,
  onSelect,
  navigation
}) {
  const { translate } = useTranslation();

  const [selectedItem, setSelectedItem] = useState(initialSelectedItem);
  const [isFetching, setIsFetching] = useState(false);
  const [items, setItems] = useState(initialItems);
  const nextPage = useRef(undefined);
  const emptyResultAfterName = useRef('');

  const [isApplyChangesAlertShow, setIsApplyChangesAlertShow] = useState(false);

  const filterParams = useRef({});

  useEffect(() => {
    filterParams.current[title] = '';
    if (items === undefined) refreshPage();
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
  const fetchItems = link => {
    link
      ?.fetch(setIsFetching)
      .then(page => {
        const fetchedItems = page.list(listName);
        nextPage.current = page.link('next');
        let itemsList = [];

        if (page.page.totalElements == 0) emptyResultAfterName.current = link.param(title);
        if (page.page.number == 1) itemsList = fetchedItems;
        else itemsList = [...itemsList, ...fetchedItems];

        setItems(itemsList);
        onFetchItems?.(itemsList);
      })
      .catch(error => {
        console.log('Не удалось загрузить список', title, error);
      });
  };

  const refreshPage = () => {
    fetchItems(link.fill(title, filterParams.current[title] ?? ''));
  };

  const fetchNextPage = () => {
    fetchItems(nextPage.current);
  };

  const searchByTitle = title => {
    filterParams.current[title] = title;
    refreshPage();
  };

  // render
  const defaultRenderItem = ({ item }) => {
    return <Check.Item key={item.id} title={item[title]} name={item.id} type="radio" />;
  };

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
          renderItem={renderItem ?? defaultRenderItem}
          refreshing={isFetching}
          ListHeaderComponent={<SearchBar onSearch={searchByTitle} />}
          stickyHeaderIndices={[0]}
          onRefresh={!items && refreshPage}
          stickyHeaderHiddenOnScroll={true}
          onEndReached={fetchNextPage}
          onEndReachedThreshold={0.7}
          style={{ marginHorizontal: 20 }}
        />
      </Check.Group>
    </>
  );
}

export default FetchableFlatList;
