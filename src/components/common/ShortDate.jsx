import React from 'react';
import moment from 'moment';
import Text from '../common/Text';

export default function ShortDate({ date, style, ...props }) {
  return (
    <Text numberOfLines={1} style={style} {...props}>
      {moment(new Date(date)).format(`D MMMM${new Date(date).getFullYear() != new Date().getFullYear() ? ' YYYY' : ''}, HH:mm` )}
    </Text>
  );
}
