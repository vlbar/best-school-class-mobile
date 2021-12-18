import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import Button from '../../components/common/Button';
import Container from '../../components/common/Container';
import InputForm from '../../components/common/InputForm';
import Header from '../../components/navigation/Header';
import Color from '../../constants';
import Resource from '../../utils/Hateoas/Resource';
import translate from '../../utils/Internationalization';
import useBestValidation from '../../utils/useBestValidation';

const baseUrl = '/v1/task-types';
const baseLink = Resource.basedOnHref(baseUrl).link();
const typeLink = id => Resource.basedOnHref(`${baseUrl}/${id}`).link();

const initialType = {
  name: '',
};

const typeValidationSchema = {
  name: {
    type: 'string',
    required: ['Не введено название задания'],
    min: [3, 'Слишком короткое название'],
    max: [100, 'Слишком длинное название'],
  },
};

export const MODIFY_TASK_TYPE_SCREEN = 'modifyTaskType';
function ModifyTaskType({ navigation, route }) {
  const { taskTypeName, taskTypeId } = route.params;
  const typeToEdit = taskTypeId ? { id: taskTypeId, name: taskTypeName } : undefined;

  const [isTypeSaving, setIsTypeSaving] = useState(false);
  const taskTypeValidation = useBestValidation(typeValidationSchema);

  const [taskType, setTaskType] = useState(typeToEdit ?? initialType);
  const setName = name => setTaskType({ ...taskType, name: name });

  const submitHandle = () => {
    if (!taskTypeValidation.validate(taskType)) return;

    let typeToAdd = { ...taskType };
    if (typeToEdit) typeToAdd.id = typeToEdit.id;
    typeToAdd.name = typeToAdd.name.trim();

    const request = typeToAdd.id
      ? typeLink(typeToAdd.id).put(typeToAdd, setIsTypeSaving)
      : baseLink.post(typeToAdd, setIsTypeSaving);

    request
      .then(newType => {
        setTaskType(initialType);
        navigation.goBack();
      })
      .catch(error => console.error('Не удалось сохранить тип задания.', error));
  };

  const title = translate('common.confirmation');
  const confirmation = translate('task-types.modify.delete-confirmation');
  const ok = translate('common.ok');
  const cancel = translate('common.cancel');

  function showDeleteAlert() {
    Alert.alert(title, confirmation, [
      {
        text: cancel,
        style: 'cancel',
      },
      { text: ok, onPress: () => deleteType() },
    ]);
  }

  const deleteType = () => {
    typeLink(typeToEdit.id)
      .delete()
      .then(newType => {
        setTaskType(initialType);
        navigation.goBack();
      })
      .catch(error => console.error('Не удалось удалить тип задания.', error));
  };

  return (
    <>
      <Header
        title={typeToEdit ? translate('task-types.modify.edit-title') : translate('task-types.modify.add-title')}
        canBack={!isTypeSaving}
      />
      <Container style={styles.container}>
        <InputForm
          label={translate('task-types.modify.name')}
          value={taskType.name}
          errorMessage={taskTypeValidation.errors.name}
          onChange={value => {
            taskTypeValidation.changeHandle('name', value);
            setName(value);
          }}
          autoFocus={true}
        />
        <View>
          <Button
            title={typeToEdit ? translate('task-types.modify.edit-submit') : translate('task-types.modify.add-submit')}
            style={styles.button}
            onPress={submitHandle}
            disabled={isTypeSaving}
          />
          {typeToEdit && (
            <Button
              title={translate('task-types.modify.delete')}
              style={[styles.button, styles.danger]}
              onPress={showDeleteAlert}
              disabled={isTypeSaving}
            />
          )}
        </View>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
  },
  button: {
    marginBottom: 10,
  },
  danger: {
    backgroundColor: Color.danger,
  },
});

export default ModifyTaskType;
