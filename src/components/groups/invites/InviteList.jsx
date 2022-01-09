import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getI, useTranslation } from '../../../utils/Internationalization';
import HorizontalMenu from '../../common/HorizontalMenu';
import { ASSISTANT, STUDENT, TEACHER, types } from '../../state/State';
import Invite from './Invite';

export default function InviteList({ fetchLink }) {
  const [invites, setInvites] = useState(null);
  const { translate } = useTranslation();

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
          {[STUDENT, TEACHER, ASSISTANT].map(state => {
            return (
              <HorizontalMenu.Item key={state.name} title={translate(state.key)}>
                <Invite
                  invite={invites.find(invite => invite.role.toLowerCase() == state.name.toLowerCase())}
                  createLink={fetchLink}
                  role={state.name}
                />
              </HorizontalMenu.Item>
            );
          })}
        </HorizontalMenu>
      </View>
    );
  else return null;
}
