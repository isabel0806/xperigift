import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, kind = 'success') => {
    setToasts((p) => [...p, { msg, kind, id: Date.now() }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  return { toasts, toast, removeToast };
}
