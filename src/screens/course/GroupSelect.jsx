import React, { useContext } from 'react';
import { SafeAreaView } from 'react-native';

import Check from '../../components/common/Check';
import FetchableFlatList from '../../components/tasks/FetchableFlatList';
import Resource from '../../utils/Hateoas/Resource';
import { CourseNavigationContext } from '../../components/course/CourseNavigationContext';
import { ProfileContext } from '../../navigation/NavigationConstants';
import { useTranslation } from '../../utils/Internationalization';

const baseUrl = 'v1/groups';
const baseLink = Resource.basedOnHref(baseUrl).link();

export const GROUP_SELECT_SCREEN = 'groupSelectScreen';
function GroupSelect({ navigation }) {
  const { translate } = useTranslation();
  const { contextGroup, setContextGroup, contextGroups, setContextGroups } = useContext(CourseNavigationContext);
  const { state } = useContext(ProfileContext);

  const pageLink = baseLink.fill('size', 20).fill('roles', state.name);

  const renderItem = ({ item }) => {
    return <Check.Item key={item.id} title={item.name} name={item.id} type="radio" color={item.color} />;
  };

  return (
    <SafeAreaView>
      <FetchableFlatList
        listName="groups"
        headerTitle={translate('groups.select')}
        emptySearchMessage={translate('groups.emptySearch')}
        emptyListMessage={translate('groups.empty')}
        renderItem={renderItem}
        link={pageLink}
        initialItems={contextGroups}
        onFetchItems={setContextGroups}
        initialSelectedItem={contextGroup}
        onSelect={setContextGroup}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

export default GroupSelect;
