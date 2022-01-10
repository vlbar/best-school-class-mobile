import React, { useContext, useEffect, useState } from 'react';
import { View, SafeAreaView, StyleSheet, ScrollView, Pressable } from 'react-native';
import IconButton from '../../components/common/IconButton';

import Bandage from '../../components/tasks/filters/Bandage';
import Color from '../../constants';
import Header from '../../components/navigation/Header';
import Text from '../../components/common/Text';
import useBestValidation, { BestValidation } from './../../utils/useBestValidation';
import { ButtonedConfirmationAlert } from '../../components/common/ConfirmationAlert';
import { CourseNavigationContext, useOnBackCatcher } from './../../components/course/CourseNavigationContext';
import { TASK_TYPE_LIST_SCREEN } from './TaskTypeList';
import { clearHtmlTags } from '../../utils/TextUtils';
import { getTaskTypeColor } from '../../components/tasks/TaskList';
import { isEquivalent } from '../../components/tasks/edit/useQuestionSaveManager';
import { useTranslation } from '../../utils/Internationalization';

export const TASK_EDIT_SCREEN = 'taskEdit';
function TaskEdit({ navigation }) {
  const { translate } = useTranslation();

  const [taskDetails, setTaskDetails] = useState();
  const [isApplyChangesAlertShow, setIsApplyChangesAlertShow] = useState(false);
  const { contextTask, setContextTask, contextTaskType, setContextTaskType } = useContext(CourseNavigationContext);
  const waitBackFromTaskType = useOnBackCatcher(onBackFromTaskType);

  const setName = name => setTaskDetails(task => ({ ...task, name }));
  const setDescription = description => setTaskDetails(task => ({ ...task, description }));
  const setMaxScore = maxScore => setTaskDetails(task => ({ ...task, maxScore }));
  const setDuration = duration => setTaskDetails(task => ({ ...task, duration }));
  const setTaskType = taskType => setTaskDetails(task => ({ ...task, taskType }));

  useEffect(() => {
    setTaskDetails(contextTask);
  }, []);

  const taskValidationSchema = {
    name: {
      type: 'string',
      required: [translate('tasks.edit.validation.name.required')],
      min: [5, translate('tasks.edit.validation.name.min', { min: 5 })],
      max: [100, translate('tasks.edit.validation.name.max')],
    },
    description: {
      type: 'string',
      required: false,
      max: [2048, translate('tasks.edit.validation.description.max')],
    },
    maxScore: {
      type: 'number',
      required: [translate('tasks.edit.validation.maxScore.required')],
      min: [1, translate('tasks.edit.validation.maxScore.positive')],
      max: [9223372036854775807, translate('tasks.edit.validation.maxScore.max')],
    },
    duration: {
      type: 'number',
      nullable: true,
      min: [1, translate('tasks.edit.validation.duration.positive')],
      max: [99999, translate('tasks.edit.validation.duration.max')],
    },
  };

  const taskValidation = useBestValidation(taskValidationSchema);

  const onSave = () => {
    let taskToUpdate = taskDetails;
    taskToUpdate.taskTypeId = taskDetails.taskType?.id;

    if(!taskValidation.validate(taskDetails)) return;

    taskDetails
      .link()
      .put(taskToUpdate)
      .catch(err => {
        console.log(err);
      });

    setContextTask(taskDetails);
    navigation.goBack();
  };

  const onBack = () => {
    if (isEquivalent(contextTask, taskDetails)) return true;
    setIsApplyChangesAlertShow(true);
    return false;
  };

  const selectTaskType = () => {
    waitBackFromTaskType();
    setContextTaskType(taskDetails.taskType);
    navigation.navigate(TASK_TYPE_LIST_SCREEN);
  };

  function onBackFromTaskType() {
    setTaskType(contextTaskType);
  }

  const buttons = [
    {
      text: translate('common.discard'),
      onPress: () => navigation.goBack(),
    },
    {
      text: translate('common.apply'),
      onPress: () => onSave(),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        title={translate('tasks.edit.title')}
        headerRight={<IconButton name="checkmark-outline" onPress={onSave} />}
        onBack={onBack}
      />
      <ButtonedConfirmationAlert
        show={isApplyChangesAlertShow}
        title={translate('common.applyChanges')}
        text={translate('common.applyChangesText')}
        buttons={buttons}
      />
      <ScrollView>
        <View style={{ flex: 1, marginHorizontal: 20 }}>
          <BestValidation.Context validation={taskValidation} entity={taskDetails}>
            <BestValidation.InputForm
              name="name"
              label={translate('tasks.edit.name')}
              onChange={value => setName(value)}
              maxLenght={taskValidationSchema.name.max[0]}
            />
            <BestValidation.InputForm
              name="description"
              value={clearHtmlTags(taskDetails?.description)}
              multiline
              label={translate('tasks.edit.description')}
              onChange={value => setDescription(value)}
              maxLenght={taskValidationSchema.description.max[0]}
            />

            <View style={[styles.row, { marginBottom: 15 }]}>
              <Text style={styles.rowText} fontSize={14}>
                {translate('tasks.edit.taskType')}
              </Text>
              <Pressable onPress={selectTaskType}>
                <Bandage
                  title={taskDetails?.taskType?.name ?? translate('tasks.edit.noTaskType')}
                  size={18}
                  color={taskDetails?.taskType ? getTaskTypeColor(taskDetails.taskType.id) : Color.veryLightGray}
                />
              </Pressable>
            </View>
            <InputFormRow
              name="maxScore"
              label={translate('tasks.edit.maxScore')}
              keyboardType="numeric"
              onChange={value => setMaxScore(value)}
              style={{ marginBottom: 6 }}
            />
            <Text fontSize={12} color={Color.silver} style={{ marginBottom: 10 }}>
              {translate('tasks.edit.maxScoreSubtitle')}
            </Text>
            <InputFormRow
              name="duration"
              label={translate('tasks.edit.duration')}
              keyboardType="numeric"
              onChange={value => setDuration(value)}
            />
          </BestValidation.Context>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InputFormRow({ label, style, ...props }) {
  return (
    <>
      <View style={styles.row}>
        <Text style={styles.rowText} fontSize={14}>
          {label}
        </Text>
        <BestValidation.InputForm hideErrorMessage style={[styles.rowInput, style]} {...props} />
      </View>
      <BestValidation.ErrorMessage name={props.name} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowText: {
    color: Color.silver,
    marginBottom: 8,
  },
  rowInput: {
    maxWidth: 120,
  },
});

export default TaskEdit;
