import React, { createContext, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Color from '../../constants';
import { useTranslation } from '../../utils/Internationalization';
import Text from '../common/Text';
import MessageGroupContainer from './MessageGroupContainer';
import MessageInput from './MessageInput';

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
  const { translate } = useTranslation();

  const [replyMessage, setReply] = useState(null);
  const [editingMessage, setEdit] = useState(null);
  const [ping, setPing] = useState(null);

  const listRef = useRef(null);

  function handleMessage(message) {
    onMessageCreate?.(message);
    listRef.current.scrollToOffset({ animated: true, offset: 0 });
  }

  return (
    <MessageContext.Provider value={{ replyMessage, setReply, editingMessage, setEdit, ping, setPing }}>
      <View style={styles.container}>
        <MessageGroupContainer
          fetchLink={fetchLink}
          onAnswer={onAnswer}
          disabled={closed}
          tasks={tasks}
          currentUser={currentUser}
          style={styles.messageContainer}
          blockTimeRange={BLOCK_TIME_RANGE_IN_MILLIS}
          listViewRef={listRef}
        />
        {!closed && <MessageInput onSubmit={handleMessage} messageCreateLink={messageCreateLink} />}
        {closed && (
          <View style={styles.closedContainer}>
            <Text style={styles.closedText}>{translate('homeworks.interview.closed')}</Text>
          </View>
        )}
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
    marginBottom: 20,
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
  closedContainer: {
    backgroundColor: '#E6E6E6',
    
    padding: 8,
    marginHorizontal: -12,
    alignItems: 'center',
    justifyContent: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  closedText: {
    color: Color.gray,
    fontSize: 15,
    textAlign: 'center',
  },
});
