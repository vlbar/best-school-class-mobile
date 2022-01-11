import React, { useContext, useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import Color from '../../constants';
import DatePickerPopup from '../../components/tasks/DatePickerPopup';
import Header from '../../components/navigation/Header';
import IconButton from '../../components/common/IconButton';
import Resource from '../../utils/Hateoas/Resource';
import SearchBar from '../../components/common/SearchBar';
import TaskList from '../../components/tasks/TaskList';
import Text from '../../components/common/Text';
import useBestValidation, { BestValidation } from '../../utils/useBestValidation';
import { ButtonedConfirmationAlert } from '../../components/common/ConfirmationAlert';
import { CourseNavigationContext, useOnBackCatcher } from '../../components/course/CourseNavigationContext';
import { GROUP_SELECT_SCREEN } from './GroupSelect';
import { GroupItem } from '../../components/groups/GroupSelect';
import { TASK_SCREEN } from './TaskQuestions';
import { useTranslation } from '../../utils/Internationalization';

const OPEN_DATE = 'openingDate';
const CLOSE_DATE = 'endingDate';

const baseUrl = 'v1/homeworks';
const baseLink = Resource.basedOnHref(baseUrl).link();

export const initialHomework = {
  group: null,
  openingDate: null,
  endingDate: null,
  tasks: [],
};

export const MODIFY_HOMEWORK = 'modifyHomework';
function ModifyHomework({ navigation }) {
  const { translate } = useTranslation();

  const { contextHomework, setContextHomework } = useContext(CourseNavigationContext);
  const homework = contextHomework ?? initialHomework;
  const setHomework = setContextHomework;
  const [isSaving, setIsSaving] = useState(false);

  const setGroup = group => setHomework(homework => ({ ...homework, group }));
  const setOpenDate = openingDate => setHomework(homework => ({ ...homework, openingDate }));
  const setCloseDate = endingDate => setHomework(homework => ({ ...homework, endingDate }));
  const setTasks = tasks => setHomework(homework => ({ ...homework, tasks }));

  const homeworkValidationSchema = {
    group: {
      type: 'object',
      required: [translate('homeworks.modify.validation.groupRequired')],
    },
    openingDate: {
      type: 'number',
      required: [translate('homeworks.modify.validation.dateRequired')],
      max: [homework.endingDate, translate('homeworks.modify.validation.openAfterClose')],
    },
    endingDate: {
      type: 'number',
      required: [translate('homeworks.modify.validation.dateRequired')],
      min: [homework.openingDate, translate('homeworks.modify.validation.closeBeforeOpen')],
      custom: {
        invalidTerm: [endDateBeforeNow, translate('homeworks.modify.validation.endDateBeforeNow')],
      },
    },
    tasks: {
      type: 'array',
      required: [translate('homeworks.modify.validation.tasksRequired')],
    },
  };

  const homeworkValidation = useBestValidation(homeworkValidationSchema);

  const waitBackFromGroupSelect = useOnBackCatcher(onBackFromGroupSelect);
  const { contextGroup, setContextGroup } = useContext(CourseNavigationContext);

  const [datePickerProps, setDatePickerProps] = useState({
    date: new Date(),
  });
  const [isDatePickerShow, setIsDatePickerShow] = useState(false);

  const [isConfirmationAlertShow, setIsConfirmationAlertShow] = useState(false);

  useEffect(() => {
    if (!contextHomework) setContextHomework(initialHomework);
  }, []);

  // group
  const selectGroup = () => {
    waitBackFromGroupSelect();
    setContextGroup(homework.group);
    navigation.navigate(GROUP_SELECT_SCREEN);
  };

  function onBackFromGroupSelect() {
    setGroup(contextGroup);
    homeworkValidation.blurHandle('group', contextGroup);
  }

  // dates
  const pickDate = type => {
    switch (type) {
      case OPEN_DATE:
        setDatePickerProps({
          type,
          date: homework.openingDate ? new Date(homework.openingDate) : new Date(),
          title: translate('homework.openingDate'),
        });
        break;
      case CLOSE_DATE:
        setDatePickerProps({
          type,
          date: homework.endingDate ? new Date(homework.endingDate) : new Date(),
          title: translate('homework.endingDate'),
        });
        break;
    }
    setIsDatePickerShow(true);
  };

  const onDateChange = date => {
    switch (datePickerProps.type) {
      case OPEN_DATE:
        setOpenDate(date.getTime());
        homeworkValidation.changeHandle(CLOSE_DATE, homework.endingDate);
        if (homework.endingDate) homeworkValidation.blurHandle(datePickerProps.type, date.getTime());
        break;
      case CLOSE_DATE:
        setCloseDate(date.getTime());
        homeworkValidation.changeHandle(OPEN_DATE, homework.openingDate);
        if (homework.openingDate) homeworkValidation.blurHandle(datePickerProps.type, date.getTime());
        break;
    }
  };

  // tasks
  const removeTasks = tasks => {
    const existsTasks = homework.tasks;
    setTasks(
      existsTasks.filter(task => {
        return !tasks.find(x => x.id == task.id);
      }),
    );
  };

  const tryToAskHomework = () => {
    if (!homeworkValidation.validate(homework)) return;
    setIsConfirmationAlertShow(true);
  };

  const askHomework = () => {
    const homeworkDTO = toHomeworkDTO(homework);
    baseLink
      .post(homeworkDTO, setIsSaving)
      .then(data => {
        setContextHomework(undefined);
        navigation.goBack();
      })
      .catch(error => console.log(error))
      .finally(() => setIsConfirmationAlertShow(false));
  };

  // render
  const actionMenu = selectedTasks => {
    return (
      <>
        {selectedTasks?.length === 1 && (
          <IconButton
            name="create-outline"
            size={24}
            onPress={() => navigation.navigate(TASK_SCREEN, { id: selectedTasks[0].id })}
          />
        )}
        <IconButton name="trash-outline" size={24} onPress={() => removeTasks(selectedTasks)} />
      </>
    );
  };

  const header = <SearchBar onSearch={() => {}} />;

  const tip = (
    <>
      {translate('homeworks.modify.howAddTasks')}
      {'\n'}
      {'\n'}
      <Icon name="push-outline" size={24} />
    </>
  );

  const buttons = [
    {
      text: translate('common.cancel'),
      style: 'cancel',
      onPress: () => setIsConfirmationAlertShow(false),
    },
    {
      text: translate('homeworks.modify.ask'),
      onPress: () => askHomework(),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        title={translate('homeworks.homework')}
        headerRight={<IconButton name="checkmark-outline" onPress={tryToAskHomework} disabled={isSaving} />}
      />
      <View style={{ flex: 1, marginHorizontal: 20 }}>
        <View style={{ flexGrow: 1 }}>
          <BestValidation.Context validation={homeworkValidation} entity={homework}>
            <View style={[styles.row, { marginBottom: 15 }]}>
              <Text style={styles.rowText} fontSize={14}>
                {translate('homeworks.modify.group')}
              </Text>
              <Pressable onPress={selectGroup}>
                {homework.group ? (
                  <GroupItem group={homework.group} circleStyle={styles.groupCircle} textStyle={styles.groupName} />
                ) : (
                  <Text>{translate('homeworks.modify.noGroup')}</Text>
                )}
              </Pressable>
            </View>
            <BestValidation.ErrorMessage name="group" />

            <View style={[styles.row, { marginBottom: 15 }]}>
              <Text style={styles.rowText} fontSize={14}>
                {translate('homeworks.modify.openingDate')}
              </Text>
              <Pressable onPress={() => pickDate(OPEN_DATE)}>
                <Text>
                  {homework?.openingDate
                    ? moment(homework.openingDate).format('llll')
                    : translate('homeworks.modify.noDate')}
                </Text>
              </Pressable>
            </View>
            <BestValidation.ErrorMessage name="openingDate" />

            <View style={[styles.row, { marginBottom: 15 }]}>
              <Text style={styles.rowText} fontSize={14}>
                {translate('homeworks.modify.endingDate')}
              </Text>
              <Pressable onPress={() => pickDate(CLOSE_DATE)}>
                <Text>
                  {homework?.endingDate
                    ? moment(homework.endingDate).format('llll')
                    : translate('homeworks.modify.noDate')}
                </Text>
              </Pressable>
            </View>
            <BestValidation.ErrorMessage name="endingDate" />
            <BestValidation.ErrorMessage name="tasks" />
            <Text>{translate('homeworks.modify.tasks')}:</Text>
            <TaskList
              data={homework?.tasks}
              canSelect
              headerContent={header}
              canFetch={false}
              actionMenuContent={actionMenu}
              additionalEmptyMessage={tip}
              style={{ marginHorizontal: -10, marginTop: 10 }}
            />
          </BestValidation.Context>
        </View>

        <DatePickerPopup
          show={isDatePickerShow}
          date={datePickerProps.date}
          title={datePickerProps.title}
          onSelect={date => onDateChange(date)}
          onClose={() => setIsDatePickerShow(false)}
        />
        <ButtonedConfirmationAlert
          show={isConfirmationAlertShow}
          text={translate('homeworks.modify.askConfirmation')}
          buttons={buttons}
        />
      </View>
    </SafeAreaView>
  );
}

function endDateBeforeNow(date) {
  return date > new Date().getTime();
}

function toHomeworkDTO(homework) {
  return {
    id: homework.id,
    groupId: homework.group.id,
    openingDate: homework.openingDate,
    endingDate: homework.endingDate,
    taskIds: homework.tasks.map(x => x.id),
  };
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
    marginVertical: 5,
  },
  rowInput: {
    maxWidth: 120,
  },
  groupCircle: {
    width: 18,
    height: 18,
  },
  groupName: {
    fontSize: 17,
    flex: 0,
  },
});

export default ModifyHomework;
