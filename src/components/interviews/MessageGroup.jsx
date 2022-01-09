import moment from 'moment';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, TouchableNativeFeedback, View } from 'react-native';
import { SwipeRow } from 'react-native-swipe-list-view';
import Color from '../../constants';
import { useTranslation } from '../../utils/Internationalization';
import BottomPopup from '../common/BottomPopup';
import Text from '../common/Text';
import Avatar from '../user/Avatar';

export default function MessageGroup({ messageGroup, isCreator, onReply }) {
  const [actionsPopup, setActionsPopup] = useState({ show: false, item: null });
  const { translate } = useTranslation();

  function onDelete(message) {
    message
      .link()
      .remove()
      .then(() => setActionsPopup({ show: false }));
  }

  function handleReply(reply) {
    setActionsPopup({ show: false });
    onReply?.(reply);
  }

  return (
    <>
      <View style={[styles.messageGroupContainer, isCreator && { flexDirection: 'row-reverse' }]}>
        {!isCreator && <Avatar email={messageGroup.author.email} size={30} style={styles.messageAuthor} />}
        <View style={[styles.messageGroup]}>
          <Text style={[styles.messageGroupTime, isCreator && { textAlign: 'right' }]}>
            {moment(new Date(messageGroup.time)).utcOffset(3).format('HH:mm')}
          </Text>
          <View style={styles.messageGroupContent}>
            {messageGroup.messages.map(message => {
              return (
                <SwipeRow
                  key={message.id}
                  rightOpenValue={-75}
                  rightActivationValue={-25}
                  disableRightSwipe
                  stopRightSwipe={-75}
                  onRightAction={() => handleReply(message)}
                >
                  <View>
                    <Text style={{ textAlign: 'right' }}>ABOOBA</Text>
                  </View>
                  <View style={[{ borderRadius: 10, overflow: 'hidden' }]}>
                    <View style={{ borderRadius: 10, paddingVertical: 2 }}>
                      <Text key={message.id} style={[styles.messageText, message.deletedAt && styles.deleted]}>
                        {message.deletedAt ? translate('homeworks.interview.messageDeleted') : message.content}
                      </Text>
                    </View>
                  </View>
                </SwipeRow>
              );
            })}
          </View>
        </View>
      </View>
      {actionsPopup.show && (
        <BottomPopup
          title={translate('homeworks.interview.actions.title')}
          onClose={() => setActionsPopup({ show: false })}
        >
          <TouchableNativeFeedback onPress={() => handleReply(actionsPopup.item)}>
            <View style={{ borderTopWidth: StyleSheet.hairlineWidth }}>
              <Text style={{ textAlign: 'center', padding: 15 }}>{translate('homeworks.interview.actions.reply')}</Text>
            </View>
          </TouchableNativeFeedback>
          {isCreator && (
            <>
              <TouchableNativeFeedback>
                <View style={{ borderTopWidth: StyleSheet.hairlineWidth }}>
                  <Text style={{ textAlign: 'center', padding: 15 }}>
                    {translate('homeworks.interview.actions.edit')}
                  </Text>
                </View>
              </TouchableNativeFeedback>
              <TouchableNativeFeedback onPress={() => onDelete(actionsPopup.item)}>
                <View style={{ borderTopWidth: StyleSheet.hairlineWidth }}>
                  <Text style={{ color: Color.danger, textAlign: 'center', padding: 15 }}>
                    {translate('homeworks.interview.actions.delete')}
                  </Text>
                </View>
              </TouchableNativeFeedback>
            </>
          )}
        </BottomPopup>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  messageAuthor: {
    marginTop: 17,
  },
  messageGroupContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  messageGroupContent: {
    flexDirection: 'column-reverse',
    borderRadius: 10,
    backgroundColor: Color.ultraLightPrimary,
    maxWidth: Dimensions.get('window').width * 0.8,
    elevation: 5,
  },
  messageGroup: {
    marginLeft: 10,
  },
  messageText: {
    borderRadius: 10,
    backgroundColor: Color.ultraLightPrimary,
    fontSize: 17,
    paddingHorizontal: 10,
  },
  deleted: {
    fontStyle: 'italic',
    fontSize: 15,
    color: Color.gray,
  },
  messageGroupTime: {
    fontSize: 10,
    color: Color.gray,
  },
});
