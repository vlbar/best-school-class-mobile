import { createContext } from 'react';
import { navigatorNames } from '../NavigationConstants';

export const GroupsContext = createContext();

export const GROUP_TASKS = 'groups_' + navigatorNames.homeworks;