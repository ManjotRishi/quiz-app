import admin from 'firebase-admin';
import { POST_COLLECTION } from '../lib/collections.js';
import { getFirestoreDb } from '../lib/firebaseAdmin.js';
import { validatePostContent } from '../lib/postValidation.js';
import { parseJsonRequestBody } from '../lib/requestBody.js';

export const maxDuration = 60;
const VALIDATION_TIMEOUT_MS = 55000;
const USER_DEVICE_TOKENS_COLLECTION = 'USER_DEV_TOKENS';

const saveApprovedPost = async ({ title, body, authorName, authorId }) => {
  const db = getFirestoreDb();

  console.log('[validatePost] Saving approved post', {
    title,
    authorName,
    authorId,
    bodyLength: body.length,
    collection: POST_COLLECTION,
  });

  const docRef = await db.collection(POST_COLLECTION).add({
    title,
    body,
    authorName,
    authorId,
    likeCount: 0,
    dislikeCount: 0,
    reactions: {},
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    id: docRef.id,
    title,
    body,
    authorName,
    authorId,
  };
};

const toTitleCase = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const buildPostPublishNotificationPayload = ({ authorName, postTitle }) => {
  const normalizedAuthorName = String(authorName ?? '').trim() || 'Learner';
  const normalizedTitle = toTitleCase(postTitle) || 'Helpful Post';

  return {
    showRewardAd: true,
    notification: {
      title: `${normalizedAuthorName} has published a post`,
      body: normalizedTitle,
    },
  };
};

const sendPostPublishNotification = async ({ authorName, postTitle, postId }) => {
  const db = getFirestoreDb();
  const snapshot = await db.collection(USER_DEVICE_TOKENS_COLLECTION).get();
  const tokenSet = new Set();
  const tokens = [];

  snapshot.forEach((doc) => {
    const token = typeof doc.data()?.token === 'string' ? doc.data().token.trim() : '';

    if (!token || tokenSet.has(token)) {
      return;
    }

    tokenSet.add(token);
    tokens.push(token);
  });

  if (!tokens.length) {
    console.warn('[validatePost] No notification tokens available for post publish notification');
    return {
      successCount: 0,
      failureCount: 0,
    };
  }

  const notificationPayload = buildPostPublishNotificationPayload({
    authorName,
    postTitle,
  });

  const response = await admin.messaging().sendEachForMulticast({
    notification: notificationPayload.notification,
    data: {
      type: 'POST_PUBLISHED',
      postId: String(postId ?? ''),
      authorName: String(authorName ?? '').trim(),
      postTitle: notificationPayload.notification.body,
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'quiz_channel_heads_up_v6',
        sound: 'default',
        priority: 'high',
        visibility: 'public',
      },
    },
    apns: {
      headers: {
        'apns-priority': '10',
      },
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
    tokens,
  });

  const failureReasons = response.responses
    .map((item, index) =>
      item.success
        ? null
        : {
            token: tokens[index],
            errorCode: item.error?.code ?? 'unknown',
            errorMessage: item.error?.message ?? 'Unknown error',
          }
    )
    .filter(Boolean);

  console.log('[validatePost] Post publish notification result', {
    postId,
    successCount: response.successCount,
    failureCount: response.failureCount,
    failureReasons,
  });

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    failureReasons,
  };
};

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Validation timed out after ${ms}ms`)), ms);
    }),
  ]);

export default async function handler(req, res) {
  console.log('[validatePost] Incoming request', {
    method: req?.method,
    hasBody: Boolean(req?.body),
  });

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      title: '',
      content: 'Method not allowed',
    });
  }

  try {
    const payload = parseJsonRequestBody(req);
    const postContent =
      typeof payload?.content === 'string'
        ? payload.content
        : typeof payload?.post === 'string'
          ? payload.post
          : '';
    const authorName =
      typeof payload?.authorName === 'string' && payload.authorName.trim()
        ? payload.authorName.trim()
        : 'Learner';
    const authorId =
      typeof payload?.authorId === 'string' && payload.authorId.trim()
        ? payload.authorId.trim()
        : '';

    console.log('[validatePost] Parsed request body', {
      contentLength: postContent.trim().length,
      preview: postContent.trim().slice(0, 80),
      authorName,
      hasAuthorId: Boolean(authorId),
    });

    if (!authorId) {
      return res.status(400).json({
        success: false,
        title: '',
        content: 'Unable to identify the author of this post.',
      });
    }

    const validationResult = await withTimeout(validatePostContent(postContent), VALIDATION_TIMEOUT_MS);
    console.log('[validatePost] Validation result', validationResult);

    if (validationResult.success) {
      const savedPost = await saveApprovedPost({
        title: validationResult.title,
        body: postContent.trim(),
        authorName,
        authorId,
      });
      console.log('[validatePost] Post saved successfully');

      const publishPayload = buildPostPublishNotificationPayload({
        authorName,
        postTitle: validationResult.title,
      });

      let notificationResult = {
        successCount: 0,
        failureCount: 0,
        failureReasons: [],
      };

      try {
        notificationResult = await sendPostPublishNotification({
          authorName,
          postTitle: validationResult.title,
          postId: savedPost.id,
        });
      } catch (error) {
        console.warn('[validatePost] Failed to send post publish notification:', error);
      }

      return res.status(200).json({
        ...validationResult,
        postId: savedPost.id,
        showRewardAd: publishPayload.showRewardAd,
        notification: publishPayload.notification,
        notificationResult,
      });
    }

    return res.status(200).json(validationResult);
  } catch (error) {
    console.error('Validate post handler error:', error);
    return res.status(500).json({
      success: false,
      title: '',
      content:
        error instanceof Error && error.message.includes('timed out')
          ? 'Post validation took too long. Please try again in a moment.'
          : 'Unable to validate and publish this post right now. Please try again.',
    });
  }
}
