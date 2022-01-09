import React from 'react';
import { useRef } from 'react';
import { useMemo } from 'react';
import { FlatList } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import MessageGroup from './MessageGroup';

export function isDatesEquals(date1, date2) {
  return (
    date1.getYear() === date2.getYear() && date1.getMonth() === date2.getMonth() && date1.getDay() === date2.getDay()
  );
}

export default function MessageGroupContainer({ messages, currentUser, blockTimeRange, style, onReply, ...props }) {
  const messageGroups = useMemo(() => {
    let prevMessage = null;
    let groupedMessages = [];
    let idx = -1;
    messages.forEach(message => {
      if (
        prevMessage == null ||
        message.author.id != prevMessage.author.id ||
        prevMessage.submittedAt - message.submittedAt > blockTimeRange ||
        !isDatesEquals(new Date(prevMessage.submittedAt), new Date(message.submittedAt)) ||
        prevMessage.type != message.type
      ) {
        groupedMessages.push({
          author: message.author,
          time: message.submittedAt,
          messages: [],
          type: message.type,
        });
        idx++;
      }
      groupedMessages[idx].messages.push(message);
      prevMessage = message;
    });

    return groupedMessages;
  }, [messages, currentUser, blockTimeRange]);

  function renderGroup({ item: messageGroup }) {
    let isAuthor = messageGroup.author.id == currentUser.id;

    return <MessageGroup messageGroup={messageGroup} isCreator={isAuthor} onReply={onReply} />;
  }

  return (
    <FlatList
      inverted
      fadingEdgeLength={30}
      data={messageGroups}
      renderItem={renderGroup}
      contentContainerStyle={style}
      keyExtractor={item => item.submittedAt}
      {...props}
    />
  );
}
