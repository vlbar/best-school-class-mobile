import React, { useContext, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as yup from 'yup';
import Color from '../../constants';
import Button from '../../components/common/Button';
import Container from '../../components/common/Container';
import InputForm from '../../components/common/InputForm';
import Link from '../../utils/Hateoas/Link';
import Header from '../../components/navigation/Header';
import IconButton from '../../components/common/IconButton';
import { GROUPS_DETAILS_SCREEN } from './GroupDetails';
import getContrastColor from '../../utils/ContrastColor';
import ColorPicker from '../../components/groups/ColorPicker';
import Text from '../../components/common/Text';
import { GroupsContext } from '../../navigation/main/GroupsNavigationConstants';
import { getCurrentLanguage, useTranslation } from '../../utils/Internationalization';
import { Formik } from 'formik';
import FormGroup from '../../components/common/FormGroup';

const GROUP_COLORS = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
];

export const CREATE_GROUP_SCREEN = 'createGroup';
export default function CreateGroup({ route, navigation }) {
  const createLink = new Link(route.params.createLink ?? '');
  const updatingGroup = route.params.updatingGroup;
  const { translate } = useTranslation();
  const currentLanguage = getCurrentLanguage();

  const { groups, onCreate, onUpdate } = useContext(GroupsContext);
  const group = useMemo(() => (updatingGroup ? groups.find(g => g.id == updatingGroup) : null), [route]);

  const createSchema = useMemo(() => {
    return yup.object().shape({
      name: yup
        .string()
        .trim()
        .min(2, translate('groups.groupCreate.validation.nameTooSmall'))
        .max(50, translate('groups.groupCreate.validation.nameTooLarge'))
        .required(translate('groups.groupCreate.validation.nameRequired')),
      subject: yup
        .string()
        .trim()
        .min(2, translate('groups.groupCreate.validation.subjectTooSmall'))
        .max(30, translate('groups.groupCreate.validation.subjectTooLarge')),
    });
  }, [currentLanguage]);

  function onSubmit(values, setSubmitting) {
    if (updatingGroup) updateGroup(values, setSubmitting);
    else createGroup(values, setSubmitting);
  }

  function createGroup({ name, subject, color }, setLoading) {
    createLink
      .post(
        {
          name,
          subject,
          color,
        },
        setLoading,
      )
      .then(group => {
        onCreate({ ...group, membership: { joinDate: new Date().getTime() }, full: false });
        navigation.replace(GROUPS_DETAILS_SCREEN, {
          groupId: group.id,
        });
      });
  }

  function updateGroup({ name, subject, color }, setLoading) {
    group
      .link()
      .put(
        {
          name,
          subject,
          color,
        },
        setLoading,
      )
      .then(() => {
        onUpdate({ ...group, name, subject, color });
        navigation.goBack();
      });
  }

  return (
    <Formik
      initialValues={{
        name: group?.name ?? '',
        subject: group?.subject ?? '',
        color: group?.color ?? GROUP_COLORS[0],
      }}
      validationSchema={createSchema}
      onSubmit={(values, { setSubmitting }) => {
        const castedValues = createSchema.cast(values);
        onSubmit(castedValues, setSubmitting);
      }}
    >
      {({ dirty, isValid, touched, isSubmitting, errors, handleChange, handleBlur, handleSubmit, values }) => (
        <>
          <Header
            title={translate(updatingGroup ? 'groups.groupCreate.updateGroup' : 'groups.groupCreate.createGroup')}
            canBack
            backgroundColor={values.color}
            headerRight={
              <IconButton
                name="checkmark"
                disabled={!(dirty && isValid && !isSubmitting)}
                color={getContrastColor(values.color)}
                onPress={handleSubmit}
              />
            }
          />
          <Container style={styles.container}>
            <View>
              <FormGroup>
                <InputForm
                  onChange={handleChange('name')}
                  onBlur={handleBlur('name')}
                  value={values.name}
                  errorMessage={touched.name && errors.name}
                  label={translate('groups.groupCreate.name')}
                />
                <InputForm
                  onChange={handleChange('subject')}
                  onBlur={handleBlur('subject')}
                  value={values.subject}
                  errorMessage={touched.subject && errors.subject}
                  label={translate('groups.groupCreate.subject')}
                />
              </FormGroup>
              <Text style={styles.label}>{translate('groups.groupCreate.color')}</Text>
              <ColorPicker onChange={handleChange('color')} value={values.color} colors={GROUP_COLORS.slice(0, 6)} />
              <ColorPicker onChange={handleChange('color')} value={values.color} colors={GROUP_COLORS.slice(6)} />
            </View>
            <Button
              title={translate(updatingGroup ? 'groups.groupCreate.update' : 'groups.groupCreate.create')}
              disabled={!(dirty && isValid && !isSubmitting)}
              onPress={handleSubmit}
            ></Button>
          </Container>
        </>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  label: {
    marginBottom: 6,
    color: Color.gray,
    fontSize: 14,
  },
});
