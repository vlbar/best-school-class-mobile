import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GROUPS_DETAILS_SCREEN } from './GroupDetails';
import Color from '../../constants';
import Container from '../../components/common/Container';
import Text from '../../components/common/Text';
import Button from '../../components/common/Button';
import Link from '../../utils/Hateoas/Link';
import Header from '../../components/navigation/Header';
import IconButton from '../../components/common/IconButton';
import MemberPreview from '../../components/groups/join/MemberPreview';
import UserName from '../../components/user/UserName';
import getContrastColor from '../../utils/ContrastColor';
import { types } from '../../components/state/State';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useTranslation } from '../../utils/Internationalization';
import { GroupsContext } from '../../navigation/main/GroupsNavigationConstants';
import Resource from '../../utils/Hateoas/Resource';
import { ProfileContext } from '../../navigation/NavigationConstants';

const INVITES_URL = 'v1/invites';

export const JOIN_GROUP_SCREEN = 'joinGroup';
export default function JoinGroup({ route, navigation }) {
  const inviteLink = new Link(`${INVITES_URL}/${route.params.inviteCode}`);
  const { translate } = useTranslation();
  const { onCreate } = useContext(GroupsContext);
  const { setState } = useContext(ProfileContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invite, setInvite] = useState(null);
  const [group, setGroup] = useState(null);
  const [creator, setCreator] = useState(null);
  const [memberPage, setMemberPage] = useState(null);

  useEffect(() => {
    inviteLink
      .fetch(setLoading)
      .then(setInvite)
      .catch(err => {
        if (err.response?.status === 404) setError(translate('groups.groupJoin.notFound'));
        else setError(err.response?.data?.message ?? translate('groups.groupJoin.somethingWentWrong'));
      });
  }, []);

  useEffect(() => {
    if (invite) invite.link('group').fetch(setLoading).then(setGroup);
  }, [invite]);

  useEffect(() => {
    if (group) group.link('creator').fetch(setLoading).then(setCreator);
  }, [group]);

  useEffect(() => {
    if (group) group.link('groupMembers').fill('size', 5).fetch(setLoading).then(setMemberPage);
  }, [group]);

  function onJoin() {
    invite
      .link('accept')
      .post({}, setLoading)
      .then(member => {
        onCreate({ ...group, membership: member, ...Resource.based(member.link('group')), full: false });
        setState(types[member.role.toUpperCase()]);
        navigation.replace(GROUPS_DETAILS_SCREEN, {
          groupId: group.id,
        });
      })
      .catch(err => {
        setError(err.response?.data?.message ?? translate('groups.groupJoin.somethingWentWrong'));
      });
  }

  return (
    <>
      <Header
        title={translate('groups.groupJoin.title')}
        canBack
        headerRight={<IconButton name="checkmark" onPress={onJoin} />}
      />
      <Container style={{ flexGrow: 1 }}>
        {error && <Text style={styles.error}>{error}</Text>}
        {invite && group && creator && memberPage && !error && (
          <View style={styles.container}>
            <View>
              <Text style={styles.text}>
                <UserName user={creator} textWeight="bold" />
              </Text>
              <Text style={styles.text}>{translate('groups.groupJoin.invite')}</Text>
              <Text
                style={[
                  styles.groupName,
                  styles.text,
                  { backgroundColor: group.color, color: getContrastColor(group.color) },
                ]}
              >
                {group.name}
              </Text>
              <View style={styles.memberPreview}>
                <MemberPreview members={memberPage.list('members')} total={memberPage.page.totalElements} />
              </View>
              <Text style={styles.text}>{translate('groups.groupJoin.role')}</Text>
              <View style={styles.roleContainer}>
                <FontAwesome5 name={types[invite.role].icon} style={styles.role} size={20} />
                <Text style={styles.role}>{translate(types[invite.role].key)}</Text>
              </View>
            </View>
            <Button
              title={translate('groups.groupJoin.accept')}
              style={{ marginBottom: 20 }}
              disabled={loading}
              onPress={onJoin}
            ></Button>
          </View>
        )}
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  text: {
    textAlign: 'center',
  },
  memberPreview: {
    marginBottom: 30,
  },
  role: {
    color: Color.primary,
    textAlign: 'center',
    marginHorizontal: 5,
  },
  groupName: {
    fontWeight: 'bold',
    fontSize: 24,
    padding: 10,
    borderRadius: 10,
    marginVertical: 25,
  },
  error: {
    textAlign: 'center',
    paddingHorizontal: 10,
    color: Color.gray,
    flexGrow: 1,
    textAlignVertical: 'center',
  },
});
