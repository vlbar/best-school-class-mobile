import React, { useEffect, useState } from 'react';
import { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { wrapScrollView } from 'react-native-scroll-into-view';
import { TouchableOpacity } from 'react-native-gesture-handler';
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
import { ProfileContext } from '../../navigation/NavigationConstants';
import { CREATE_GROUP_SCREEN } from './CreateGroup';
import { GROUPS_SCREEN } from './Groups';
import { GroupsContext } from '../../navigation/main/GroupsNavigationConstants';
import { useTranslation } from '../../utils/Internationalization';

const ScrollableView = wrapScrollView(ScrollView);

export const GROUPS_DETAILS_SCREEN = 'groupDetails';
export default function GroupDetails({ route, navigation }) {
  const { translate } = useTranslation();

  const { groups, onDelete, onUpdate } = useContext(GroupsContext);
  const { user, state } = useContext(ProfileContext);
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState(null);

  const [showFirstTab, setShowFirstTab] = useState(true);

  useEffect(() => {
    const groupId = route.params.groupId;
    const prefetchedGroup = groups.find(g => g.id == groupId);
    setGroup(prefetchedGroup);
    if (prefetchedGroup?.full == null || !prefetchedGroup?.full)
      prefetchedGroup
        ?.link()
        .fetch(setLoading)
        .then(group => {
          onUpdate({ ...prefetchedGroup, ...group, full: true });
        });
  }, [route, groups]);

  useEffect(() => {
    if (loading || group) {
      navigation.navigate(GROUPS_SCREEN);
    }
  }, [state]);

  function onEdit() {
    navigation.navigate({
      name: CREATE_GROUP_SCREEN,
      params: {
        updatingGroup: group.id,
      },
    });
  }

  function onLeave() {
    onDelete(group);
    navigation.navigate(GROUPS_SCREEN);
  }

  let isCreator = group?.creatorId == user?.id;
  return (
    <>
      <Header
        title={group?.name ?? ''}
        backgroundColor={group?.color}
        canBack
        headerRight={
          isCreator && (
            <IconButton
              name="settings-outline"
              color={Color.darkGray}
              onPress={onEdit}
              style={{ backgroundColor: Color.white, borderRadius: 50, padding: 4 }}
            />
          )
        }
      />

      <ScrollableView scrollIntoViewOptions={{ align: 'top' }}>
        {group?.full && (
          <Container>
            <View>
              <Text style={styles.news}>{translate('groups.groupDetails.emptyNews')}</Text>

              <View>
                <View style={styles.row}>
                  <Text>{translate('groups.groupDetails.nearestLesson')}</Text>
                  <Text style={styles.smallText}>{translate('groups.groupDetails.schedule')}</Text>
                </View>
                <View style={styles.lesson}>
                  <Text style={[styles.lessonCell, styles.lessonTime]}>9:30 - 10:15</Text>
                  <View style={[styles.lessonCell, styles.lessonName]}>
                    <Text numberOfLines={1}>Алгебра</Text>
                    <Text numberOfLines={1} style={styles.lessonTheme}>
                      Интегрирование иррациональных выражений
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity>
                <View style={[styles.row, styles.tasks]}>
                  <Text>{translate('groups.groupDetails.tasks')}</Text>
                  <IconButton
                    name="chevron-forward-outline"
                    color={Color.darkGray}
                    size={32}
                    style={styles.taskButton}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.members}>
              <View style={[styles.row, styles.memberHeader]}>
                <Text>{translate('groups.groupDetails.members')}</Text>
                {isCreator && (
                  <View style={styles.row}>
                    {!group.closed && (
                      <ModalTrigger>
                        {({ show, open, close }) => {
                          return (
                            <>
                              {show && (
                                <BottomPopup onClose={close} title={translate('groups.groupDetails.accessSettings')}>
                                  <View style={{ padding: 20, flexGrow: 1 }}>
                                    <InviteList fetchLink={group.link('groupInvites')} />
                                  </View>
                                </BottomPopup>
                              )}
                              <IconButton name="link-outline" onPress={open} color={Color.darkGray} />
                            </>
                          );
                        }}
                      </ModalTrigger>
                    )}

                    <ModalTrigger>
                      {({ show, open, close }) => {
                        return (
                          <>
                            {show && (
                              <BottomPopup onClose={close} title={translate('groups.groupDetails.memberSettings')}>
                                <MemberSettings
                                  group={group}
                                  onGroupEdit={group => {
                                    onUpdate(group);
                                    close();
                                  }}
                                />
                              </BottomPopup>
                            )}
                            <IconButton onPress={open} name="settings-outline" color={Color.darkGray} />
                          </>
                        );
                      }}
                    </ModalTrigger>
                  </View>
                )}
              </View>
              <View>
                <HorizontalMenu>
                  <HorizontalMenu.Item
                    title={translate('groups.groupDetails.students')}
                    onPress={() => setShowFirstTab(true)}
                  >
                    <View>
                      <MemberList
                        active={showFirstTab}
                        currentUser={user}
                        onLeave={onLeave}
                        isCreator={isCreator}
                        fetchLink={group.link('groupMembers').fill('roles', 'student')}
                        searchPlaceholder={translate('groups.groupDetails.studentsSearchPlaceholder')}
                      />
                    </View>
                  </HorizontalMenu.Item>
                  <HorizontalMenu.Item
                    title={translate('groups.groupDetails.teachers')}
                    onPress={() => setShowFirstTab(false)}
                  >
                    <View>
                      <MemberList
                        active={!showFirstTab}
                        currentUser={user}
                        onLeave={onLeave}
                        isCreator={isCreator}
                        withRoles
                        fetchLink={group.link('groupMembers').fill('roles', 'teacher,assistant')}
                        searchPlaceholder={translate('groups.groupDetails.teachersSearchPlaceholder')}
                      />
                    </View>
                  </HorizontalMenu.Item>
                </HorizontalMenu>
              </View>
            </View>
          </Container>
        )}
      </ScrollableView>
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
    paddingLeft: 18,
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
  memberHeader: {
    marginBottom: 15,
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
  smallText: {
    fontSize: 15,
    color: Color.gray,
  },
  lesson: {
    borderRadius: 15,
    backgroundColor: Color.ultraLightPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  lessonCell: {
    margin: 10,
  },
  lessonTime: {
    textAlign: 'center',
    marginLeft: 15,
  },
  lessonName: {
    borderLeftWidth: 1,
    borderColor: Color.lightGray,
    paddingLeft: 10,
    flexDirection: 'column',
    overflow: 'hidden',
    flex: 1,
  },
  lessonTheme: {
    color: Color.lightGray,
    fontSize: 14,
  },
});
