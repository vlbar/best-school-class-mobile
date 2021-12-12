import React, { useState } from 'react';
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

function AddCoursePopup({ show = true, parentCourse, onSuccess, onFailure, onClose }) {
  const [isCourseSaving, setIsCourseSaving] = useState(false);
  const [course, setCourse] = useState(initialCourse);

  const courseValidation = useBestValidation(courseValidationSchema);

  const setName = name => setCourse({ ...course, name: name });

  const submitHandle = () => {
    if (!courseValidation.validate(course)) return;

    let courseToAdd = { ...course };
    courseToAdd.name = courseToAdd.name.trim();
    courseToAdd.parentCourseId = parentCourse?.id || null;

    baseLink
      .post(courseToAdd, setIsCourseSaving)
      .then(() => {
        setCourse(initialCourse);

        onClose?.();
        onSuccess?.(course);
      })
      .catch(() => onFailure?.());
  };

  return (
    <BottomPopup title={translate('course.add.title')} show={show} onClose={onClose}>
      <View style={styles.container}>
        <InputForm
          label={translate('course.add.name')}
          value={course.name}
          errorMessage={courseValidation.errors.name}
          onChange={value => {
            courseValidation.changeHandle('name', value);
            setName(value);
          }}
        />
        <Button title={translate('course.add.submit')} disabled={isCourseSaving} onPress={submitHandle} />
      </View>
    </BottomPopup>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
});

export default AddCoursePopup;
