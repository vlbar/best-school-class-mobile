import React, { useMemo, useRef } from 'react';
import { Animated, Vibration, View } from 'react-native';
import { SwipeRow } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/Ionicons';
import Color from '../../constants';

const MAX_SWIPE_LENGTH = 60;
const REPLY_SWIPE_LENGTH = 50;
const REPLY_TRIGGER_LENGTH = 25;

function ReplyView(
  { children, vibrationTime = 50, iconSize = 25, swipeKey, disabled, onReply, onScrollEnabled, ...props },
  ref,
) {
  const rowSwipeAnimatedValue = useRef({ anime: new Animated.Value(0), vaginated: false });

  function onSwipeValueChange(swipeData) {
    let { value } = swipeData;
    value = Math.abs(value);

    rowSwipeAnimatedValue.current.anime.setValue(value);

    const vaginatedValue = disabled ? REPLY_TRIGGER_LENGTH : REPLY_SWIPE_LENGTH;
    const vaginatedVibration = disabled ? [0, vibrationTime, 200, vibrationTime] : vibrationTime;

    if (value >= vaginatedValue && !rowSwipeAnimatedValue.current.vaginated) Vibration.vibrate(vaginatedVibration);
    rowSwipeAnimatedValue.current.vaginated = value >= vaginatedValue;
  }

  const hiddenItem = useMemo(() => {
    return (
      <View style={[{ flexGrow: 1, alignItems: 'center', flexDirection: 'row-reverse' }]}>
        <Animated.View
          style={[
            {
              transform: [
                {
                  scale: rowSwipeAnimatedValue.current.anime.interpolate({
                    inputRange: [REPLY_TRIGGER_LENGTH, REPLY_SWIPE_LENGTH],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }),
                },
                {
                  translateX: rowSwipeAnimatedValue.current.anime.interpolate({
                    inputRange: [REPLY_SWIPE_LENGTH, MAX_SWIPE_LENGTH],
                    outputRange: [0, REPLY_SWIPE_LENGTH - MAX_SWIPE_LENGTH],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <Icon name="arrow-undo-circle" size={iconSize} color={Color.lightPrimary} />
        </Animated.View>
      </View>
    );
  }, []);

  return (
    <SwipeRow
      ref={ref}
      disableRightSwipe
      stopRightSwipe={disabled ? -REPLY_TRIGGER_LENGTH : -MAX_SWIPE_LENGTH}
      rightActivationValue={-REPLY_SWIPE_LENGTH}
      onRowClose={() => {
        if (!disabled && rowSwipeAnimatedValue.current.vaginated) onReply();
      }}
      onSwipeValueChange={onSwipeValueChange}
      swipeKey={swipeKey}
      directionalDistanceChangeThreshold={1}
      onRightAction={() => console.log("AIF")}
      setScrollEnabled={onScrollEnabled}
      {...props}
    >
      {hiddenItem}

      {children}
    </SwipeRow>
  );
}

export default React.memo(React.forwardRef(ReplyView));
