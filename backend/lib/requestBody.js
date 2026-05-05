export const parseJsonRequestBody = (req) => {
  if (!req?.body) {
    return {};
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      console.error('Failed to parse request body:', error?.message ?? error);
      return {};
    }
  }

  return req.body;
};
