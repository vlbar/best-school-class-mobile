import { useEffect, useRef, useState } from 'react';

export default function useDelay(handleChange, delay = 500, initValue) {
  const [value, setValue] = useState(initValue);
  const timeoutRef = useRef();

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  function onChange(newValue) {
    setValue(newValue);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => handleChange(newValue), delay);
  }

  return { value, onChange };
}
