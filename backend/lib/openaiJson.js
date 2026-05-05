import './loadBackendEnv.js';
import { OpenAI } from 'openai';

let openAiClient;

const OPENAI_MAX_RETRIES = 5;
const RETRY_DELAY_MS = 800;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createOpenAiServiceError = (message) => {
  const error = new Error(message);
  error.name = 'OpenAiServiceError';
  return error;
};

const normalizeOpenAiError = (error, label) => {
  const status = typeof error?.status === 'number' ? error.status : null;
  const code = typeof error?.code === 'string' ? error.code : '';
  const message = typeof error?.message === 'string' ? error.message : '';

  console.error(`[openaiJson] ${label} request failed`, {
    status,
    code,
    message,
  });

  if (code === 'insufficient_quota' || status === 429) {
    return createOpenAiServiceError(
      'Post validation is temporarily unavailable because the OpenAI quota has been exceeded.'
    );
  }

  if (code === 'invalid_api_key' || status === 401) {
    return createOpenAiServiceError(
      'Post validation is unavailable because the OpenAI API key is invalid or missing.'
    );
  }

  if (status && status >= 500) {
    return createOpenAiServiceError('Post validation is temporarily unavailable because the AI service is down.');
  }

  return createOpenAiServiceError(
    message || 'Post validation is temporarily unavailable because the AI service request failed.'
  );
};

const parseJsonSafely = (text, label) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    const jsonMatch = typeof text === 'string' ? text.match(/\{[\s\S]*\}/) : null;

    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (nestedError) {
        console.error(`${label} JSON parse failed after extraction:`, nestedError?.message ?? nestedError);
      }
    }

    console.error(`${label} JSON parse failed:`, typeof text === 'string' ? text.slice(0, 800) : text);
    return null;
  }
};

const getOpenAiClient = () => {
  if (!openAiClient && process.env.OPENAI_API_KEY) {
    openAiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return openAiClient;
};

export const callOpenAiJson = async ({
  input,
  label,
  model = 'gpt-5-mini',
} = {}) => {
  console.log(`[openaiJson] Starting ${label}`, {
    model,
    hasInput: Boolean(input),
    inputLength: typeof input === 'string' ? input.length : 0,
  });

  const client = getOpenAiClient();

  if (!client) {
    console.warn('OpenAI not configured');
    throw createOpenAiServiceError(
      'Post validation is unavailable because the OpenAI API key is not configured.'
    );
  }

  let lastRequestError = null;

  for (let attempt = 1; attempt <= OPENAI_MAX_RETRIES; attempt += 1) {
    try {
      console.log(`[openaiJson] ${label} attempt ${attempt} sending request`);
      const response = await client.responses.create({
        model,
        input,
      });

      const text = response?.output_text;
      console.log(`[openaiJson] ${label} attempt ${attempt} received response`, {
        outputLength: typeof text === 'string' ? text.length : 0,
      });
      const parsed = parseJsonSafely(text, label);

      if (parsed) {
        console.log(`[openaiJson] ${label} parsed successfully on attempt ${attempt}`);
        return parsed;
      }
    } catch (error) {
      lastRequestError = normalizeOpenAiError(error, `${label} attempt ${attempt}`);
    }

    if (attempt < OPENAI_MAX_RETRIES) {
      await delay(RETRY_DELAY_MS * attempt);
    }
  }

  if (lastRequestError) {
    throw lastRequestError;
  }

  console.log(`[openaiJson] ${label} exhausted retries without valid JSON`);
  return null;
};
