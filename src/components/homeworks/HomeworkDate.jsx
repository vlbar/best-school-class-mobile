import React from 'react';
import moment from 'moment';
import { getCurrentLanguage, useTranslation } from '../../utils/Internationalization';
import Text from '../common/Text';

export default function HomeworkDate({ date, until = false, style }) {
  const currentLanguage = getCurrentLanguage();
  const { translate } = useTranslation();

  return (
    <Text numberOfLines={1} style={style}>
      {translate(`homeworks.${until ? 'until' : 'from'}`, {
        date: moment(new Date(date), undefined, currentLanguage.languageName).format(
          `D MMMM${new Date(date).getFullYear() != new Date().getFullYear() ? ' YYYY' : ''}, HH:mm`,
        ),
      })}
    </Text>
  );
}