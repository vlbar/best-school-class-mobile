import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Color from '../../constants';
import Button from '../../components/common/Button';
import Container from '../../components/common/Container';
import InputForm from '../../components/common/InputForm';
import Link from '../../utils/Hateoas/Link';
import Header from '../../components/navigation/Header';
import IconButton from '../../components/common/IconButton';
import { GROUPS_DETAILS_SCREEN } from './GroupDetails';
import getContrastColor from '../../utils/ContrastColor';
import Resource from '../../utils/Hateoas/Resource';
import ColorPicker from '../../components/groups/ColorPicker';
import Text from '../../components/common/Text';

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
  const updatingGroup = JSON.parse(route.params.updatingGroup ?? null);

  const [name, setName] = useState(updatingGroup?.name ?? '');
  const [subject, setSubject] = useState(updatingGroup?.subject ?? '');
  const [color, setColor] = useState(updatingGroup?.color ?? GROUP_COLORS[0]);
  const [loading, setLoading] = useState(false);

  function onSubmit() {
    if (updatingGroup) updateGroup();
    else createGroup();
  }

  function createGroup() {
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
        navigation.replace(GROUPS_DETAILS_SCREEN, {
          fetchLink: group.link().href,
        });
      });
  }

  function updateGroup() {
    Resource.wrap(updatingGroup)
      .link()
      .put(
        {
          name,
          subject,
          color,
        },
        setLoading,
      )
      .then(() => navigation.goBack());
  }

  return (
    <>
      <Header
        title={updatingGroup ? 'Изменить' : 'Создать' + ' группу'}
        canBack
        backgroundColor={color}
        headerRight={<IconButton name="checkmark" color={getContrastColor(color)} onPress={onSubmit} />}
      />
      <Container style={styles.container}>
        <View>
          <InputForm label="Название" onChange={setName} value={name} />
          <InputForm label="Предмет" onChange={setSubject} value={subject} />
          <Text style={styles.label}>Цвет</Text>
          <ColorPicker value={color} colors={GROUP_COLORS.slice(0, 6)} onChange={setColor} />
          <ColorPicker value={color} colors={GROUP_COLORS.slice(6)} onChange={setColor} />
        </View>
        <Button title={updatingGroup ? 'Изменить' : 'Добавить'} disabled={loading} onPress={onSubmit}></Button>
      </Container>
    </>
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
