import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GROUPS_DETAILS_SCREEN } from './GroupDetails';
import Color from '../../constants';
import Container from '../../components/common/Container';
import Text from '../../components/common/Text';
import Button from '../../components/common/Button';
import Link from '../../utils/Hateoas/Link';
import Header from '../../components/navigation/Header';
import IconButton from '../../components/common/IconButton';
import { fromStateToName, types } from '../../utils/StateConvertions';
import MemberPreview from '../../components/groups/join/MemberPreview';

const INVITES_URL = 'v1/invites';

export const JOIN_GROUP_SCREEN = 'joinGroup';
export default function JoinGroup({ route, navigation }) {
  const inviteLink = new Link(`${INVITES_URL}/${route.params.inviteCode}`);

  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState(null);
  const [group, setGroup] = useState(null);
  const [creator, setCreator] = useState(null);
  const [memberPage, setMemberPage] = useState(null);

  useEffect(() => {
    inviteLink.fetch(setLoading).then(setInvite);
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
    console.log(memberPage);
    invite
      .link('accept')
      .post({}, setLoading)
      .then(member => {
        navigation.replace(GROUPS_DETAILS_SCREEN, {
          fetchLink: member.link('group').href,
        });
      });
  }

  return (
    <>
      <Header title="Присоединиться к группе" canBack headerRight={<IconButton name="checkmark" onPress={onJoin} />} />
      <Container>
        {invite && group && creator && memberPage && (
          <View style={styles.container}>
            <View>
              <Text style={styles.text}>
                {creator.secondName} {creator.firstName} {creator.middleName ?? ''}
              </Text>
              <Text style={styles.text}>приглашает Вас в группу</Text>
              <Text style={[styles.groupName, styles.text, { backgroundColor: group.color }]}>{group.name}</Text>
              <View style={styles.memberPreview}>
                <MemberPreview members={memberPage.list('members')} total={memberPage.page.totalElements} />
              </View>
              <Text style={styles.text}>Приглашение на роль:</Text>
              <Text style={styles.role}>{fromStateToName(types[invite.role])}</Text>
            </View>
            <Button title="Принять" style={{ marginBottom: 20 }} disabled={loading} onPress={onJoin}></Button>
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
  text: {
    textAlign: 'center',
  },
  memberPreview: {
    marginBottom: 30,
  },
  role: {
    color: Color.primary,
    textAlign: 'center',
    marginTop: 5,
  },
  groupName: {
    fontWeight: 'bold',
    fontSize: 24,
    padding: 10,
    borderRadius: 10,
    marginVertical: 25,
  },
});
