import React from 'react';
import Text from '../common/Text';

function UserName({ user, short = false, withCurrent = false, textWeight, textSize = 17, style }) {
  return (
    <Text weight={textWeight} style={[style, { fontSize: textSize }]}>
      {user.secondName}{" "}
      {short ? (
        <>
          {user.firstName[0]}.{user.middleName ? user.middleName[0] + '.' : ''}
        </>
      ) : (
        <>
          {user.firstName} {user.middleName ?? ''}
        </>
      )}
      {withCurrent && <> (Вы)</>}
    </Text>
  );
}

export default UserName;
