import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ColorPalette from 'react-native-color-palette';
import Color from '../../constants';
import Button from '../../components/common/Button';
import Container from '../../components/common/Container';
import InputForm from '../../components/common/InputForm';
import Icon from 'react-native-vector-icons/Ionicons';
import Link from '../../utils/Hateoas/Link';
import Header from '../../components/navigation/Header';
import IconButton from '../../components/common/IconButton';
import { GROUPS_DETAILS_SCREEN } from './GroupDetails';
import getContrastColor from '../../utils/ContrastColor';
import Resource from '../../utils/Hateoas/Resource';

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
        navigation.navigate({
          name: GROUPS_DETAILS_SCREEN,
          params: {
            fetchLink: group.link().href,
          },
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
      .then(() =>
        navigation.navigate({
          name: GROUPS_DETAILS_SCREEN,
          params: {
            fetchLink: updatingGroup.link().href,
          },
        }),
      );
  }

  return (
    <>
      <Header
        title={updatingGroup ? 'Изменить' : 'Создать' + ' группу'}
        canBack
        backgroundColor={updatingGroup?.color}
        headerRight={
          <IconButton
            name="checkmark"
            color={getContrastColor(updatingGroup?.color ?? Color.white)}
            onPress={onSubmit}
          />
        }
      />
      <Container style={styles.container}>
        <View>
          <InputForm label="Название" onChange={setName} value={name} />
          <InputForm label="Предмет" onChange={setSubject} value={subject} />
          <ColorPalette
            onChange={setColor}
            value={color}
            defaultColor={color}
            colors={GROUP_COLORS.slice(0, 6)}
            icon={<Icon name="checkmark-outline" size={24} color={getContrastColor(color)}></Icon>}
            scaleToWindow={true}
            title="Цвет"
            titleStyles={styles.label}
          />
          <ColorPalette
            onChange={setColor}
            value={color}
            defaultColor={color}
            colors={GROUP_COLORS.slice(6)}
            icon={<Icon name="checkmark-outline" size={24} color={Color.darkGray}></Icon>}
            scaleToWindow={true}
            title={null}
          />
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
