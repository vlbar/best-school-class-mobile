import moment from 'moment';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, TouchableNativeFeedback, Vibration, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SwipeRow } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/Ionicons';
import Color from '../../constants';
import { useTranslation } from '../../utils/Internationalization';
import BottomPopup from '../common/BottomPopup';
import ConfirmationAlert from '../common/ConfirmationAlert';
import Text from '../common/Text';
import Avatar from '../user/Avatar';
import MessageSectionDate from './MessageSectionDate';
import ReplyMessage from './ReplyMessage';
import UserManager from './UserManager';

const MAX_SWIPE_LENGTH = 60;
const REPLY_SWIPE_LENGTH = 50;
const REPLY_TRIGGER_LENGTH = 25;

export function getStatusIcon(status) {
  if (status == 'NOT_PERFORMED') return 'ellipsis-horizontal-outline';
  if (status == 'PERFORMED') return 'checkmark-outline';
  if (status == 'APPRECIATED') return 'shield-checkmark-outline';
  if (status == 'RETURNED') return 'refresh-outline';
  if (status == 'NOT_APPRECIATED') return 'close-outline';
}

export default React.forwardRef(
  ({ message, tasks, disabled, withAvatar, withTime, withDate, isCreator, onEdit, onReply, onPing }, ref) => {
    const { translate } = useTranslation();
    const [popupShow, setPopupShow] = useState(false);
    const maxScore = useMemo(() => {
      if (message.type == 'ANSWER') return tasks?.find(t => t.id == message.taskId)?.maxScore;
    }, [message, tasks]);

    const rowSwipeAnimatedValue = useRef({ anime: new Animated.Value(0), vaginated: false });

    function onDelete(message) {
      message
        .link()
        .remove()
        .then(() => setPopupShow(false));
    }

    function handleReply() {
      setPopupShow(false);
      onReply?.(message);
    }

    function handleEdit() {
      setPopupShow(false);
      onEdit?.(message);
    }

    function onSwipeValueChange(swipeData) {
      let { value } = swipeData;
      value = Math.abs(value);

      rowSwipeAnimatedValue.current.anime.setValue(value);

      if (value >= REPLY_SWIPE_LENGTH && !rowSwipeAnimatedValue.current.vaginated) Vibration.vibrate(100);
      rowSwipeAnimatedValue.current.vaginated = value >= REPLY_SWIPE_LENGTH;
    }

    function renderItem(message) {
      return (
        <>
          <Pressable
            disabled={!!message.deletedAt || message.type == 'ANSWER' || disabled}
            onLongPress={() => setPopupShow(true)}
          >
            <View
              style={[
                { flexGrow: 1, flexDirection: 'row', paddingVertical: 4 },
                isCreator && { flexDirection: 'row-reverse' },
              ]}
            >
              {withAvatar && (
                <UserManager user={message.author}>
                  {({ user }) => (
                    <Avatar
                      email={user.email}
                      size={32}
                      style={[{ marginTop: 15 }, isCreator ? { marginLeft: 8 } : { marginRight: 8 }]}
                    />
                  )}
                </UserManager>
              )}
              <View style={!withAvatar && !isCreator && { marginLeft: 40 }}>
                {withTime && (
                  <Text style={[styles.messageGroupTime, isCreator && { textAlign: 'right' }]}>
                    {moment(new Date(message.submittedAt)).format('HH:mm')}
                  </Text>
                )}
                <View
                  style={[
                    styles.message,
                    isCreator && { borderTopRightRadius: 3 },
                    !isCreator && { borderTopLeftRadius: 3 },
                  ]}
                >
                  {message.replyOn && (
                    <View style={{ paddingVertical: 8 }}>
                      <ReplyMessage reply={message.replyOn} />
                    </View>
                  )}
                  {message.type == 'MESSAGE' && (
                    <>
                      <Text key={message.id} style={[styles.messageText, message.deletedAt && styles.deleted]}>
                        {message.deletedAt ? translate('homeworks.interview.messageDeleted') : message.content}
                      </Text>
                      {!message.deletedAt && message.editedAt && (
                        <Text style={{ textAlign: 'right', color: Color.silver, fontSize: 12 }}>ред.</Text>
                      )}
                    </>
                  )}
                  {message.type == 'ANSWER' && (
                    <View>
                      <View style={styles.taskAnswer}>
                        <Text style={{ fontStyle: 'italic' }}>{translate('homeworks.interview.taskMessage')}</Text>
                        <View style={styles.taskAnswerStatus}>
                          <Icon style={{ marginRight: 10 }} name={getStatusIcon(message.answerStatus)} size={20} />
                          {message.answerStatus != 'NOT_PERFORMED' && message.answerStatus != 'PERFORMED' && (
                            <UserManager userId={message.evaluatorId} fallbackLink={message.link('evaluator')}>
                              {({ user }) => (
                                <Pressable disabled={disabled} onPress={() => onPing(user)}>
                                  <Avatar email={user?.email} size={25} />
                                </Pressable>
                              )}
                            </UserManager>
                          )}
                        </View>
                      </View>
                      {message.answerStatus == 'NOT_PERFORMED' && (
                        <Text>
                          {message.answeredQuestionCount}/{message.questionCount}
                        </Text>
                      )}
                      {message.answerStatus == 'APPRECIATED' && (
                        <Text>
                          {message.score}/{maxScore}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Pressable>
          {popupShow && (
            <BottomPopup title={translate('homeworks.interview.actions.title')} onClose={() => setPopupShow(false)}>
              <TouchableNativeFeedback onPress={() => handleReply(message)}>
                <View style={{ borderTopWidth: StyleSheet.hairlineWidth }}>
                  <Text style={{ textAlign: 'center', padding: 15 }}>
                    {translate('homeworks.interview.actions.reply')}
                  </Text>
                </View>
              </TouchableNativeFeedback>
              {isCreator && (
                <>
                  <TouchableNativeFeedback onPress={() => handleEdit(message)}>
                    <View style={{ borderTopWidth: StyleSheet.hairlineWidth }}>
                      <Text style={{ textAlign: 'center', padding: 15 }}>
                        {translate('homeworks.interview.actions.edit')}
                      </Text>
                    </View>
                  </TouchableNativeFeedback>
                  <ConfirmationAlert
                    onConfirm={() => onDelete(message)}
                    title={translate('common.confirmation')}
                    text={translate('homeworks.interview.deleteConfirmation')}
                  >
                    {({ confirm }) => (
                      <TouchableNativeFeedback
                        onPress={() => {
                          setPopupShow(false);
                          confirm();
                        }}
                      >
                        <View style={{ borderTopWidth: StyleSheet.hairlineWidth }}>
                          <Text style={{ color: Color.danger, textAlign: 'center', padding: 15 }}>
                            {translate('homeworks.interview.actions.delete')}
                          </Text>
                        </View>
                      </TouchableNativeFeedback>
                    )}
                  </ConfirmationAlert>
                </>
              )}
            </BottomPopup>
          )}
        </>
      );
    }

    function renderHiddenItem(message) {
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
            <Icon name="arrow-undo-circle" size={25} color={Color.lightPrimary} />
          </Animated.View>
        </View>
      );
    }

    return (
      <>
        <SwipeRow
          ref={ref}
          disableLeftSwipe={!!message.deletedAt || message.type == 'ANSWER' || disabled}
          disableRightSwipe
          stopRightSwipe={-MAX_SWIPE_LENGTH}
          rightActivationValue={-REPLY_SWIPE_LENGTH}
          onRowClose={() => {
            if (rowSwipeAnimatedValue.current.vaginated) onReply(message);
          }}
          onSwipeValueChange={onSwipeValueChange}
          swipeKey={`${message.id}`}
          directionalDistanceChangeThreshold={1}
        >
          {renderHiddenItem(message)}

          {renderItem(message)}
        </SwipeRow>
        {withDate && <MessageSectionDate date={message.submittedAt} style={styles.dateText} />}
      </>
    );
  },
);

const styles = StyleSheet.create({
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
    paddingHorizontal: 12,
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
  dateText: {
    fontSize: 15,
    marginTop: 10,
    color: Color.silver,
    textAlign: 'center',
  },
  messageGroupTime: {
    fontSize: 10,
    color: Color.gray,
  },
});
