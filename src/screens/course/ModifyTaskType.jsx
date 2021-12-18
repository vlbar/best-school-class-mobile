import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

import Button from '../../components/common/Button';
import Container from '../../components/common/Container';
import InputForm from '../../components/common/InputForm';
import Header from '../../components/navigation/Header';
import Resource from '../../utils/Hateoas/Resource';
import translate from '../../utils/Internationalization';
import useBestValidation from '../../utils/useBestValidation';
import { useNavigation } from '@react-navigation/native';

const baseUrl = '/v1/task-types';
const baseLink = Resource.basedOnHref(baseUrl).link();

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
function ModifyTaskType() {
  const navigation = useNavigation();

  const [isTypeSaving, setIsTypeSaving] = useState(false);
  const taskTypeValidation = useBestValidation(typeValidationSchema);

  const [taskType, setTaskType] = useState(initialType);
  const setName = name => setTaskType({ ...taskType, name: name });

  const submitHandle = () => {
    if (!taskTypeValidation.validate(taskType)) return;

    let typeToAdd = { ...taskType };
    typeToAdd.name = typeToAdd.name.trim();

    console.log(baseLink)
    baseLink
      .post(typeToAdd, setIsTypeSaving)
      .then(newType => {
        setTaskType(initialType);
        navigation.goBack();
      })
      .catch(error => console.error('Не удалось сохранить тип задания.', error));
  };

  return (
    <>
      <Header title={translate('task-types.modify.add-title')} canBack={!isTypeSaving} />
      <Container style={styles.container}>
        <InputForm
          label={translate('task-types.modify.name')}
          onChange={value => {
            taskTypeValidation.changeHandle('name', value);
            setName(value);
          }}
        />
        <Button
          title={translate('task-types.modify.add-submit')}
          style={styles.button}
          onPress={submitHandle}
          disabled={isTypeSaving}
        />
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
});

export default ModifyTaskType;
