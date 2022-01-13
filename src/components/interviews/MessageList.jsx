import React, { createContext, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import Color from '../../constants';
import { getI } from '../../utils/Internationalization';
import IconButton from '../common/IconButton';
import Text from '../common/Text';
import UserName, { getName } from '../user/UserName';
import MessageGroupContainer from './MessageGroupContainer';
import MessageInput from './MessageInput';
import ReplyMessage from './ReplyMessage';

const BLOCK_TIME_RANGE_IN_MILLIS = 1000 * 60 * 5;

export const MessageContext = createContext();

export default function MessageList({
  fetchLink,
  closed = false,
  currentUser,
  onAnswer,
  messageCreateLink,
  onMessageCreate,
  tasks,
}) {
  const [replyMessage, setReply] = useState(null);
  const [editingMessage, setEdit] = useState(null);
  const [ping, setPing] = useState(null);
  const [disabled, setDisabled] = useState(closed);

  const listRef = useRef(null);

  function handleMessage(message) {
    onMessageCreate?.(message);
    listRef.current.scrollToOffset({ animated: true, offset: 0 });
  }

  return (
    <MessageContext.Provider
      value={{ replyMessage, setReply, editingMessage, setEdit, disabled, setDisabled, ping, setPing }}
    >
      <View style={styles.container}>
        <MessageGroupContainer
          fetchLink={fetchLink}
          onAnswer={onAnswer}
          tasks={tasks}
          currentUser={currentUser}
          style={styles.messageContainer}
          blockTimeRange={BLOCK_TIME_RANGE_IN_MILLIS}
          listViewRef={listRef}
        />
        <MessageInput onSubmit={handleMessage} messageCreateLink={messageCreateLink} />
      </View>
    </MessageContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginHorizontal: -8,
    paddingBottom: 0,
    marginBottom: 0,
  },
  messageContainer: {
    flexGrow: 1,
  },
  messageInputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 10,
  },
  messageInput: {
    flexGrow: 1,
    backgroundColor: Color.ultraLightPrimary,
    padding: 0,
    fontSize: 17,
    marginVertical: 7,
    marginHorizontal: 15,
    maxHeight: 65,
  },
  sendButton: {
    flexDirection: 'column-reverse',
    paddingHorizontal: 3,
    marginBottom: 2,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
