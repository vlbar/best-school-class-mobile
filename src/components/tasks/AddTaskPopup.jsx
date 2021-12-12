import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomPopup from '../common/BottomPopup';
import InputForm from './../common/InputForm';
import Button from './../common/Button';
import useBestValidation from './../../utils/useBestValidation';
import Resource from './../../utils/Hateoas/Resource';
import translate from '../../utils/Internationalization';

const baseUrl = '/v1/tasks';
const baseLink = Resource.basedOnHref(baseUrl).link();

const initialTask = {
  name: '',
  courseId: undefined,
};

const taskValidationSchema = {
  name: {
    type: 'string',
    required: ['Не введено название задания'],
    min: [3, 'Слишком короткое название'],
    max: [100, 'Слишком длинное название'],
  },
};

function AddTaskPopup({ show = true, parentCourse, onSuccess, onFailure, onClose }) {
  const [isTaskSaving, setIsTaskSaving] = useState(false);
  const [task, setTask] = useState(initialTask);

  const taskValidation = useBestValidation(taskValidationSchema);

  const setName = name => setTask({ ...task, name: name });

  const submitHandle = () => {
    if (!taskValidation.validate(task)) return;

    let taskToAdd = { ...task };
    taskToAdd.name = taskToAdd.name.trim();
    taskToAdd.courseId = parentCourse.id;

    baseLink
      .post(taskToAdd, setIsTaskSaving)
      .then((newTask) => {
        setTask(initialTask);
        onSuccess?.(newTask);
      })
      .catch(() => onFailure?.());
  };

  const onCloseHandler = () => {
      if(!isTaskSaving) {
        onClose?.();
      }
  }

  return (
    <BottomPopup title={translate('tasks.add.title')} show={show} canClose={!isTaskSaving} onClose={onCloseHandler}>
      <View style={styles.container}>
        <InputForm
          label={translate('tasks.add.name')}
          value={task.name}
          errorMessage={taskValidation.errors.name}
          onChange={value => {
            taskValidation.changeHandle('name', value);
            setName(value);
          }}
        />
        <Button title={translate('tasks.add.submit')} disabled={isTaskSaving} onPress={submitHandle} />
      </View>
    </BottomPopup>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
});

export default AddTaskPopup;
