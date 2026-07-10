// Custom server wrapping Next.js — a persistent Node process (not serverless).
// This is the home for the background alert-checking loop and the SSE stream
// for GET /api/alerts/stream, both of which need a long-lived, single-process
// broadcast registry that a stateless Next API route handler can't provide.
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { sseHub } from './lib/sseHub.js';
import { startAlertEngine } from './lib/alertEngine.js';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    if (parsedUrl.pathname === '/api/alerts/stream' && req.method === 'GET') {
      sseHub.handleConnection(req, res);
      return;
    }
    handle(req, res, parsedUrl);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port} (${dev ? 'dev' : 'prod'})`);
    startAlertEngine();
  });
});
