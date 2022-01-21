import { useContext } from 'react';
import { CourseNavigationContext } from '../CourseNavigationContext';
import { initialHomework } from './../../../screens/course/ModifyHomework';

const MAX_TASKS_IN_HOMEWORK = '10';

function useOutsideHomeworkBuilder() {
  const { contextHomework, setContextHomework } = useContext(CourseNavigationContext);

  const initHomework = () => {
    setContextHomework(initialHomework);
  };

  const pushTasksToHomework = tasks => {
    if (!contextHomework) initHomework();
    const existsTasks = contextHomework?.tasks ?? [];

    const tasksToAdd = tasks.filter(task => {
      return !existsTasks.find(x => x.id == task.id);
    });

    const targetTasks = [...existsTasks, ...tasksToAdd];
    if (targetTasks.length > MAX_TASKS_IN_HOMEWORK) {
      targetTasks.splice(MAX_TASKS_IN_HOMEWORK - targetTasks.length);
      console.log(`В одно домашнее задание можно добавить максимум только ${MAX_TASKS_IN_HOMEWORK} заданий!`);
    }

    setContextHomework(homework => ({ ...homework, tasks: targetTasks }));
  };

  return { pushTasksToHomework };
}

export default useOutsideHomeworkBuilder;
