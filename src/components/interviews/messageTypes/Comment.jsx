import React, { useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import Color from '../../../constants';
import { useTranslation } from '../../../utils/Internationalization';
import { clearHtmlTags } from '../../../utils/TextUtils';
import Modal from '../../common/Modal';
import Text from '../../common/Text';
import LinkedText from '../../tasks/linkedText/LinkedText';
import { TextQuestionContent } from '../questionContentTypes/TextQuestionContent';
import ReplyMessage from '../ReplyMessage';

export function Comment({ comment }) {
  const { translate } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  const answer = comment.questionAnswer;

  if (comment.valid)
    return (
      <View>
        <TouchableWithoutFeedback onPress={() => setShowDetails(true)}>
          <View style={{ paddingVertical: 8 }}>
            <ReplyMessage weight="medium" reply={{ content: clearHtmlTags(comment.formulation) }}>
              <View>
                {answer.content && <TextQuestionContent question={comment} />}
                {answer.selectedAnswerVariants && (
                  <Text style={{ fontSize: 14 }}>
                    {translate('homeworks.interview.testAnswersSelected_interval', {
                      postProcess: 'interval',
                      count: answer.selectedAnswerVariants.length,
                    })}
                  </Text>
                )}
                <Text weight="medium" style={styles.score}>
                  {translate('homeworks.interview.score')}: {comment.score}/{comment.maxScore}
                </Text>
              </View>
            </ReplyMessage>

            {showDetails && (
              <Modal
                title={translate('homeworks.try.questionFormulation')}
                show={true}
                onClose={() => setShowDetails(false)}
              >
                <View>
                  <LinkedText text={comment.formulation} textStyle={{ fontWeight: 'bold' }} />
                </View>
              </Modal>
            )}
          </View>
        </TouchableWithoutFeedback>
        <Text key={comment.id} style={[styles.messageText, comment.deletedAt && styles.deleted]}>
          {comment.deletedAt ? translate('homeworks.interview.comment') : comment.content}
        </Text>
      </View>
    );
  else
    return <Text style={[styles.messageText, styles.deleted]}>{translate('homeworks.interview.commentInvalid')}</Text>;
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
  score: {
    color: Color.gray,
    fontSize: 14,
    alignSelf: 'flex-end',
    marginLeft: 10,
    paddingHorizontal: 10,
    backgroundColor: Color.background,
    borderRadius: 8,
  },
});
