let toastListener = null;

export const setToastListener = (listener) => {
  toastListener = listener;

  return () => {
    if (toastListener === listener) {
      toastListener = null;
    }
  };
};

export const showToast = ({ title, message = '', type = 'success' }) => {
  if (!toastListener) {
    return;
  }

  toastListener({ title, message, type });
};
