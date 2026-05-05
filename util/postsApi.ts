import { Platform } from 'react-native';
import {
  BACKEND_REQUEST_TIMEOUT_MS,
  CUSTOM_LOCAL_BACKEND_BASE_URL,
  DEPLOYED_BACKEND_BASE_URL,
  LOCAL_BACKEND_BASE_URLS,
} from './backendConfig';

export type PostReactionType = 'like' | 'dislike';
export type PostReactionValue = PostReactionType | null;

export type PostReactionResult = {
  success: boolean;
  content: string;
  likeCount: number;
  dislikeCount: number;
  viewerReaction: PostReactionValue;
};

type UpdateReactionPayload = {
  postId: string;
  reaction: PostReactionValue;
  actorId: string;
};

const normalizeViewerReaction = (value: unknown): PostReactionValue =>
  value === 'like' || value === 'dislike' ? value : null;

const normalizeReactionPayload = (payload: unknown): PostReactionResult => {
  const candidate = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const likeCount =
    typeof candidate.likeCount === 'number' && Number.isFinite(candidate.likeCount)
      ? candidate.likeCount
      : 0;
  const dislikeCount =
    typeof candidate.dislikeCount === 'number' && Number.isFinite(candidate.dislikeCount)
      ? candidate.dislikeCount
      : 0;
  const content = typeof candidate.content === 'string' ? candidate.content.trim() : '';

  return {
    success: candidate.success === true,
    content: content || 'Unable to update the reaction right now.',
    likeCount,
    dislikeCount,
    viewerReaction: normalizeViewerReaction(candidate.viewerReaction),
  };
};

const parseJsonSafely = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (nestedError) {
        console.log('[postsApi] JSON extraction parse failed', nestedError);
      }
    }

    return null;
  }
};

const normalizeBaseUrl = (url: string) => url.trim().replace(/\/+$/, '');

const getCandidateBaseUrls = () => {
  const candidates = new Set<string>();

  if (DEPLOYED_BACKEND_BASE_URL.trim()) {
    candidates.add(normalizeBaseUrl(DEPLOYED_BACKEND_BASE_URL));
  }

  if (CUSTOM_LOCAL_BACKEND_BASE_URL.trim()) {
    candidates.add(normalizeBaseUrl(CUSTOM_LOCAL_BACKEND_BASE_URL));
  }

  if (__DEV__) {
    LOCAL_BACKEND_BASE_URLS.forEach((url) => candidates.add(normalizeBaseUrl(url)));
  }

  return [...candidates];
};

const buildConnectionHint = () => {
  if (__DEV__) {
    return Platform.OS === 'android'
      ? 'Set DEPLOYED_BACKEND_BASE_URL in util/backendConfig.ts, or run `cd backend && npm run dev:server`. Android emulator usually needs http://10.0.2.2:3000, while a real device needs your computer IP like http://192.168.x.x:3000.'
      : 'Set DEPLOYED_BACKEND_BASE_URL in util/backendConfig.ts, or run `cd backend && npm run dev:server`. iOS simulator usually uses http://127.0.0.1:3000, while a real device needs your computer IP like http://192.168.x.x:3000.';
  }

  return 'Set a real deployed backend URL in util/backendConfig.ts before using post reactions in production.';
};

const requestBackendJson = async <T>({
  endpoint,
  body,
  normalize,
  logLabel,
}: {
  endpoint: string;
  body: Record<string, unknown>;
  normalize: (payload: unknown) => T;
  logLabel: string;
}): Promise<T> => {
  const candidateBaseUrls = getCandidateBaseUrls();

  console.log(`[postsApi] Starting ${logLabel}`, {
    platform: Platform.OS,
    dev: __DEV__,
    endpoint,
    candidateBaseUrls,
    body,
  });

  if (!candidateBaseUrls.length) {
    throw new Error(buildConnectionHint());
  }

  const requestErrors: string[] = [];

  for (const baseUrl of candidateBaseUrls) {
    const requestUrl = `${baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_REQUEST_TIMEOUT_MS);

    try {
      console.log(`[postsApi] Trying ${logLabel} URL`, requestUrl);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const responseText = await response.text();
      const payload = parseJsonSafely(responseText);
      const normalizedPayload = normalize(payload);

      console.log(`[postsApi] ${logLabel} response received`, {
        requestUrl,
        status: response.status,
        ok: response.ok,
        responseText,
      });

      if (!response.ok) {
        const failureMessage =
          payload && typeof payload === 'object' && typeof (payload as Record<string, unknown>).content === 'string'
            ? String((payload as Record<string, unknown>).content)
            : `Service returned HTTP ${response.status}.`;
        requestErrors.push(`${requestUrl} -> ${failureMessage}`);
        continue;
      }

      return normalizedPayload;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown network error';
      console.log(`[postsApi] ${logLabel} request failed`, {
        requestUrl,
        errorMessage,
      });
      requestErrors.push(`${requestUrl} -> ${errorMessage}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(
    `Unable to reach the post service. ${buildConnectionHint()} Debug: ${requestErrors.join(' | ')}`
  );
};

export const updatePostReactionWithBackend = async ({
  postId,
  reaction,
  actorId,
}: UpdateReactionPayload): Promise<PostReactionResult> => {
  const trimmedPostId = postId.trim();
  const trimmedActorId = actorId.trim();

  if (!trimmedPostId || !trimmedActorId) {
    return {
      success: false,
      content: 'Unable to react to this post right now.',
      likeCount: 0,
      dislikeCount: 0,
      viewerReaction: null,
    };
  }

  return requestBackendJson({
    endpoint: '/api/updatePostReaction',
    body: {
      postId: trimmedPostId,
      reaction,
      actorId: trimmedActorId,
    },
    normalize: normalizeReactionPayload,
    logLabel: 'post reaction',
  });
};
