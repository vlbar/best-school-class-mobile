import React, { useState } from 'react';
import { useCallback } from 'react';

export default function ModalTrigger({
  children,
  modal,
  openTriggerProp = 'onPress',
  closeTriggerProp = 'onClose',
}) {
  const [show, setShow] = useState(false);

  const memoModal = useCallback(() => {
    return React.cloneElement(modal, {
      [closeTriggerProp]: () => setShow(false),
    });
  }, [modal]);
  const memoChildren = useCallback(() => {
    return React.cloneElement(children, {
      [openTriggerProp]: () => setShow(true),
    });
  }, [children]);

  return (
    <>
      {show && memoModal()}
      {memoChildren()}
    </>
  );
}
