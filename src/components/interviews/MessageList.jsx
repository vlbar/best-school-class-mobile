import React, { createContext, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Color from '../../constants';
import { useTranslation } from '../../utils/Internationalization';
import Text from '../common/Text';
import MessageGroupContainer from './MessageGroupContainer';
import MessageInput from './MessageInput';

const BLOCK_TIME_RANGE_IN_MILLIS = 1000 * 60 * 5;

export const MessageContext = createContext();

export default function MessageList({
  fetchHref,
  closed = false,
  currentUser,
  onAnswer,
  onAnswerPress,
  messageCreateHref,
  onMessageCreate,
  onInterviewClosed,
  tasks,
}) {
  const { translate } = useTranslation();

  const [replyMessage, setReply] = useState(null);
  const [editingMessage, setEdit] = useState(null);
  const [ping, setPing] = useState(null);

  const listRef = useRef(null);

  console.log('LIST RERENDER');

  const memoComp = useMemo(() => {
    return (
      <MessageGroupContainer
        fetchHref={fetchHref}
        onAnswer={onAnswer}
        disabled={closed}
        tasks={tasks}
        currentUser={currentUser}
        style={styles.messageContainer}
        blockTimeRange={BLOCK_TIME_RANGE_IN_MILLIS}
        listViewRef={listRef}
        onReply={setReply}
        onEdit={setEdit}
        onPing={setPing}
        onAnswerPress={onAnswerPress}
        onScrollEnabled={handleScroll}
      />
    );
  }, [fetchHref, tasks, currentUser, closed]);

  function handleMessage(message) {
    onMessageCreate?.(message);
    listRef.current.scrollToOffset({ animated: true, offset: 0 });
  }

  //REACT CRINGE REFS DIFFER ON FROM WHAT COMPONENT IS
  function handleScroll(enabled) {
    listRef.current.setNativeProps({ scrollEnabled: enabled });
  }

  return (
    <View style={styles.container}>
      {memoComp}
      <MessageContext.Provider value={{ replyMessage, setReply, ping, setPing, editingMessage, setEdit }}>
        {!closed && (
          <View style={{ paddingHorizontal: 20 }}>
            <MessageInput onInterviewClosed={onInterviewClosed} onSubmit={handleMessage} messageCreateHref={messageCreateHref} />
          </View>
        )}
      </MessageContext.Provider>
      {closed && (
        <View style={styles.closedContainer}>
          <Text style={styles.closedText}>{translate('homeworks.interview.closed')}</Text>
        </View>
      )}
    </View>
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
    paddingHorizontal: 20,
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
