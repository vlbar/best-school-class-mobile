import React, { useState, useEffect, useContext } from 'react';

import Color from '../constants';
import InputForm from '../components/common/InputForm';
import Text from '../components/common/Text';

/*
    fieldName: [
        type:      string/number/array/object,    (default is string)
        of:        {}                             (only for array type (of object is cuming ♂️😜♂️ uwu)))0)0))0
        required:  [Message] or [false],
        nullable:  boolean
        trim:      boolean,                       (default is true)
        min:       [minValue, Message],
        max:       [maxValue, Message],
        custom:    { name: [callback(field, object), Message], ... }
    ]

    TODO:
    1. rework validation of nested fields when validate one
    2. add async validate
*/

export const STRING_TYPE = 'STRING';
export const NUMBER_TYPE = 'NUMBER';
export const ARRAY_TYPE = 'ARRAY';
export const OBJECT_TYPE = 'OBJECT';

export default function useBestValidation(validationSchema, onChangeValidCallback) {
  const [isValid, setIsValid] = useState(true);
  const [isTouchedList, setIsTouchedList] = useState([]);
  const [errors, setErrors] = useState({});

  const addToTouchList = value => {
    if (isTouchedList.includes(value)) return;
    let targetIsTouchedList = isTouchedList;
    targetIsTouchedList.push(value);
    setIsTouchedList(targetIsTouchedList);
  };

  const isTouched = value => isTouchedList.includes(value);

  useEffect(() => {
    if (validationSchema === undefined) {
      console.error('Best Validation Schema (Best Scheme Checker) in required');
    }
  }, [validationSchema]);

  useEffect(() => {
    onChangeValidCallback?.(isValid);
  }, [isValid]);

  // EVENTS
  function blurHandle(name, value) {
    if (name.length === 0) {
      console.error('Input name is required for validation!');
      return;
    }

    let error = validateField(name, value, pathToSchema(name, validationSchema));

    let currentErrors = errors;
    if (error) currentErrors[name] = error;
    else delete currentErrors[name];

    addToTouchList(name);
    setErrors(currentErrors);
    setIsValid(isEmpty(currentErrors));
  }

  function changeHandle(name, value) {
    if (isTouched(name)) {
      let error = validateField(name, value, pathToSchema(name, validationSchema));

      let currentErrors = errors;
      if (error) currentErrors[name] = error;
      else delete currentErrors[name];

      setErrors(currentErrors);
      setIsValid(isEmpty(currentErrors));
    }
  }

  // FUNCTIONS
  function validate(obj) {
    if (obj === undefined) {
      console.error('Object to validate is undefined');
      return;
    }

    setIsTouchedList([]);
    let currentErrors = {};
    const addErrorIfExists = (name, error) => {
      if (error) currentErrors[name] = error;
    };

    const validationSchemaFields = Object.getOwnPropertyNames(validationSchema);
    const validateFields = Object.getOwnPropertyNames(obj);
    validateFields.forEach(x => {
      if (validationSchemaFields.includes(x)) {
        addToTouchList(x);
        addErrorIfExists(x, validateField(x, obj[x], validationSchema, addErrorIfExists));
      }
    });

    setErrors(currentErrors);
    setIsValid(isEmpty(currentErrors));
    return isEmpty(currentErrors);
  }

  const validateField = (fieldPath, value, validationSchema, addErrorCallback) => {
    let fieldName = getFieldName(fieldPath);
    if (validationSchema[fieldName] === undefined) {
      return undefined;
    }

    switch (validationSchema[fieldName].type.toUpperCase()) {
      case STRING_TYPE:
        return validateString(value, fieldPath, validationSchema);
      case NUMBER_TYPE:
        return validateNumber(value, fieldPath, validationSchema);
      case ARRAY_TYPE:
        if (validationSchema[fieldName].of && addErrorCallback)
          forEachValidateField([...value], fieldPath, validationSchema[fieldName].of, addErrorCallback);
        return validateArray([...value], fieldPath, validationSchema);
      case OBJECT_TYPE:
        return validateObject(value, fieldPath, validationSchema);
      default:
        return undefined;
    }
  };

  // ARRAY ITEMS VALIDATION
  function forEachValidateField(array, arrayName, validationSchema, addErrorCallback) {
    let validationSchemaFields = Object.getOwnPropertyNames(validationSchema);
    array.forEach((item, index) => {
      let validateFields = Object.getOwnPropertyNames(item);
      validateFields.forEach(x => {
        if (validationSchemaFields.includes(x)) {
          addToTouchList(`${arrayName}[${index}].${x}`);
          addErrorCallback(
            `${arrayName}[${index}].${x}`,
            validateField(`${arrayName}[${index}].${x}`, item[x], validationSchema, addErrorCallback),
          );
        }
      });
    });
  }

  // TYPES
  function validateString(value, fieldPath, validationSchema) {
    let fieldSchema = validationSchema[getFieldName(fieldPath)];
    if (!fieldSchema.trim || fieldSchema.trim !== false) value = value.trim();
    return validateType(
      value,
      fieldPath,
      validationSchema,
      x => x > value.length,
      x => x < value.length,
    );
  }

  function validateNumber(value, fieldPath, validationSchema) {
    return validateType(
      value,
      fieldPath,
      validationSchema,
      x => x > value,
      x => x < value,
    );
  }

  function validateArray(value, fieldPath, validationSchema) {
    return validateType(
      value,
      fieldPath,
      validationSchema,
      x => x > value.length,
      x => x < value.length,
    );
  }

  function validateObject(value, fieldPath, validationSchema) {
    let fieldName = getFieldName(fieldPath);
    let fieldSchema = validationSchema[fieldName];

    if (!requiredCheck(value, fieldSchema)) return fieldSchema.required[0];
  }

  // GENERIC TYPE VALIDATION
  function validateType(value, fieldPath, validationSchema, minPred, maxPred) {
    let fieldName = getFieldName(fieldPath);
    let fieldSchema = validationSchema[fieldName];

    if (fieldSchema.nullable && (value == null || value?.length == 0)) return undefined;

    if (!requiredCheck(value, fieldSchema)) return fieldSchema.required[0];
    if (fieldSchema.min && !valueCheck(minPred, fieldSchema.min[0])) return fieldSchema.min[1];
    if (fieldSchema.max && !valueCheck(maxPred, fieldSchema.max[0])) return fieldSchema.max[1];

    if (fieldSchema.custom) {
      const message = validateCustom(value, fieldSchema.custom);
      if (message) return message;
    }

    return undefined;
  }

  function validateCustom(value, customScheme) {
    const customRules = Object.getOwnPropertyNames(customScheme);
    for (const rule of customRules) if (customScheme[rule][0]?.(value) === false) return customScheme[rule][1];
    return undefined;
  }

  function requiredCheck(value, fieldSchema) {
    if (fieldSchema.required && fieldSchema.required[0] !== false && (value === undefined || value.length === 0)) {
      return false;
    }
    return true;
  }

  function valueCheck(strategy, value) {
    if (value !== undefined) {
      if (strategy(value)) {
        return false;
      }
    }
    return true;
  }

  function reset() {
    setErrors({});
    setIsTouchedList([]);
    setIsValid(undefined);
  }

  return {
    changeHandle,
    blurHandle,
    validate,
    reset,
    isValid,
    errors,
  };
}

// COMPONENTS
const ValidationContext = React.createContext();
const BestValidationContext = ({ children, validation, entity }) => {
  return <ValidationContext.Provider value={{ validation, entity }}>{children}</ValidationContext.Provider>;
};

const BestValidationField = ({ name, onChange, onEndEditing, hideErrorMessage = false, ...props }) => {
  const context = useContext(ValidationContext);
  return (
    <InputForm
      value={String(context?.entity?.[name] ?? '')}
      onChange={value => {
        context?.validation.changeHandle(name, value);
        onChange?.(value);
      }}
      errorMessage={hideErrorMessage === false && context?.validation.errors[name]}
      onEndEditing={e => {
        context?.validation.blurHandle(name, e.nativeEvent.text);
        onEndEditing?.(e.nativeEvent.text);
      }}
      {...props}
    />
  );
};

const BestValidationErrorMessage = ({ name, ...props }) => {
  const context = useContext(ValidationContext);
  const styles = {
    color: Color.danger,
    fontSize: 14,
    marginBottom: 10,
  };

  if (!context?.validation.errors[name]) return <></>;
  return (
    <Text style={styles} {...props}>
      {context?.validation.errors[name]}
    </Text>
  );
};

const BestValidation = BestValidationContext;
BestValidation.Context = BestValidationContext;
BestValidation.InputForm = BestValidationField;
BestValidation.ErrorMessage = BestValidationErrorMessage;
export { BestValidation };

// OTHER UTIL
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function getFieldName(path) {
  let lastPointIndex = path.lastIndexOf('.') + 1;
  if (lastPointIndex > 0) return path.substring(lastPointIndex);
  else return path;
}

function pathToSchema(path, schema) {
  let newSchema = schema;
  let chagedPath = path;
  while (chagedPath.indexOf('[') > 0) {
    let firstIndex = chagedPath.indexOf('[');
    if (firstIndex > 0) {
      let firstCloseIndex = chagedPath.indexOf(']');
      if (firstCloseIndex > 0) {
        let name = chagedPath.substring(0, firstIndex);
        newSchema = newSchema[name].of;
        chagedPath = chagedPath.substring(firstCloseIndex + 2);
      }
    }
  }

  return newSchema;
}
