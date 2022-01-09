import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import Color from '../../constants';
import { getI } from '../../utils/Internationalization';
import IconButton from '../common/IconButton';
import Text from '../common/Text';
import MessageGroupContainer from './MessageGroupContainer';

const BLOCK_TIME_RANGE_IN_MILLIS = 1000 * 60 * 5;

export default function MessageList({
  fetchLink,
  closed = false,
  currentUser,
  onAnswer,
  messageCreateLink,
  onMessageCreate,
}) {
  const [replyMessage, setReply] = useState(null);
  const [editingMessage, setEdit] = useState(null);
  const [commentingAnswer, setCommentingAnswer] = useState(null);
  const [disabled, setDisabled] = useState(closed);

  const page = useRef(null);
  const messagesRef = useRef({});
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeout = useRef(null);
  const fetchLinkHref = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(timeout.current);
    };
  }, []);

  useEffect(() => {
    if (fetchLink && page.current == null && fetchLink.href != fetchLinkHref.current) {
      fetchLinkHref.current = fetchLink.href;
      clearTimeout(timeout.current);
      fetchMessages(fetchLink.fill('size', 30));
    }
  }, [fetchLink]);

  function reloadChanges(link) {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      fetchChanges(link);
    }, 2000);
  }

  function fetchMessages(link) {
    link?.fetch(setLoading).then(newPage => {
      let newMessages = newPage.list('messages');
      if (newMessages) {
        newMessages = newMessages.reduce((map, message) => {
          map[message.submittedAt] = message;
          return map;
        }, {});
        if (page.current == null) {
          messagesRef.current = newMessages;
        } else {
          messagesRef.current = { ...messagesRef.current, ...newMessages };
        }
        setMessages(Object.values(messagesRef.current));
      }
      page.current = newPage;

      if (!closed) reloadChanges(newPage.link('changedAfter'));
    });
  }

  function fetchChanges(link) {
    link?.fetch().then(changes => {
      let changedMessages = changes.list('messages');

      if (changedMessages) {
        updateMessages(changedMessages);
        reloadChanges(changes.link('changedAfter'));
      } else reloadChanges(link);
    });
  }

  function updateMessages(changedMessages) {
    let keys = Object.keys(messagesRef.current);
    let lastKey = keys.pop();
    let firstKey = keys.shift();
    if (!firstKey) firstKey = lastKey;
    let addedMessages = {};

    changedMessages = changedMessages.reduce((map, message) => {
      if (!firstKey || Number(firstKey) < message.submittedAt) addedMessages[message.submittedAt] = message;
      else if (Number(lastKey) <= message.submittedAt) map[message.submittedAt] = message;
      if (message.type == 'ANSWER') onAnswer && onAnswer?.(message);
      return map;
    }, {});

    messagesRef.current = {
      ...addedMessages,
      ...messagesRef.current,
      ...changedMessages,
    };
    setMessages(Object.values(messagesRef.current));
  }

  function fetchPrev() {
    if (!loading) fetchMessages(page.current.link('next'));
  }

  function handleMessage() {
    let msg = { content: message };
    if (page.current != null) updateMessages([msg]);

    messageCreateLink?.post(msg).then(() => {
      setMessage('');
    });
    onMessageCreate?.(message);
  }

  return (
    <View style={styles.container}>
      <MessageGroupContainer
        messages={messages}
        currentUser={currentUser}
        style={styles.messageContainer}
        blockTimeRange={BLOCK_TIME_RANGE_IN_MILLIS}
        onEndReached={fetchPrev}
        onReply={setReply}
      />
      <View>
        {replyMessage && (
          <View>
            <Text>{replyMessage.content ?? 'Сообщение удалено'}</Text>
          </View>
        )}
        <View style={styles.messageInputContainer}>
          {/* REACT NATIVE CRINGE TEXT INPUT PADDINGS ALERT!!!! OUTER VIEW LIVES MATTER 👍🏿 */}
          <View style={{ backgroundColor: Color.ultraLightPrimary, flex: 1, borderRadius: 20 }}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              style={styles.messageInput}
              placeholder={getI('homeworks.interview.messagePlaceholder')}
              multiline
            />
          </View>
          <View style={styles.sendButton}>
            <IconButton
              name="send-outline"
              size={35}
              onPress={handleMessage}
              color={Color.darkGray}
              style={{ padding: 0, paddingLeft: 12 }}
            />
          </View>
        </View>
      </View>
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
    marginBottom: 2,
  },
});
