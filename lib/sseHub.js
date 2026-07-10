// Process-wide SSE connection registry, shared by reference between
// server.js (raw HTTP handler for GET /api/alerts/stream) and
// lib/alertEngine.js (broadcasts on trigger). Kept out of Next's App Router
// so the registry survives dev-mode HMR/fast-refresh untouched.
const clients = new Set();
const HEARTBEAT_MS = 20000;

function handleConnection(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');
  clients.add(res);

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, HEARTBEAT_MS);

  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
}

function broadcast(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of clients) {
    res.write(payload);
  }
}

export const sseHub = { handleConnection, broadcast };
