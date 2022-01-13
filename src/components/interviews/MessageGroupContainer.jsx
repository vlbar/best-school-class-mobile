import React, { useContext, useEffect, useState } from 'react';
import { useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import Color from '../../constants';
import { useTranslation } from '../../utils/Internationalization';
import Text from '../common/Text';
import Message from './Message';
import { MessageContext } from './MessageList';

export function isDatesEquals(date1, date2) {
  return (
    date1.getYear() === date2.getYear() && date1.getMonth() === date2.getMonth() && date1.getDay() === date2.getDay()
  );
}

export default React.forwardRef(({ fetchLink, tasks, onAnswer, currentUser, blockTimeRange, style, ...props }, ref) => {
  const { setReply, setPing, setEdit, disabled } = useContext(MessageContext);
  const { translate } = useTranslation();

  const page = useRef(null);
  const messagesRef = useRef({});
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const timeout = useRef(null);
  const fetchLinkHref = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(timeout.current);
    };
  }, []);

  useEffect(() => {
    if (fetchLink && page.current == null) {
      // && fetchLink.href != fetchLinkHref.current) {
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
      if (!disabled) reloadChanges(newPage.link('changedAfter'));
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

  function renderItem(data) {
    const message = data.item;
    const nextMessage = messages[data.index + 1];
    const isAuthor = currentUser.id === message.author.id;
    const anotherBlock =
      !nextMessage ||
      nextMessage.author.id != message.author.id ||
      message.submittedAt - nextMessage.submittedAt > blockTimeRange;

    return (
      <Message
        message={message}
        tasks={tasks}
        withAvatar={!isAuthor && anotherBlock}
        isCreator={isAuthor}
        withTime={anotherBlock}
        onEdit={setEdit}
        onReply={setReply}
        onPing={setPing}
      />
    );
  }

  return (
    <SwipeListView
      ref={ref}
      inverted
      useFlatList={true}
      fadingEdgeLength={30}
      data={messages}
      renderItem={renderItem}
      ListEmptyComponent={
        !loading && (
          <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.emptyText}>{translate('homeworks.interview.noMessages')}</Text>
          </View>
        )
      }
      ListFooterComponent={loading && messages.length == 0 && <ActivityIndicator color={Color.primary} size={50} />}
      ListFooterComponentStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
      contentContainerStyle={style}
      keyExtractor={item => item.id}
      onEndReached={fetchPrev}
      onEndReachedThreshold={1}
      directionalDistanceChangeThreshold={1}
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  emptyText: {
    color: Color.silver,
    textAlign: 'center',
  },
});
