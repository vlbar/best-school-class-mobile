import moment from 'moment';
import React, { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  TouchableNativeFeedback,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
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
import { StatusBadge } from './StatusBadge';
import { TestQuestionContent, TextQuestionContent } from './QuestionAnswer';
import { clearHtmlTags } from '../tasks/TaskList';
import Check from '../common/Check';
import ReplyView from './ReplyView';
import TextMessage from './messageTypes/TextMessage';
import Answer from './messageTypes/Answer';
import { Comment } from './messageTypes/Comment';

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

export function isMessageDisabled(message) {
  return !!message.deletedAt || (message.type == 'COMMENT' && !message.valid);
}

function Message(
  {
    message,
    tasks,
    disabled,
    withAvatar,
    withTime,
    withDate,
    isCreator,
    onEdit,
    onReply,
    onPing,
    onAnswerPress,
    onScrollEnabled,
  },
  ref,
) {
  const { translate } = useTranslation();
  const [popupShow, setPopupShow] = useState(false);
  const maxScore = useMemo(() => {
    if (message.type == 'ANSWER') return tasks?.find(t => t.id == message.taskId)?.maxScore;
  }, [message, tasks]);

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

  function renderItem(disabled) {
    return (
      <Pressable
        onLongPress={() => !disabled && setPopupShow(true)}
        onPress={() => message.type == 'ANSWER' && onAnswerPress?.(message)}
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
              {message.type == 'MESSAGE' && <TextMessage message={message} />}
              {message.type == 'COMMENT' && <Comment comment={message} />}
              {message.type == 'ANSWER' && <Answer answer={message} onPing={onPing} maxScore={maxScore} />}
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  const memoRow = useMemo(() => {
    const disabledCondition = disabled || isMessageDisabled(message);

    return (
      <>
        <ReplyView
          ref={ref}
          swipeKey={`${message.id}`}
          disabled={disabledCondition}
          onScrollEnabled={onScrollEnabled}
          onReply={() => onReply(message)}
        >
          {renderItem(disabledCondition)}
        </ReplyView>
        {withDate && <MessageSectionDate date={message.submittedAt} style={styles.dateText} />}
      </>
    );
  }, [withDate, message, tasks, disabled]);

  return (
    <>
      {memoRow}
      {popupShow && (
        <BottomPopup title={translate('homeworks.interview.actions.title')} onClose={() => setPopupShow(false)}>
          <TouchableNativeFeedback onPress={() => handleReply(message)}>
            <View style={{ borderTopWidth: StyleSheet.hairlineWidth }}>
              <Text style={{ textAlign: 'center', padding: 15 }}>{translate('homeworks.interview.actions.reply')}</Text>
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

export default React.forwardRef(Message);

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
