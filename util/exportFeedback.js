let exportSuccessListener = null;

export const setExportSuccessListener = (listener) => {
  exportSuccessListener = listener;

  return () => {
    if (exportSuccessListener === listener) {
      exportSuccessListener = null;
    }
  };
};

export const showExportSuccessModal = ({ path, title }) => {
  if (!exportSuccessListener) {
    return;
  }

  exportSuccessListener({ path, title });
};
