import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from '../../../utils/Internationalization';
import Text from '../../common/Text';
import Avatar from '../../user/Avatar';
import { types } from '../AnswerStatus';
import { StatusBadge } from '../StatusBadge';
import UserManager from '../UserManager';

export default function Answer({ answer, onPing, maxScore }) {
  const { translate } = useTranslation();

  const status = types[answer.answerStatus];
  
  return (
    <View>
      <View style={styles.taskAnswer}>
        <Text style={styles.title}>{translate('homeworks.interview.taskMessage')}</Text>
        <View style={styles.taskAnswerStatus}>
          <View style={styles.badge}>
            <StatusBadge status={status.name} size={20} />
          </View>
          {status.evaluated && (
            <UserManager userId={answer.evaluatorId} fallbackLink={answer.link('evaluator')}>
              {({ user }) => (
                <Pressable onPress={() => onPing(user)}>
                  <Avatar email={user?.email} size={25} />
                </Pressable>
              )}
            </UserManager>
          )}
        </View>
      </View>
      {status == types.APPRECIATED && (
        <Text>
          {answer.score}/{maxScore}
        </Text>
      )}
      {status == types.NOT_PERFORMED && (
        <Text>
          {answer.answeredQuestionCount}/{answer.questionCount}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  taskAnswer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  taskAnswerStatus: {
    marginLeft: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  badge: {
    marginRight: 10,
  },
  title: {
    fontStyle: 'italic',
  },
});
