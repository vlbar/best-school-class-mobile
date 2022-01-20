import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Check from '../../common/Check';

const initialAnswer = {
  selectedAnswerVariantsIds: [],
};

export const isQuestionAnswered = answer => answer.selectedAnswerVariantsIds.length > 0;

function TestQuestionAnswer({ question, setQuestion, style }) {
  const varinats = useRef([...question.questionVariant.testAnswerVariants])
  const [answer, setAnswer] = useState(question.questionAnswer ?? initialAnswer);

  const selectAnswer = id => {
    let selectedIds = answer.selectedAnswerVariantsIds;
    if (question.questionVariant.isMultipleAnswer) {
      if (selectedIds.includes(id)) selectedIds = selectedIds.filter(x => x !== id);
      else selectedIds = [...selectedIds, id];
    } else {
      selectedIds = [id];
    }

    setAnswer({
      ...answer,
      selectedAnswerVariantsIds: selectedIds,
    });
  };

  useEffect(() => {
    setQuestion({ ...question, questionAnswer: answer });
  }, [answer]);

  return (
    <View style={{ marginTop: 10 }}>
      {varinats.current.map(testAnswer => {
        const isChecked = answer.selectedAnswerVariantsIds?.find(x => x === testAnswer.id) != null;
        return (
          <View key={testAnswer.id} style={styles.answer}>
            <Check
              name={testAnswer.id}
              checked={isChecked}
              title={testAnswer.answer}
              type={question.questionVariant.isMultipleAnswer ? 'checkbox' : 'radio'}
              onChange={() => selectAnswer(testAnswer.id)}
              style={styles.check}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 10,
  },
  answer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  answerInput: {
    flex: 1,
  },
  check: {
    marginRight: 10,
    paddingVertical: 10,
  },
});

TestQuestionAnswer.isQuestionAnswered = isQuestionAnswered;
export default TestQuestionAnswer;
