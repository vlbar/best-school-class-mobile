import { useRef, useState } from 'react';
import Resource from '../../../utils/Hateoas/Resource';

const questionPropBlackList = ['isValid', 'selectedVariant', 'questionVariants', '_links'];
const variantPropBlackList = ['key', 'isValid', 'position', '_links'];

function useQuestionSaveManager(questionsLink, setQuestion) {
  const questionsSnapshots = useRef(new Map());

  const [isSaving, setIsSaving] = useState(false);
  const onSave = useRef([]);
  const notSaved = useRef(new Set());

  const pushToSave = id => {
    onSave.current.push(id);
    setIsSaving(onSave.current.length > 0);
  };

  const removeFromSave = id => {
    const index = onSave.current.indexOf(id);
    if (index > -1) {
      onSave.current.splice(index, 1);
    }
    setIsSaving(onSave.current.length > 0);
  };

  /**
   * @param  {Array} questions - list of new questions to manage saving
   */
  const addToManage = questions => {
    questions.forEach(question => {
      questionsSnapshots.current.set(question.key, { ...question, questionVariants: [...question.questionVariants] });
    });
  };

  const removeFromManage = question => {
    questionsSnapshots.current.delete(question.key);
  };

  const manageQuestion = question => {
    const snapshot = questionsSnapshots.current.get(question.key);
    pushToSave(question.key);

    if (!snapshot) {
      let addableQuestion = { ...question, id: null };
      questionsLink
        .post(addableQuestion)
        .then(data => {
          const newQuestion = {
            ...data,
            key: addableQuestion.key,
            questionVariants: [...addableQuestion.questionVariants],
          };

          questionsSnapshots.current.set(addableQuestion.key, newQuestion);
          setQuestion(newQuestion);
          manageVariants(newQuestion);
        })
        .catch(error => {
          console.log('Не удалось сохранить задание.', error);
        })
        .finally(() => {
          removeFromSave(question.key);
        });
    } else {
      if (!!question.isDeleted) {
        question
          .link()
          .remove()
          .then(data => {
            removeFromManage(question.key);
          })
          .catch(error => {
            console.log('Не удалось удалить задание.', error);
          })
          .finally(() => {
            removeFromSave(question.key);
          });
      } else {
        if (!isEquivalent(snapshot, question, questionPropBlackList)) {
          question
            .link()
            .put(question)
            .then(data => {
              setQuestion(question);
              questionsSnapshots.current.set(question);
              manageVariants(question);
            })
            .catch(error => {
              console.log('Не удалось сохранить задание.', error);
            })
            .finally(() => {
              removeFromSave(question.key);
            });
        } else {
          manageVariants(question);
          removeFromSave(question.key);
        }
      }
    }
  };

  const manageVariants = async question => {
    const snapshot = questionsSnapshots.current.get(question.key);
    let snapshotVariants = mapFromArray(snapshot.questionVariants, 'key');
    let questionVariants = mapFromArray(question.questionVariants, 'key');

    for (const variant of snapshot.questionVariants) {
      if (!questionVariants.get(variant.key)) {
        await Resource.of(variant)
          .link()
          .remove()
          .then(data => {
            snapshotVariants.delete(variant.key);
          })
          .catch(error => {
            console.log('Не удалось удалить вариант.', error);
          })
          .finally(() => {
            removeFromSave(variant.key);
          });
      }
    }

    let isQuestionVariantsHasChanges = false;
    for (const variant of question.questionVariants) {
      if (variant.isValid !== true) continue;
      pushToSave(variant.key);

      const variantSnapshot = snapshotVariants.get(variant.key);
      if (!variantSnapshot || !variantSnapshot.id) {
        await question
          .link('variants')
          .post(variant)
          .then(data => {
            const newVarinat = { ...data, key: variant.key };
            snapshotVariants.set(variant.key, newVarinat);
            questionVariants.set(variant.key, newVarinat);
          })
          .catch(error => {
            console.log('Не удалось сохранить вариант.', error);
          })
          .finally(() => {
            removeFromSave(variant.key);
          });
      } else {
        if (!isEquivalent(variantSnapshot, variant, [...variantPropBlackList])) {
          if (variantSnapshot.type === variant.type) {
            await Resource.of(variant)
              .link()
              .put(variant)
              .then(data => {
                snapshotVariants.set(variant.key, { ...variant, ...data, key: variant.key });
                questionVariants.set(variant.key, { ...variant, ...data, key: variant.key });
              })
              .catch(error => {
                console.log('Не удалось сохранить вариант.', error);
              })
              .finally(() => {
                removeFromSave(variant.key);
              });
          } else {
            await Resource.of(variant)
              .link()
              .remove()
              .then(async data => {
                await question
                  .link('variants')
                  .post(variant)
                  .then(data => {
                    snapshotVariants.set(variant.key, { ...data, key: variant.key });
                    questionVariants.set(variant.key, { ...data, key: variant.key });
                  })
                  .catch(error => {
                    console.log('Не удалось сохранить вариант.', error);
                  })
                  .finally(() => {
                    removeFromSave(variant.key);
                  });
              })
              .catch(error => {
                console.log('Не удалось удалить вариант для сохранения :/', error);
              });
          }
        } else {
          removeFromSave(variant.key);
          continue;
        }
      }
      isQuestionVariantsHasChanges = true;
    }

    if (isQuestionVariantsHasChanges) {
      questionsSnapshots.current.set(question.key, {
        ...question,
        questionVariants: Array.from(snapshotVariants.values()),
      });
      setQuestion({ ...question, questionVariants: Array.from(questionVariants.values()) });
    }
  };

  return {
    addToManage,
    manageQuestion,
    isSaving,
  };
}

export function isEquivalent(a, b, blackList = []) {
  if (b == undefined) return false;
  let aProps = Object.getOwnPropertyNames(a);
  let bProps = Object.getOwnPropertyNames(b);

  if (!blackList.length && aProps.length != bProps.length) {
    return false;
  }

  for (var i = 0; i < aProps.length; i++) {
    let propName = aProps[i];
    if (blackList.length && blackList.includes(propName)) continue;

    if (a[propName] instanceof Array) {
      if (a[propName].length !== b[propName].length) return false;

      for (let j = 0; j < a[propName].length; j++) {
        if (a[propName][j] instanceof Object) {
          if (!isEquivalent(a[propName][j], b[propName][j])) return false;
        } else {
          if (a[propName][j] !== b[propName][j]) return false;
        }
      }
    } else {
      if (a[propName] !== b[propName]) return false;
    }
  }

  return true;
}

const mapFromArray = (array, key = 'id') => {
  let map = new Map();
  array.forEach(x => {
    map.set(x[key], x);
  });
  return map;
};

export default useQuestionSaveManager;