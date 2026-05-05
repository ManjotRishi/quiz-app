import admin from 'firebase-admin';
import { POST_COLLECTION } from '../lib/collections.js';
import { getFirestoreDb } from '../lib/firebaseAdmin.js';
import { parseJsonRequestBody } from '../lib/requestBody.js';

const normalizeCount = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);
const normalizeReaction = (value) => {
  const normalizedValue = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return normalizedValue === 'like' || normalizedValue === 'dislike' ? normalizedValue : null;
};
const normalizeReactionMap = (value) => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.entries(value).reduce((result, [key, reactionValue]) => {
    const normalizedKey = normalizeActorId(key);
    const normalizedReactionValue = normalizeReaction(reactionValue);

    if (normalizedKey && normalizedReactionValue) {
      result[normalizedKey] = normalizedReactionValue;
    }

    return result;
  }, {});
};
const countReactions = (reactions) =>
  Object.values(reactions).reduce(
    (result, reactionValue) => {
      if (reactionValue === 'like') {
        result.likeCount += 1;
      } else if (reactionValue === 'dislike') {
        result.dislikeCount += 1;
      }

      return result;
    },
    {
      likeCount: 0,
      dislikeCount: 0,
    }
  );
const normalizeActorId = (value) =>
  typeof value === 'string'
    ? value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
    : '';

export default async function handler(req, res) {
  console.log('[updatePostReaction] Incoming request', {
    method: req?.method,
    hasBody: Boolean(req?.body),
  });

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      content: 'Method not allowed',
      likeCount: 0,
      dislikeCount: 0,
      viewerReaction: null,
    });
  }

  try {
    const payload = parseJsonRequestBody(req);
    const postId = typeof payload?.postId === 'string' ? payload.postId.trim() : '';
    const rawReaction = payload?.reaction;
    const reaction = normalizeReaction(rawReaction);
    const actorId = normalizeActorId(payload?.actorId);
    const hasExplicitReactionValue =
      typeof rawReaction === 'string' || rawReaction === null;
    const hasInvalidReactionValue = typeof rawReaction === 'string' && !reaction;

    console.log('[updatePostReaction] Parsed request body', {
      postId,
      reaction,
      actorId,
    });

    if (!postId) {
      return res.status(400).json({
        success: false,
        content: 'Post id is required.',
        likeCount: 0,
        dislikeCount: 0,
        viewerReaction: null,
      });
    }

    if (!actorId) {
      return res.status(400).json({
        success: false,
        content: 'Actor id is required.',
        likeCount: 0,
        dislikeCount: 0,
        viewerReaction: null,
      });
    }

    if (!hasExplicitReactionValue || hasInvalidReactionValue) {
      return res.status(400).json({
        success: false,
        content: 'Reaction must be like, dislike, or null.',
        likeCount: 0,
        dislikeCount: 0,
        viewerReaction: null,
      });
    }

    const db = getFirestoreDb();
    const postRef = db.collection(POST_COLLECTION).doc(postId);

    const reactionResult = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(postRef);

      if (!snapshot.exists) {
        throw new Error('POST_NOT_FOUND');
      }

      const data = snapshot.data() ?? {};
      const currentReactions = normalizeReactionMap(data.reactions);
      const previousReaction = normalizeReaction(currentReactions[actorId]);

      if (previousReaction === reaction) {
        const currentCounts = countReactions(currentReactions);

        return {
          likeCount: currentCounts.likeCount,
          dislikeCount: currentCounts.dislikeCount,
          viewerReaction: reaction,
        };
      }

      const nextReactions = {
        ...currentReactions,
      };

      if (reaction) {
        nextReactions[actorId] = reaction;
      } else {
        delete nextReactions[actorId];
      }

      const nextCounts = countReactions(nextReactions);
      const updatePayload = {
        reactions: nextReactions,
        likeCount: normalizeCount(nextCounts.likeCount),
        dislikeCount: normalizeCount(nextCounts.dislikeCount),
        lastReactionAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      transaction.update(postRef, updatePayload);

      return {
        likeCount: nextCounts.likeCount,
        dislikeCount: nextCounts.dislikeCount,
        viewerReaction: reaction,
      };
    });

    console.log('[updatePostReaction] Reaction saved', {
      postId,
      reaction,
      ...reactionResult,
    });

    return res.status(200).json({
      success: true,
      content: 'ok',
      ...reactionResult,
    });
  } catch (error) {
    console.error('[updatePostReaction] Handler error:', error);

    if (error instanceof Error && error.message === 'POST_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        content: 'Post not found.',
        likeCount: 0,
        dislikeCount: 0,
        viewerReaction: null,
      });
    }

    return res.status(500).json({
      success: false,
      content: 'Unable to update the reaction right now. Please try again.',
      likeCount: 0,
      dislikeCount: 0,
      viewerReaction: null,
    });
  }
}
