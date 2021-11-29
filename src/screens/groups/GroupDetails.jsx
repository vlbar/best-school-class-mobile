import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import BottomPopup from '../../components/common/BottomPopup';
import Container from '../../components/common/Container';
import HorizontalMenu from '../../components/common/HorizontalMenu';
import IconButton from '../../components/common/IconButton';
import ModalTrigger from '../../components/common/ModalTrigger';
import Text from '../../components/common/Text';
import InviteList from '../../components/groups/invites/InviteList';
import MemberList from '../../components/groups/members/MemberList';
import MemberSettings from '../../components/groups/members/MemberSettings';
import Header from '../../components/navigation/Header';
import Color from '../../constants';
import Link from '../../utils/Hateoas/Link';
import { CREATE_GROUP_SCREEN } from './CreateGroup';

export const GROUPS_DETAILS_SCREEN = 'groupDetails';
export default function GroupDetails({ route, navigation }) {
  const fetchLink = new Link(route.params.fetchLink);
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState(null);

  useEffect(() => {
    fetchLink.fetch(setLoading).then(setGroup);
  }, [route]);

  function onEdit() {
    navigation.navigate({
      name: CREATE_GROUP_SCREEN,
      params: {
        updatingGroup: JSON.stringify(group),
      },
    });
  }

  return (
    <>
      <Header
        title={group?.name ?? ''}
        backgroundColor={group?.color}
        canBack
        headerRight={
          <IconButton
            name="settings-outline"
            color={Color.darkGray}
            onPress={onEdit}
            style={{ backgroundColor: Color.white, borderRadius: 50, padding: 4 }}
          />
        }
      />

      <Container>
        {group && (
          <>
            <Text style={styles.news}>Ничего нового :(</Text>
            <View style={[styles.row, styles.tasks]}>
              <Text>Задания</Text>
              <IconButton name="chevron-forward-outline" color={Color.darkGray} size={32} style={styles.taskButton} />
            </View>
            <View style={styles.members}>
              <View style={styles.row}>
                <Text>Участники</Text>
                <View style={styles.row}>
                  {!group.closed && (
                    <ModalTrigger
                      modal={
                        <BottomPopup title="Настройка доступа">
                          <View style={{ padding: 20, flexGrow: 1 }}>
                            <InviteList fetchLink={group.link('groupInvites')} />
                          </View>
                        </BottomPopup>
                      }
                    >
                      <IconButton name="link-outline" color={Color.darkGray} />
                    </ModalTrigger>
                  )}
                  <ModalTrigger modal={<MemberSettings group={group} onGroupEdit={setGroup} />}>
                    <IconButton name="settings-outline" color={Color.darkGray} />
                  </ModalTrigger>
                </View>
              </View>
              <View>
                <HorizontalMenu>
                  <HorizontalMenu.Item title="Ученики">
                    <View style={styles.memberList}>
                      <MemberList
                        fetchLink={group.link('groupMembers').fill('roles', 'student')}
                        searchPlaceholder="Введите имя ученика..."
                      />
                    </View>
                  </HorizontalMenu.Item>
                  <HorizontalMenu.Item title="Преподаватели">
                    <View style={styles.memberList}>
                      <MemberList
                        fetchLink={group.link('groupMembers').fill('roles', 'teacher,assistant')}
                        searchPlaceholder="Введите имя преподавателя..."
                      />
                    </View>
                  </HorizontalMenu.Item>
                </HorizontalMenu>
              </View>
            </View>
          </>
        )}
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  news: {
    marginVertical: 20,
  },
  tasks: {
    backgroundColor: Color.ultraLightPrimary,
    borderRadius: 20,
    paddingLeft: 15,
    paddingVertical: 2,
  },
  taskButton: {
    padding: 0,
    paddingHorizontal: 3,
  },
  members: {
    marginTop: 30,
    height: '100%',
    flex: 1,
  },
  memberList: {
    marginTop: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    borderRadius: 50,
    width: 40,
    height: 40,
  },
});
