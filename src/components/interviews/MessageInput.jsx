import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Color from '../../constants';
import Link from '../../utils/Hateoas/Link';
import { getI, useTranslation } from '../../utils/Internationalization';
import IconButton from '../common/IconButton';
import Text from '../common/Text';
import { getName } from '../user/UserName';
import { MessageContext } from './MessageList';
import ReplyMessage from './ReplyMessage';

export default function MessageInput({ onSubmit, messageCreateHref, extraInputProps, messageBuilder }) {
  const { translate } = useTranslation();
  const [message, setMessage] = useState('');
  const { replyMessage, setReply, ping, setPing, editingMessage, setEdit } = useContext(MessageContext);

  const inputRef = useRef();

  useEffect(() => {
    if (replyMessage) inputRef.current.focus();
  }, [replyMessage]);

  useEffect(() => {
    if (ping) {
      setMessage(getName(ping) + ', ');
      setPing(null);
      inputRef.current.focus();
    }
  }, [ping]);

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content);
      setReply(editingMessage.replyOn);
      inputRef.current.focus();
    }
  }, [editingMessage]);

  function reset(blur = true) {
    setMessage('');
    setReply?.(null);
    setPing?.(null);
    setEdit?.(null);
    if (blur) inputRef.current.blur();
  }

  function handleMessage() {
    let msg = messageBuilder?.(message) ?? {
      ...(editingMessage ?? { type: 'MESSAGE' }),
      content: message,
      replyOnId: replyMessage?.id,
    };

    let request;
    if (editingMessage) request = editingMessage.link().put(msg);
    else request = new Link(messageCreateHref).post(msg).then(onSubmit);

    request.then(() => {
      reset(!!editingMessage);
    });
  }

  return (
    <View>
      {replyMessage && (
        <View style={styles.replyContainer}>
          <ReplyMessage reply={replyMessage} short={true} />
          <IconButton
            style={{
              paddingHorizontal: 0,
            }}
            name="close-outline"
            size={30}
            onPress={() => setReply(null)}
          />
        </View>
      )}
      {editingMessage && (
        <View style={styles.replyContainer}>
          <View
            style={{
              flexGrow: 1,
              flex: 1,
              paddingHorizontal: 10,
              borderLeftWidth: 3,
              borderLeftColor: Color.lightPrimary,
            }}
          >
            <Text style={{ color: Color.lightPrimary, fontWeight: 'bold' }}>
              {translate('homeworks.interview.messageEdit')}
            </Text>
            <Text numberOfLines={1}>{editingMessage.content}</Text>
          </View>
          <IconButton
            style={{
              paddingHorizontal: 0,
            }}
            name="close-outline"
            size={30}
            onPress={() => reset()}
          />
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
            ref={inputRef}
            {...extraInputProps}
          />
        </View>
        <View style={styles.sendButton}>
          <IconButton
            disabled={!message}
            name="paper-plane-outline"
            size={35}
            onPress={handleMessage}
            color={Color.darkGray}
            style={{ transform: [{ rotateZ: '45deg' }], padding: 0 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
