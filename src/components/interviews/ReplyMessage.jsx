import React from 'react';
import { StyleSheet, View } from 'react-native';
import Color from '../../constants';
import { useTranslation } from '../../utils/Internationalization';
import Text from '../common/Text';
import UserName from '../user/UserName';

export default function ReplyMessage({ reply, short, children, ...props }) {
  const { translate } = useTranslation();

  return (
    <View style={styles.reply}>
      {reply.content && (
        <Text numberOfLines={short ? 1 : undefined} {...props}>
          {reply.content}
        </Text>
      )}
      {reply.author && (
        <View style={styles.footer}>
          {!reply.content && <Text style={styles.typeBadge}>{translate('homeworks.interview.taskMessage')}</Text>}
          <Text style={styles.replyAuthor}>
            — <UserName user={reply.author} textSize={14} short />
          </Text>
        </View>
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
  typeBadge: {
    backgroundColor: Color.lightPrimary,
    paddingHorizontal: 5,
    borderRadius: 5,
    fontStyle: 'italic',
    color: Color.white,
    fontSize: 14,
    alignSelf: 'flex-start',
  },
});
