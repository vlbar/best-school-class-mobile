import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

const STATUSES = {
  NOT_PERFORMED: 'ellipsis-horizontal-outline',
  PERFORMED: 'checkmark-outline',
  APPRECIATED: 'shield-checkmark-outline',
  RETURNED: 'refresh-outline',
  NOT_APPRECIATED: 'close-outline',
};

export function StatusBadge({ status, size }) {
  const animate = useRef(new Animated.Value(0.5)).current;
  const [currentStatus, setCurrentStatus] = useState(status);

  useEffect(() => {
    if (currentStatus != status) {
      scaleAnim(0).start(({ finished }) => {
        setCurrentStatus(status);
        scaleAnim(1).start();
      });
    } else {
      setCurrentStatus(status);
      scaleAnim(1).start();
    }
  }, [status]);

  function scaleAnim(toFactor) {
    return Animated.timing(animate, {
      toValue: toFactor,
      duration: 250,
      useNativeDriver: true,
    });
  }

  let transform = {
    transform: [
      {
        scale: animate,
      },
    ],
  };

  return (
    <Animated.View style={[transform, { alignSelf: 'flex-start' }]}>
      <Icon name={STATUSES[currentStatus]} size={size} />
    </Animated.View>
  );
}
