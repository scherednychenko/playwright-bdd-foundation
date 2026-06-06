// Zero-dependency static + tiny JSON API server for the bundled demo app.
// Playwright's `webServer` boots this so the E2E suite is self-contained:
// no external BASE_URL, no internet access required.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), 'public');
const port = Number(process.env.PORT) || 3000;

// Catalog the /search page queries against. Static on purpose — the point of
// the demo is deterministic tests, not a real backend.
const CATALOG = [
  'Dashboard',
  'Reports',
  'Settings',
  'Notifications',
  'Billing',
  'Profile',
  'Appointments',
  'Messages',
];

// Map a request path to a file inside ./public. Clean URLs like `/about`
// resolve to `about.html`; `/` resolves to `index.html`.
function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0].split('#')[0]));
  if (clean.includes('..')) return null; // guard against path traversal
  if (clean === '/' || clean === '') return join(root, 'index.html');
  if (clean.endsWith('.html')) return join(root, clean);
  return join(root, `${clean.replace(/\/$/, '')}.html`);
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${port}`);

  // JSON API consumed by the /search page (and stubbed in the resilience test).
  if (url.pathname === '/api/search') {
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const results = q ? CATALOG.filter((item) => item.toLowerCase().includes(q)) : [];
    sendJson(res, 200, { query: q, results });
    return;
  }

  const file = resolveFile(url.pathname);
  if (!file) {
    res.writeHead(400).end('Bad request');
    return;
  }

  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }).end('<h1>404</h1>');
  }
});

server.listen(port, () => {
  console.log(`demo app listening on http://localhost:${port}`);
});
