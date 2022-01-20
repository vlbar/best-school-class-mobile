import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useTranslation } from '../../../utils/Internationalization';
import InputForm from '../../common/InputForm';

const initialAnswer = {
  content: '',
};

export const isQuestionAnswered = answer => answer.content.trim().length > 0;

function TextQuestionAnswer({ question, setQuestion, style }) {
  const { translate } = useTranslation();
  const [answer, setAnswer] = useState(question?.questionAnswer ?? initialAnswer);

  const setContent = content => setAnswer(answer => ({ ...answer, content }));

  useEffect(() => {
    setQuestion({ ...question, questionAnswer: answer });
  }, [answer]);

  return (
    <View style={{ marginTop: 10 }}>
      <InputForm
        multiline
        label={translate('homeworks.try.yourAnswer')}
        value={answer.content}
        onChange={setContent}
        style={{ marginBottom: 0 }}
      />
    </View>
  );
}

TextQuestionAnswer.isQuestionAnswered = isQuestionAnswered;
export default TextQuestionAnswer;
