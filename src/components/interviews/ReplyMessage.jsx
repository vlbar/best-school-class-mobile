import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Color from '../../constants';
import { useTranslation } from '../../utils/Internationalization';
import Text from '../common/Text';
import Avatar from '../user/Avatar';
import UserName from '../user/UserName';
import { getStatusIcon } from './Message';
import UserManager from './UserManager';

export default function ReplyMessage({ reply, short, children, ...props }) {
  const { translate } = useTranslation();

  return (
    <View style={styles.reply}>
      <Text style={{ flex: 1 }} numberOfLines={short ? 1 : undefined} {...props}>
        {reply.content}
      </Text>
      {reply.author && (
        <Text style={styles.replyAuthor}>
          — <UserName user={reply.author} textSize={14} short />
        </Text>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  reply: {
    flexGrow: 1,
    flex: 1,
    paddingHorizontal: 10,
    borderLeftWidth: 3,
    borderLeftColor: Color.lightPrimary,
  },
  line: {
    backgroundColor: Color.lightPrimary,
    borderRadius: 3,
    width: 3,
    height: '100%',
  },
  replyAuthor: {
    textAlign: 'right',
    fontSize: 12,
  },
});
