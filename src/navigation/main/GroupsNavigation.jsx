import React, { useState } from 'react';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import Groups, { GROUPS_SCREEN } from '../../screens/groups/Groups';
import GroupDetails, { GROUPS_DETAILS_SCREEN } from '../../screens/groups/GroupDetails';
import CreateGroup, { CREATE_GROUP_SCREEN } from '../../screens/groups/CreateGroup';
import JoinGroup, { JOIN_GROUP_SCREEN } from '../../screens/groups/JoinGroup';
import { GroupsContext, GROUP_TASKS } from './GroupsNavigationConstants';
import HomeworksNavigation from './HomeworksNavigation';

const Stack = createStackNavigator();

const GroupsNavigation = () => {
  const [groups, setGroups] = useState([]);

  function onUpdate(group) {
    const newGroups = [...groups.filter(g => g.id != group.id), group].sort(
      (g1, g2) => g2.membership.joinDate - g1.membership.joinDate,
    );
    setGroups(newGroups);
  }

  function onCreate(group) {
    setGroups([group, ...groups]);
  }

  function onDelete(group) {
    setGroups(groups.filter(g => g != group));
  }

  return (
    <GroupsContext.Provider value={{ groups, setGroups, onUpdate, onCreate, onDelete }}>
      <Stack.Navigator
        initialRouteName={GROUPS_SCREEN}
        screenOptions={{ headerShown: false, ...TransitionPresets.ScaleFromCenterAndroid }}
      >
        <Stack.Screen name={GROUPS_SCREEN} component={Groups} />
        <Stack.Screen name={GROUPS_DETAILS_SCREEN} component={GroupDetails} />
        <Stack.Screen name={CREATE_GROUP_SCREEN} component={CreateGroup} />
        <Stack.Screen name={JOIN_GROUP_SCREEN} component={JoinGroup} />
        {
          //FIXME: maybe fixed by navigation group??? (by redux for sure)}
        }
        <Stack.Screen name={GROUP_TASKS} component={HomeworksNavigation} />
      </Stack.Navigator>
    </GroupsContext.Provider>
  );
};

export default GroupsNavigation;
