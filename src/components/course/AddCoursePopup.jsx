import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomPopup from '../common/BottomPopup';
import InputForm from './../common/InputForm';
import Button from './../common/Button';
import useBestValidation from './../../utils/useBestValidation';
import Resource from './../../utils/Hateoas/Resource';
import translate from '../../utils/Internationalization';

const baseUrl = '/v1/courses';
const baseLink = Resource.basedOnHref(baseUrl).link();

const initialCourse = {
  name: '',
  position: 1,
  parentCourseId: null,
};

const courseValidationSchema = {
  name: {
    type: 'string',
    required: ['Не введено название задания'],
    min: [3, 'Слишком короткое название'],
    max: [100, 'Слишком длинное название'],
  },
};

function AddCoursePopup({ show = true, parentCourse, courseToEdit, onSuccess, onFailure, onClose }) {
  const [isCourseSaving, setIsCourseSaving] = useState(false);
  const [course, setCourse] = useState(initialCourse);

  const courseValidation = useBestValidation(courseValidationSchema);

  const setName = name => setCourse({ ...course, name: name });

  useEffect(() => {
    if (show && courseToEdit) {
      setCourse(courseToEdit);
    }
  }, [show]);

  const submitHandle = () => {
    if (!courseValidation.validate(course)) return;

    let courseToAdd = { ...course };
    courseToAdd.name = courseToAdd.name.trim();
    courseToAdd.parentCourseId = parentCourse?.id || null;

    const request = courseToEdit
      ? courseToEdit.link().put(courseToAdd, setIsCourseSaving)
      : baseLink.post(courseToAdd, setIsCourseSaving);

    request
      .then(() => {
        setCourse(initialCourse);

        onClose?.();
        onSuccess?.(course);
      })
      .catch(() => onFailure?.());
  };

  return (
    <BottomPopup
      title={courseToEdit ? translate('course.modify.edit-title') : translate('course.modify.add-title')}
      show={show}
      onClose={onClose}
    >
      <View style={styles.container}>
        <InputForm
          label={translate('course.modify.name')}
          value={course.name}
          errorMessage={courseValidation.errors.name}
          onChange={value => {
            courseValidation.changeHandle('name', value);
            setName(value);
          }}
          autoFocus={true}
        />
        <Button
          title={courseToEdit ? translate('course.modify.edit-submit') : translate('course.modify.add-submit')}
          disabled={isCourseSaving}
          onPress={submitHandle}
        />
      </View>
    </BottomPopup>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
});

export default AddCoursePopup;
