# DailyQuizz Backend

This backend generates quiz data in Firestore and sends push notifications through Firebase Messaging.

## What It Does

- Generates and stores quiz data for:
  - Current Affairs
  - Tricky Questions
  - General Knowledge
  - English Quiz
- Sends push notifications to users
- Supports both automatic Vercel cron jobs and manual browser hits

## API Routes

### `GET /api/cron`

Generates all quiz data and stores it in Firestore.

- Used by the 11:55 PM cron job
- Does not send notifications

### `GET /api/notify`

Sends notifications only.

- Used by the morning and evening cron jobs
- Also safe to hit manually from the browser

## Cron Schedule

All cron schedules in Vercel use UTC.

### Quiz generation

- `11:55 PM IST` = `25 18 * * *` UTC
- Route: `/api/cron`

### Notification only

- `8:00 AM IST` = `30 2 * * *` UTC
- `2:30 PM IST` = `0 9 * * *` UTC
- `9:00 PM IST` = `30 15 * * *` UTC
- Route: `/api/notify`

## Manual URLs

Replace `your-domain.vercel.app` with your deployed Vercel domain.

### Generate quiz data manually

```text
https://your-domain.vercel.app/api/cron?secret=YOUR_CRON_SECRET
```

### Send notifications manually

```text
https://your-domain.vercel.app/api/notify?secret=YOUR_CRON_SECRET
```

## Required Environment Variables

Set these in Vercel and locally:

- `OPENAI_API_KEY`
- `NEWS_API_KEY`
- `CRON_SECRET`
- `FIREBASE_SERVICE_ACCOUNT`

## Local Development

Inside the `backend` folder:

```bash
npm install
```

To test the quiz generation script locally:

```bash
npm run start
```

## Important Notes

- Keep `CRON_SECRET` private.
- Vercel cron uses UTC, so keep timezone conversion in mind.
- Quiz generation and notifications are intentionally split so the 11:55 PM job updates Firestore without sending push notifications.

