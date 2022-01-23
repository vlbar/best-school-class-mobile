import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import NumericInput from 'react-native-numeric-input';
import Color from '../../constants';
import Container from '../common/Container';
import Text from '../common/Text';
import BottomPopup from '../common/BottomPopup';
import useDelay from '../common/useDelay';
import LinkedText from '../tasks/linkedText/LinkedText';
import MessageInput from './MessageInput';
import { MessageContext } from './MessageList';
import ReplyMessage from './ReplyMessage';
import { clearHtmlTags } from '../../utils/TextUtils';
import ReplyView from './ReplyView';
import { useTranslation } from '../../utils/Internationalization';
import { TextQuestionContent } from './questionContentTypes/TextQuestionContent';
import { TestQuestionContent } from './questionContentTypes/TestQuestionContent';

function QuestionAnswer({ question, onScoreChange, commentCreateHref }, ref) {
  const { translate } = useTranslation();
  const [status, setStatus] = useState(question.questionAnswer?.score != null ? 'saved' : 'normal');
  const [showPopup, setShowPopup] = useState(false);

  const { value, onChange } = useDelay(updateQuestionScore, 1000, question.questionAnswer?.score);
  const scoreRef = useRef(question.questionAnswer?.score);
  const inputBorderColor = useMemo(() => {
    if (status === 'normal') return Color.white;
    if (status === 'saved') return Color.success;
    if (status === 'error') return Color.danger;
  }, [status]);

  function updateQuestionScore(score) {
    if (scoreRef.current === score) {
      setStatus('saved');
      return;
    }

    const questionAnswer = question.questionAnswer;

    question
      .link('changeScore')
      .put({ type: questionAnswer.type, questionId: questionAnswer.questionId, score })
      .then(() => {
        setStatus('saved');
        onScoreChange?.(scoreRef.current, score);
        scoreRef.current = score;
      })
      .catch(err => {
        setStatus('error');
        console.log(err);
      });
  }

  function buildComment(content) {
    return {
      type: 'COMMENT',
      content,
      questionAnswerId: question.questionAnswer?.questionId,
    };
  }

  return (
    <>
      <ReplyView
        ref={ref}
        disabled={!question.questionAnswer}
        swipeKey={`${question.id}`}
        onReply={() => setShowPopup(true)}
      >
        <View style={styles.questionContainer}>
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <LinkedText text={question.questionVariant.formulation} textStyle={styles.questionFormulation} />
            </View>
            <Text style={styles.answerLabel}>{translate('homeworks.try.studentAnswer')}:</Text>
            {question.questionVariant.type == 'TEXT_QUESTION' && <TextQuestionContent question={question} />}
            {question.questionVariant.type == 'TEST_QUESTION' && <TestQuestionContent question={question} />}
          </View>
          <View style={styles.questionScoreContainer}>
            <Text>
              {translate('homeworks.try.score')} ({translate('homeworks.try.shortMax')}{' '}
              {question.questionVariant.questionMaxScore}):
            </Text>
            {question.questionAnswer && (
              <NumericInput
                borderColor={inputBorderColor}
                separatorWidth={0}
                value={value}
                onChange={value => {
                  setStatus('normal');
                  onChange(value);
                }}
                valueType="real"
                containerStyle={{ backgroundColor: Color.white }}
                rounded
                minValue={0}
                maxValue={question.questionVariant.questionMaxScore}
              />
            )}
            {!question.questionAnswer && (
              <Text style={styles.noAnswerScore}>
                0 {translate('homeworks.try.outOf')} {question.questionVariant.questionMaxScore}
              </Text>
            )}
          </View>
        </View>
      </ReplyView>
      {showPopup && (
        <BottomPopup
          show={showPopup}
          onClose={() => setShowPopup(false)}
          title={translate('homeworks.interview.commentMessage')}
        >
          <Container>
            <MessageContext.Provider value={{}}>
              <ReplyMessage
                weight="bold"
                reply={{ content: clearHtmlTags(question.questionVariant.formulation) }}
                short
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                  {question.questionVariant.type == 'TEXT_QUESTION' && (
                    <TextQuestionContent question={question} short />
                  )}
                  {question.questionVariant.type == 'TEST_QUESTION' && (
                    <TestQuestionContent question={question} short />
                  )}

                  <Text weight="medium" style={styles.answer}>
                    {translate('homeworks.try.score')}: {value}/{question.questionVariant.questionMaxScore}
                  </Text>
                </View>
              </ReplyMessage>

              <MessageInput
                extraInputProps={{ autoFocus: true, placeholder: translate('homeworks.try.enterComment') }}
                messageCreateHref={commentCreateHref}
                messageBuilder={buildComment}
                onSubmit={() => setShowPopup(false)}
              />
            </MessageContext.Provider>
          </Container>
        </BottomPopup>
      )}
    </>
  );
}

export default React.memo(React.forwardRef(QuestionAnswer));

const styles = StyleSheet.create({
  questionContainer: {
    borderRadius: 20,
    backgroundColor: Color.ultraLightPrimary,
    padding: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  questionScoreContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionFormulation: {
    fontWeight: 'bold',
  },
  answerLabel: {
    fontSize: 14,
  },
  noAnswer: {
    color: Color.silver,
    fontSize: 16,
  },
  noAnswerScore: {
    color: Color.silver,
  },
  answer: {
    color: Color.gray,
    fontSize: 16,
    flex: 0,
    marginLeft: 10,
    paddingHorizontal: 10,
    backgroundColor: Color.background,
    borderRadius: 8,
  },
});
