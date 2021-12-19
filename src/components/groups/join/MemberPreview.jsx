import React from 'react';
import { StyleSheet, View } from 'react-native';
import Color from '../../../constants';
import { getI } from '../../../utils/Internationalization';
import Text from '../../common/Text';
import Avatar from '../../user/Avatar';

export default function MemberPreview({ members, total, iconSize = 40 }) {
  function membersWord(count) {
    var number = count % 10;
    if (number === 1) return 'участник';
    if (number > 1 && number < 5) return 'участника';
    if (number >= 5) return 'участников';
  }

  return (
    <View>
      <View style={styles.membersIcons}>
        {members.map((member, index) => {
          return (
            <View key={index}>
              <View style={styles.iconWrapper} key={index}>
                <Avatar size={iconSize} email={member.user.email} />
              </View>
            </View>
          );
        })}
        {total > members.length ? (
          <View style={styles.iconWrapper}>
            <View
              style={[
                styles.totalIcon,
                styles.icon,
                {
                  height: iconSize,
                  width: iconSize,
                },
              ]}
            >
              <Text style={{ color: Color.white }}>+{total - members.length}</Text>
            </View>
          </View>
        ) : null}
      </View>
      <Text style={[styles.membersNames, styles.smallText]}>
        {total <= members.length ? (
          <Text style={[styles.membersNames, styles.smallText]}>{getI('groups.groupJoin.members')} </Text>
        ) : (
          ''
        )}
        {members.map(member => member.user.secondName).join(', ')}{' '}
        {total > members.length ? `и еще ${total - members.length} ${membersWord(total - members.length)}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  membersIcons: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
  },
  membersNames: {
    color: Color.gray,
    textAlign: 'center',
    marginTop: 10,
  },
  smallText: {
    fontSize: 15,
  },
  totalIcon: {
    backgroundColor: Color.silver,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    borderRadius: 50,
    padding: 4,
    backgroundColor: Color.white,
    marginLeft: -10,
  },
  icon: {
    borderRadius: 50,
  },
});
