import { sendNotifications } from './generateQuiz.js';

export default async function handler(req, res) {
  try {
    const headerSecret = req.headers?.authorization?.replace(/^Bearer\s+/i, '');
    const querySecret = req.query?.secret;
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || (headerSecret !== expectedSecret && querySecret !== expectedSecret)) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const result = await sendNotifications();

    return res.status(200).json({
      success: true,
      message: 'Notifications sent',
      result,
    });
  } catch (error) {
    console.error('Notify handler error:', error);
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
}
