import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import NumericInput from 'react-native-numeric-input';
import Color from '../../constants';
import Text from '../common/Text';
import useDelay from '../common/useDelay';
import LinkedText from '../tasks/linkedText/LinkedText';

export default function QuestionAnswer({ question, onScoreChange }) {
  const [status, setStatus] = useState(question.questionAnswer?.score ? 'saved' : 'normal');

  const { value, onChange } = useDelay(updateQuestionScore, 2000, question.questionAnswer?.score);
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

  return (
    <View style={styles.questionContainer}>
      <View>
        <LinkedText text={question.questionVariant.formulation} textStyle={styles.questionFormulation} />
        <Text style={styles.answerLabel}>Ответ ученика:</Text>
        {question.questionAnswer?.content && <Text>{question.questionAnswer.content}</Text>}
        {!question.questionAnswer?.content && <Text style={styles.noAnswer}>{'Ответ отсутствует.'}</Text>}
      </View>
      <View style={styles.questionScoreContainer}>
        <Text>Балл:</Text>
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
          <Text style={styles.noAnswerScore}>0 из {question.questionVariant.questionMaxScore}</Text>
        )}
      </View>
    </View>
  );
}

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
});
