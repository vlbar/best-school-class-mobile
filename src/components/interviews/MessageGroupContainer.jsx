import SortedSet from 'collections/sorted-set';
import React, { useEffect, useMemo, useState } from 'react';
import { useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import Color from '../../constants';
import Link from '../../utils/Hateoas/Link';
import { useTranslation } from '../../utils/Internationalization';
import Text from '../common/Text';
import Message from './Message';

export function isDatesEquals(date1, date2) {
  return (
    date1.getYear() === date2.getYear() && date1.getMonth() === date2.getMonth() && date1.getDay() === date2.getDay()
  );
}

function MessageGroupContainer(
  {
    fetchHref,
    tasks,
    onAnswer,
    currentUser,
    blockTimeRange,
    disabled,
    style,
    onReply,
    onPing,
    onEdit,
    onScrollEnabled,
    ...props
  },
  ref,
) {
  const { translate } = useTranslation();

  const page = useRef(null);
  const messagesRef = useRef(
    new SortedSet(
      [],
      (a, b) => a.submittedAt === b.submittedAt && a.author.id === b.author.id,
      (a, b) => b.submittedAt - a.submittedAt || b.author.id - a.author.id,
    ),
  ).current;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const timeout = useRef(null);

  useEffect(() => {
    if (fetchHref && page.current == null) {
      clearTimeout(timeout.current);
      fetchMessages(new Link(fetchHref).fill('size', 30));
    }
    return () => {
      clearTimeout(timeout.current);
    };
  }, []);

  console.log('GROUP RERENDER');

  function reloadChanges(link) {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      fetchChanges(link);
    }, 2000);
  }

  function fetchMessages(link) {
    link?.fetch(setLoading).then(newPage => {
      let newMessages = newPage.list('messages') ?? [];
      messagesRef.addEach(newMessages);

      setMessages(messagesRef.toArray());

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
    changedMessages.forEach(message => {
      messagesRef.delete(message);
      messagesRef.add(message);
      if (message.type == 'ANSWER') onAnswer?.(message);
    });

    setMessages(messagesRef.toArray());
  }

  function fetchPrev() {
    if (!loading) fetchMessages(page.current.link('next'));
  }

  function renderItem(data) {
    const message = data.item;
    const nextMessage = messages[data.index + 1];
    const isAuthor = currentUser.id === message.author.id;
    const anotherDate =
      (!nextMessage && !page.current?.link('next')) ||
      (nextMessage && !isDatesEquals(new Date(message.submittedAt), new Date(nextMessage.submittedAt)));
    const anotherBlock =
      !nextMessage ||
      nextMessage.author.id != message.author.id ||
      message.submittedAt - nextMessage.submittedAt > blockTimeRange;

    return (
      <Message
        message={message}
        tasks={tasks}
        disabled={disabled}
        withAvatar={!isAuthor && anotherBlock}
        isCreator={isAuthor}
        withTime={anotherBlock}
        withDate={anotherDate}
        onEdit={onEdit}
        onReply={onReply}
        onPing={onPing}
        onScrollEnabled={onScrollEnabled}
      />
    );
  }

  const memoList = useMemo(() => {
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
  }, [messages, loading, tasks, disabled]);

  return memoList;
}

export default React.forwardRef(MessageGroupContainer);

const styles = StyleSheet.create({
  emptyText: {
    color: Color.silver,
    textAlign: 'center',
  },
});
