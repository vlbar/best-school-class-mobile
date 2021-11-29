import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import HorizontalMenu from '../../common/HorizontalMenu';
import Invite from './Invite';

export default function InviteList({ fetchLink }) {
  const [invites, setInvites] = useState(null);

  useEffect(() => {
    if (fetchLink)
      fetchLink.fetch().then(page => {
        setInvites(page.list('invites') ?? []);
      });
  }, [fetchLink]);

  if (invites)
    return (
      <View style={{ flexGrow: 1 }}>
        <HorizontalMenu>
          <HorizontalMenu.Item title="Ученик">
            <Invite invite={invites.find(invite => invite.role == 'STUDENT')} createLink={fetchLink} role="student" />
          </HorizontalMenu.Item>
          <HorizontalMenu.Item title="Препод.">
            <Invite invite={invites.find(invite => invite.role == 'TEACHER')} createLink={fetchLink} role="teacher" />
          </HorizontalMenu.Item>
          <HorizontalMenu.Item title="Помощник">
            <Invite
              invite={invites.find(invite => invite.role == 'ASSISTANT')}
              createLink={fetchLink}
              role="assistant"
            />
          </HorizontalMenu.Item>
        </HorizontalMenu>
      </View>
    );
  else return null;
}
