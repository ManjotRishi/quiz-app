import http from 'http';
import { pathToFileURL } from 'url';
import cronHandler from './api/cron.js';
import healthHandler from './api/health.js';
import notifyHandler from './api/notify.js';
import validatePostHandler from './api/validatePost.js';

const DEFAULT_PORT = 3000;

const routeHandlers = {
  '/api/health': healthHandler,
  '/api/cron': cronHandler,
  '/api/notify': notifyHandler,
  '/api/validatePost': validatePostHandler,
};

const readRequestBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });

    req.on('error', reject);
  });

const createVercelStyleResponse = (res) => {
  let statusCode = 200;

  return {
    setHeader: (name, value) => {
      res.setHeader(name, value);
    },
    status: (code) => {
      statusCode = code;
      return {
        json: (payload) => {
          res.statusCode = statusCode;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(payload));
        },
        send: (payload) => {
          res.statusCode = statusCode;
          res.end(payload);
        },
      };
    },
    json: (payload) => {
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(payload));
    },
    send: (payload) => {
      res.statusCode = statusCode;
      res.end(payload);
    },
  };
};

const createServer = () =>
  http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url ?? '/', 'http://127.0.0.1');
    const routePath = requestUrl.pathname;
    const handler = routeHandlers[routePath];

    console.log('[devServer] Incoming request', {
      method: req.method,
      routePath,
      search: requestUrl.search,
    });

    if (!handler) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Route not found' }));
      return;
    }

    try {
      const rawBody = await readRequestBody(req);
      const contentType = String(req.headers['content-type'] ?? '').toLowerCase();
      let parsedBody = rawBody;

      if (rawBody && contentType.includes('application/json')) {
        try {
          parsedBody = JSON.parse(rawBody);
        } catch (error) {
          console.error('[devServer] Failed to parse JSON body', error);
        }
      }

      const vercelStyleReq = {
        method: req.method,
        headers: req.headers,
        query: Object.fromEntries(requestUrl.searchParams.entries()),
        body: parsedBody,
        url: req.url,
      };
      const vercelStyleRes = createVercelStyleResponse(res);

      await handler(vercelStyleReq, vercelStyleRes);
    } catch (error) {
      console.error('[devServer] Request handling failed', error);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
      }
      if (!res.writableEnded) {
        res.end(JSON.stringify({ success: false, message: 'Internal dev server error' }));
      }
    }
  });

export const startDevServer = ({ port = DEFAULT_PORT } = {}) => {
  const server = createServer();

  server.listen(port, '0.0.0.0', () => {
    console.log(`[devServer] Backend dev server listening on http://0.0.0.0:${port}`);
    console.log('[devServer] Available routes: /api/health, /api/validatePost, /api/cron, /api/notify');
  });

  return server;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  startDevServer({ port });
}
