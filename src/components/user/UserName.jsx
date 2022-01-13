import React from 'react';
import { getI } from '../../utils/Internationalization';
import Text from '../common/Text';

export function getName(user, short) {
  return (
    user.secondName +
    ' ' +
    (short
      ? `${user.firstName[0]}.${user.middleName ? user.middleName[0] + '.' : ''}`
      : user.firstName + ' ' + user.middleName ?? '')
  );
}

function UserName({ user, short = false, withCurrent = false, textWeight, textSize = 17, style }) {
  return (
    <Text weight={textWeight} style={[{ fontSize: textSize }, style]}>
      {getName(user, short)}
      {withCurrent && <> ({getI('user.self')})</>}
    </Text>
  );
}

export default UserName;
