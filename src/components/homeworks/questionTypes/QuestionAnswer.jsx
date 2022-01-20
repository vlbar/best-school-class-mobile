import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import LinkedText from '../../tasks/linkedText/LinkedText';
import TestQuestionAnswer from './TestQuestionAnswer';
import TextQuestionAnswer from './TextQuestionAnswer';

const TEXT_QUESTION = 'TEXT_QUESTION';
const TEST_QUESTION = 'TEST_QUESTION';

export const questionTypeInputs = [
  { type: TEXT_QUESTION, component: TextQuestionAnswer },
  { type: TEST_QUESTION, component: TestQuestionAnswer },
];

export default function QuestionAnswer({ show, question, setQuestion, progress, style }) {
  const questionRef = useRef(question);
  const questionInputs = useRef(questionTypeInputs.find(x => x.type === question.questionVariant.type)?.component);
  const QuestionInput = questionInputs.current;

  const setQuestionHandler = question => {
    updateProgress(question.questionAnswer);
    setQuestion(question);
  };

  const isAnswered = useRef(
    question.questionAnswer ? questionInputs.current.isQuestionAnswered(question.questionAnswer) : false,
  );
  const updateProgress = questionAnswer => {
    let isCurentAnaswered = questionInputs.current.isQuestionAnswered(questionAnswer);
    questionAnswer.isHasChanges = isCurentAnaswered;
    if (isAnswered.current === undefined) {
      isAnswered.current = isCurentAnaswered;
      if (isCurentAnaswered) progress.add();
    } else {
      if (isCurentAnaswered) {
        if (!isAnswered.current) progress.add();
      } else {
        if (isAnswered.current) progress.remove();
      }

      isAnswered.current = isCurentAnaswered;
    }
  };

  if (!show) return <></>;
  return (
    <View style={[{ flexGrow: 1, flexDirection: 'column', justifyContent: 'space-between' }, !show && styles.hidden]}>
      {questionRef.current.questionVariant.formulation && (
        <LinkedText text={questionRef.current.questionVariant.formulation} />
      )}
      {QuestionInput && <QuestionInput question={question} setQuestion={setQuestionHandler} style={style} />}
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    height: 0,
    overflow: 'hidden',
  },
});
