import { capitalizeFirstLetter } from '../../utils/TextUtils';

export class AnswerStatus {
  constructor(name, icon, evaluated) {
    this.name = name;
    this.key = getFullKey(mapToKey(name));
    this.icon = icon;
    this.evaluated = evaluated;
  }
}

export const types = {
  NOT_PERFORMED: new AnswerStatus('NOT_PERFORMED', 'ellipsis-horizontal-outline', false),
  PERFORMED: new AnswerStatus('PERFORMED', 'checkmark-outline', false),
  APPRECIATED: new AnswerStatus('APPRECIATED', 'shield-checkmark-outline', true),
  RETURNED: new AnswerStatus('RETURNED', 'refresh-outline', true),
  NOT_APPRECIATED: new AnswerStatus('NOT_APPRECIATED', 'close-outline', true),
};

const keyPrefix = 'taskAnswer.types';

function getFullKey(keyPostfix) {
  return `${keyPrefix}.${keyPostfix}`;
}

function mapToKey(key) {
  return key.split('_').map((word, index) => {
    word.toLowerCase();
    if (index > 0) capitalizeFirstLetter(word);
    return word;
  });
}
