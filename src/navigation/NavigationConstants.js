import { createContext } from 'react';

export const navigatorNames = {
  workspace: 'WorkspaceNavigator',
  homeworks: 'HomeworksNavigator',
  course: 'CourseNavigator',
  groups: 'GroupsNavigator',
};

export const ProfileContext = createContext();

export const profileNavigatorNames = {
  settings: 'SettingsNavigator',
};
