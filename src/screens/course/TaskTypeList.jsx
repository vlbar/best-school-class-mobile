import React, { useContext } from 'react';
import { SafeAreaView } from 'react-native';

import Check from '../../components/common/Check';
import FetchableFlatList from '../../components/tasks/FetchableFlatList';
import Resource from '../../utils/Hateoas/Resource';
import { CourseNavigationContext } from '../../components/course/CourseNavigationContext';
import { getTaskTypeColor } from '../../components/tasks/TaskList';
import { useTranslation } from '../../utils/Internationalization';

const baseUrl = 'v1/task-types';
const baseLink = Resource.basedOnHref(baseUrl).link();
const pageLink = baseLink.fill('size', 20);

export const TASK_TYPE_LIST_SCREEN = 'taskTypeListScreen';
function TaskTypeList({ navigation }) {
  const { translate } = useTranslation();
  const { contextTaskType, setContextTaskType, contextTaskTypes, setContextTaskTypes } =
    useContext(CourseNavigationContext);

  const renderItem = ({ item }) => {
    return <Check.Item key={item.id} title={item.name} name={item.id} type="radio" color={getTaskTypeColor(item.id)} />;
  };

  return (
    <SafeAreaView>
      <FetchableFlatList
        listName="taskTypes"
        headerTitle={translate('task-types.select')}
        renderItem={renderItem}
        link={pageLink}
        initialItems={contextTaskTypes}
        onFetchItems={setContextTaskTypes}
        initialSelectedItem={contextTaskType}
        onSelect={setContextTaskType}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

export default TaskTypeList;
