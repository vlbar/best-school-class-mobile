import React from 'react';
import { StyleSheet, View } from 'react-native';
import Color from '../../../constants';
import { useTranslation } from '../../../utils/Internationalization';
import Text from '../../common/Text';
import ReplyMessage from '../ReplyMessage';

export default function TextMessage({ message }) {
  const { translate } = useTranslation();

  return (
    <View>
      {message.replyOn && (
        <View style={{ paddingVertical: 8 }}>
          <ReplyMessage reply={message.replyOn} />
        </View>
      )}
      <Text key={message.id} style={[styles.messageText, message.deletedAt && styles.deleted]}>
        {message.deletedAt ? translate('homeworks.interview.messageDeleted') : message.content}
      </Text>
      {!message.deletedAt && message.editedAt && (
        <Text style={styles.editLabel}>{translate('homeworks.interview.messageEdited')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageText: {
    fontSize: 17,
  },
  deleted: {
    fontStyle: 'italic',
    fontSize: 15,
    paddingVertical: 3,
    color: Color.gray,
  },
  editLabel: {
    textAlign: 'right',
    color: Color.silver,
    fontSize: 12,
  },
});
