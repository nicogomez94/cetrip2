import { useCallback, useState } from 'react';

const INITIAL_TOAST = {
  id: 0,
  visible: false,
  type: 'success',
  message: '',
};

function useToast() {
  const [toast, setToast] = useState(INITIAL_TOAST);

  const showToast = useCallback((type, message) => {
    setToast((prev) => ({
      id: prev.id + 1,
      visible: true,
      type,
      message,
    }));
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
}

export default useToast;
