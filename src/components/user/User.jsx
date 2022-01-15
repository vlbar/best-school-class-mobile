import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Resource from '../../utils/Hateoas/Resource';

import Avatar from './Avatar';
import UserName from './UserName';

const USER_URL = 'v1/users';
const getUserLink = id => Resource.basedOnHref(`${USER_URL}/${id}`).link();

function User({
  user,
  fetchLink,
  userId,
  iconSize = 26,
  short = false,
  showCurrent = false,
  iconPlacement = 'left',
  errorMsg,
  onLoading,
  children,
  nameStyle,
  containerStyle,
  ...props
}) {
  const [finalUser, setFinalUser] = useState(user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fetchLink && !finalUser && !loading)
      fetchLink
        .fetch(setLoading)
        .then(setFinalUser)
        .catch(err => console.log(errorMsg ?? 'Не удалось загрузить пользователя.', err));
  }, [fetchLink]);

  useEffect(() => {
    if (userId && !finalUser && !loading) {
      getUserLink(userId)
        .fetch(setLoading)
        .then(setFinalUser)
        .catch(err => console.log(errorMsg ?? 'Не удалось загрузить пользователя.', err));
    }
  }, [userId]);

  if (finalUser)
    return (
      <View style={[styles.container, iconPlacement === 'right' && styles.right]}>
        <View {...props}>
          <Avatar email={finalUser.email} size={iconSize} />
        </View>
        <View style={[styles.nameContainer, iconPlacement === 'right' && styles.rightName, containerStyle]}>
          <UserName user={finalUser} short={short} withCurrent={showCurrent} style={nameStyle} />
          {children}
        </View>
      </View>
    );
  else return null;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
  },
  right: {
    flexDirection: 'row-reverse',
  },
  nameContainer: {
    alignItems: 'center',
    flexWrap: 'wrap',
    marginHorizontal: 10,
    flexDirection: 'row',
  },
  rightName: {
    justifyContent: 'flex-end',
  },
});

export default User;
