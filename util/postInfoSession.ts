const SESSION_FLAGS: Record<string, boolean> = {};

export const POST_INFO_MODAL_SESSION_KEY = 'postInfoModalShown';

export const hasSeenPostInfoModalInSession = () =>
  SESSION_FLAGS[POST_INFO_MODAL_SESSION_KEY] === true;

export const markPostInfoModalShownInSession = () => {
  SESSION_FLAGS[POST_INFO_MODAL_SESSION_KEY] = true;
};

export const resetPostInfoModalSessionForTesting = () => {
  delete SESSION_FLAGS[POST_INFO_MODAL_SESSION_KEY];
};
