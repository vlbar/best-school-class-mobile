import moment from 'moment';
import React, { useMemo } from 'react';
import { useTranslation } from '../../utils/Internationalization';
import Text from '../common/Text';

export default function MessageSectionDate({ date, withTime = false, ...props }) {
  const { translate } = useTranslation();

  //Thanks to moment js calendar cringe
  const sectionDate = useMemo(() => {
    const currentDate = moment().startOf('day');
    const passedDate = moment(date).startOf('day');

    const diffDays = currentDate.diff(passedDate, 'days');
    if (diffDays === 0) return translate('date.today');
    else if (diffDays === 1) return translate('date.yesterday');
    else {
      if (currentDate.year === passedDate.year) return passedDate.format('D MMMM');
      else return passedDate.format('D MMMM YYYY');
    }
  }, [date, translate]);

  return <Text {...props}>{sectionDate}</Text>;
}
