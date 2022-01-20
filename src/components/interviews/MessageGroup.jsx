import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, TouchableNativeFeedback, Vibration, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/Ionicons';
import Color from '../../constants';
import { useTranslation } from '../../utils/Internationalization';
import BottomPopup from '../common/BottomPopup';
import Text from '../common/Text';
import Avatar from '../user/Avatar';
import ReplyMessage from './ReplyMessage';
import UserManager from './UserManager';

const MAX_SWIPE_LENGTH = 60;
const REPLY_SWIPE_LENGTH = 50;
const REPLY_TRIGGER_LENGTH = 25;

export default function MessageGroup({ messageGroup, isCreator, onReply, onPing }) {
  const rowSwipeAnimatedValues = useMemo(() => {
    const values = {};
    messageGroup.messages.forEach(
      message => (values[`${message.id}`] = { anime: new Animated.Value(0), vaginated: false }),
    );
    return values;
  }, [messageGroup]);
  const [actionsPopup, setActionsPopup] = useState({ show: false, item: null });
  const { translate } = useTranslation();

  function onDelete(message) {
    message
      .link()
      .remove()
      .then(() => setActionsPopup({ show: false }));
  }

  function handleReply(replyId) {
    setActionsPopup({ show: false });
    onReply?.(messageGroup.messages.find(message => message.id == replyId));
  }

  function getStatusIcon(status) {
    if (status == 'NOT_PERFORMED') return 'ellipsis-horizontal-outline';
    if (status == 'PERFORMED') return 'checkmark-outline';
    if (status == 'APPRECIATED') return 'ribbon-outline';
    if (status == 'RETURNED') return 'refresh-outline';
    if (status == 'NOT_APPRECIATED') return 'close-outline';
  }

  function renderItem(data) {
    const message = data.item;
    return (
      <Pressable disabled={!!message.deletedAt} onLongPress={() => setActionsPopup({ show: true, item: message })}>
        <View
          style={[
            { flexGrow: 1, flexDirection: 'row', paddingVertical: 4 },
            isCreator && { flexDirection: 'row-reverse' },
          ]}
        >
          <View
            style={[styles.message, isCreator && { borderTopRightRadius: 3 }, !isCreator && { borderTopLeftRadius: 3 }]}
          >
            {message.replyOn && (
              <View style={{ paddingVertical: 8 }}>
                <ReplyMessage reply={message.replyOn} />
              </View>
            )}
            {message.type == 'MESSAGE' && (
              <Text key={message.id} style={[styles.messageText, message.deletedAt && styles.deleted]}>
                {message.deletedAt ? translate('homeworks.interview.messageDeleted') : message.content}
              </Text>
            )}
            {message.type == 'ANSWER' && (
              <View>
                <View style={styles.taskAnswer}>
                  <Text style={{ fontStyle: 'italic' }}>{translate('homeworks.interview.taskMessage')}</Text>
                  <View style={styles.taskAnswerStatus}>
                    <Icon style={{ marginRight: 10 }} name={getStatusIcon(message.answerStatus)} size={20} />
                    {message.status != 'NOT_PERFORMED' && (
                      <UserManager userId={message.evaluatorId} fallbackLink={message.link('evaluator')}>
                        {({ user }) => (
                          <Pressable onPress={() => onPing(user)}>
                            <Avatar email={user?.email} size={25} />
                          </Pressable>
                        )}
                      </UserManager>
                    )}
                  </View>
                </View>

                <Text>
                  {message.status == 'NOT_PERFORMED'
                    ? `${message.answeredQuestionCount}/${message.questionCount}`
                    : `${message.score}`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  }

  function renderHiddenItem(data) {
    return (
      <View style={[{ flexGrow: 1, alignItems: 'center', flexDirection: 'row-reverse' }]}>
        <Animated.View
          style={[
            {
              transform: [
                {
                  scale: rowSwipeAnimatedValues[`${data.item.id}`].anime.interpolate({
                    inputRange: [REPLY_TRIGGER_LENGTH, REPLY_SWIPE_LENGTH],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }),
                  translateX: rowSwipeAnimatedValues[`${data.item.id}`].anime.interpolate({
                    inputRange: [REPLY_SWIPE_LENGTH, MAX_SWIPE_LENGTH],
                    outputRange: [0, REPLY_SWIPE_LENGTH - MAX_SWIPE_LENGTH],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <Icon name="arrow-undo-circle" size={25} color={Color.lightPrimary} />
        </Animated.View>
      </View>
    );
  }

  function renderSwipeRow(data) {
    const message = data.item;

    return (
      <SwipeRow
        disableLeftSwipe={!!message.deletedAt}
        disableRightSwipe
        stopRightSwipe={-MAX_SWIPE_LENGTH}
        rightActivationValue={-REPLY_SWIPE_LENGTH}
        onRightAction={() => handleReply(message.id)}
        onSwipeValueChange={onSwipeValueChange}
        swipeKey={message.id}
      >
        {renderHiddenItem(data)}

        {renderItem(data)}
      </SwipeRow>
    );
  }

  function onSwipeValueChange(swipeData) {
    let { key, value } = swipeData;
    value = Math.abs(value);

    rowSwipeAnimatedValues[key].anime.setValue(value);

    if (value >= REPLY_SWIPE_LENGTH && !rowSwipeAnimatedValues[key].vaginated) Vibration.vibrate(100);
    rowSwipeAnimatedValues[key].vaginated = value >= REPLY_SWIPE_LENGTH;
  }

  return (
    <>
      <View style={[styles.messageGroupContainer, isCreator && { flexDirection: 'row-reverse' }]}>
        {!isCreator && (
          <UserManager user={messageGroup.author}>
            {({ user }) => <Avatar email={user.email} size={32} style={styles.messageAuthor} />}
          </UserManager>
        )}
        <View style={[styles.messageGroup]}>
          <Text style={[styles.messageGroupTime, isCreator && { textAlign: 'right' }]}>
            {moment(new Date(messageGroup.time)).utcOffset(3).format('HH:mm')}
          </Text>
          <View style={styles.messageGroupContent}>
            <SwipeListView
              inverted
              scrollEnabled={false}
              pagingEnabled={false}
              nestedScrollEnabled={false}
              listKey={messageGroup.time}
              data={messageGroup.messages}
              renderItem={renderSwipeRow}
              keyExtractor={item => item.id}
            />
          </View>
        </View>
      </View>
      {actionsPopup.show && (
        <BottomPopup
          title={translate('homeworks.interview.actions.title')}
          onClose={() => setActionsPopup({ show: false })}
        >
          <TouchableNativeFeedback onPress={() => handleReply(actionsPopup.item.id)}>
            <View style={{ borderTopWidth: StyleSheet.hairlineWidth }}>
              <Text style={{ textAlign: 'center', padding: 15 }}>{translate('homeworks.interview.actions.reply')}</Text>
            </View>
          </TouchableNativeFeedback>
          {isCreator && (
            <>
              <TouchableNativeFeedback>
                <View style={{ borderTopWidth: StyleSheet.hairlineWidth }}>
                  <Text style={{ textAlign: 'center', padding: 15 }}>
                    {translate('homeworks.interview.actions.edit')}
                  </Text>
                </View>
              </TouchableNativeFeedback>
              <TouchableNativeFeedback onPress={() => onDelete(actionsPopup.item)}>
                <View style={{ borderTopWidth: StyleSheet.hairlineWidth }}>
                  <Text style={{ color: Color.danger, textAlign: 'center', padding: 15 }}>
                    {translate('homeworks.interview.actions.delete')}
                  </Text>
                </View>
              </TouchableNativeFeedback>
            </>
          )}
        </BottomPopup>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  messageAuthor: {
    marginTop: 17,
  },
  messageGroupContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  messageGroupContent: {
    flexDirection: 'column-reverse',
    borderRadius: 10,
    flexGrow: 1,
  },
  messageGroup: {
    flexGrow: 1,
    marginLeft: 10,
  },
  message: {
    borderRadius: 10,
    backgroundColor: Color.ultraLightPrimary,
    paddingLeft: 12,
    paddingRight: 5,
    paddingVertical: 4,
    maxWidth: Dimensions.get('window').width * 0.7,
  },
  messageText: {
    fontSize: 17,
  },
  taskAnswer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  taskAnswerStatus: {
    marginLeft: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  deleted: {
    fontStyle: 'italic',
    fontSize: 15,
    paddingVertical: 3,
    color: Color.gray,
  },
  messageGroupTime: {
    fontSize: 10,
    color: Color.gray,
  },
});
