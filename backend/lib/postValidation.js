import { callOpenAiJson } from './openaiJson.js';

const createFallbackTitle = (content) =>
  content
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .slice(0, 6)
    .join(' ')
    .slice(0, 48)
    .trim();

const normalizeValidationResult = (candidate, originalContent) => {
  const success = candidate?.success === true;
  const title = typeof candidate?.title === 'string' ? candidate.title.trim() : '';
  const content = typeof candidate?.content === 'string' ? candidate.content.trim() : '';

  if (success) {
    return {
      success: true,
      title: title || createFallbackTitle(originalContent) || 'Helpful Post',
      content: 'ok',
    };
  }

  return {
    success: false,
    title: '',
    content: content || 'This post is not allowed because it is not safe or useful enough to publish.',
  };
};

const buildValidationPrompt = (content) => `
You are a strict content validator for a public mobile app feed.

Review the USER_POST and decide whether it is allowed.

DISALLOW content that is:
- nude
- sexual
- harmful
- violent
- abusive
- hateful
- misleading
- false
- unsafe
- toxic
- promotional spam

ALLOW content only if it is safe and useful.
Examples of allowed themes:
- educational
- inspirational
- moral
- exercise or fitness
- motivational
- quiz or learning related
- general positive content

IMPORTANT RULES:
- Return ONLY valid JSON.
- Do not add markdown, comments, or extra text.
- If valid, generate a short positive title.
- If invalid, explain clearly why it is not allowed.
- Keep the reason concise and user-friendly.

RESPONSE FORMAT:
For valid content:
{"success":true,"title":"Short generated title","content":"ok"}

For invalid content:
{"success":false,"title":"","content":"Reason why this post is not allowed"}

USER_POST:
${JSON.stringify(content)}
`;

export const validatePostContent = async (rawContent) => {
  const content = typeof rawContent === 'string' ? rawContent.trim() : '';
  console.log('[postValidation] Starting validation', {
    contentLength: content.length,
    preview: content.slice(0, 80),
  });

  if (!content) {
    return {
      success: false,
      title: '',
      content: 'Write a post before submitting.',
    };
  }

  if (content.length < 12) {
    return {
      success: false,
      title: '',
      content: 'Please add a little more detail so the post is genuinely useful.',
    };
  }

  try {
    const parsed = await callOpenAiJson({
      label: 'Post Validation',
      input: buildValidationPrompt(content),
      model: 'gpt-5-mini',
    });

    console.log('[postValidation] OpenAI parsed payload', parsed);

    if (!parsed) {
      return {
        success: false,
        title: '',
        content: 'We could not validate this post right now. Please try again in a moment.',
      };
    }

    return normalizeValidationResult(parsed, content);
  } catch (error) {
    console.error('[postValidation] Validation request failed', error);

    return {
      success: false,
      title: '',
      content:
        error instanceof Error && error.message.trim()
          ? error.message
          : 'We could not validate this post right now. Please try again in a moment.',
    };
  }
};
