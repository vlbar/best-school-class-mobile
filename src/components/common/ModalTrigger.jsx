import { useState } from 'react';

export default function ModalTrigger({ children }) {
  const [show, setShow] = useState(false);

  const open = () => setShow(true);
  const close = () => setShow(false);

  return children({ show, open, close });
}
