import { useIsFocused } from '@react-navigation/native';
import React, { createContext, useEffect, useRef, useState } from 'react';

export const CourseNavigationContext = createContext();

function CourseNavigationContextProvider({ children }) {
  const [contextTask, setContextTask] = useState();
  const [contextTaskType, setContextTaskType] = useState();
  const [contextTaskTypes, setContextTaskTypes] = useState();
  const [contextHomework, setContextHomework] = useState();
  const [contextGroup, setContextGroup] = useState();
  const [contextGroups, setContextGroups] = useState();

  return (
    <CourseNavigationContext.Provider
      value={{
        contextTask,
        setContextTask,
        contextTaskType,
        setContextTaskType,
        contextTaskTypes,
        setContextTaskTypes,
        contextHomework,
        setContextHomework,
        contextGroup,
        setContextGroup,
        contextGroups,
        setContextGroups,
      }}
    >
      {children}
    </CourseNavigationContext.Provider>
  );
}

export function useOnBackCatcher(callback) {
  const isNeedCallback = useRef(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && isNeedCallback.current) {
      isNeedCallback.current = false;
      callback?.();
    }
  }, [isFocused]);

  const setIsWaitBack = (isNeed = true) => {
    isNeedCallback.current = isNeed;
  };

  return setIsWaitBack;
}

export default CourseNavigationContextProvider;
