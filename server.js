/**
 * OpenClaw Hub — Unified Reverse Proxy
 *
 * Routes:
 *   /          → Landing page
 *   /gateway   → OpenClaw Gateway (:18789)
 *   /studio    → OpenClaw Studio (:3000)
 *   /dashboard → Bot Dashboard Enhanced (:3001)
 *   /lmstudio  → LM Studio API (:1234)
 *
 * Usage:
 *   PORT=8080 node server.js
 */

const http = require("http");
const httpProxy = require("http-proxy");

const PORT = process.env.PORT || 8080;

const TARGETS = {
  gateway:   { host: "localhost", port: process.env.GATEWAY_PORT   || 18789 },
  studio:    { host: "localhost", port: process.env.STUDIO_PORT    || 3000 },
  dashboard: { host: "localhost", port: process.env.DASHBOARD_PORT || 3001 },
  lmstudio:  { host: "localhost", port: process.env.LMSTUDIO_PORT || 1234 },
};

const proxy = httpProxy.createProxyServer({ ws: true });

proxy.on("error", (err, req, res) => {
  console.error("[proxy error]", err.message);
  if (res && !res.headersSent) {
    res.writeHead(502, { "Content-Type": "text/html" });
    res.end(`<h2>502 — upstream unavailable</h2><p>${err.message}</p><a href="/">← Back to Hub</a>`);
  }
});

const LANDING = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OpenClaw Hub — B's Command Center</title>
  <style>
    :root { --bg: #0d0d0d; --surface: #1a1a1a; --border: #2e2e2e; --accent: #e84949; --text: #f0f0f0; --muted: #888; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
    header { text-align: center; margin-bottom: 3rem; }
    header .logo { font-size: 3rem; margin-bottom: 0.5rem; }
    header h1 { font-size: 2rem; font-weight: 700; letter-spacing: -0.02em; }
    header p { color: var(--muted); margin-top: 0.5rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; width: 100%; max-width: 900px; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 2rem; text-decoration: none; color: inherit; transition: border-color 0.2s, transform 0.15s; display: flex; flex-direction: column; gap: 0.75rem; }
    .card:hover { border-color: var(--accent); transform: translateY(-2px); }
    .card .icon { font-size: 2.5rem; }
    .card h2 { font-size: 1.15rem; font-weight: 600; }
    .card p { font-size: 0.875rem; color: var(--muted); line-height: 1.5; }
    .card .tag { font-size: 0.75rem; background: #2e2e2e; border-radius: 4px; padding: 2px 8px; width: fit-content; color: var(--muted); font-family: monospace; }
    footer { margin-top: 3rem; color: var(--muted); font-size: 0.8rem; }
  </style>
</head>
<body>
  <header>
    <div class="logo">🦞</div>
    <h1>OpenClaw Hub — B's Command Center</h1>
    <p>All services, one door</p>
  </header>
  <div class="grid">
    <a class="card" href="/gateway">
      <span class="icon">⚙️</span>
      <h2>Gateway Control UI</h2>
      <p>Full OpenClaw dashboard — sessions, agents, config, channels.</p>
      <span class="tag">:18789 → /gateway</span>
    </a>
    <a class="card" href="/studio">
      <span class="icon">🖥️</span>
      <h2>OpenClaw Studio</h2>
      <p>Community dashboard — connect to Gateway, manage agents, approvals, and jobs.</p>
      <span class="tag">:3000 → /studio</span>
    </a>
    <a class="card" href="/dashboard">
      <span class="icon">📊</span>
      <h2>Bot Dashboard</h2>
      <p>Enhanced monitoring — agents, models, sessions, costs, pixel office.</p>
      <span class="tag">:3001 → /dashboard</span>
    </a>
    <a class="card" href="/lmstudio">
      <span class="icon">🧠</span>
      <h2>LM Studio</h2>
      <p>Local LLM server running Forge (Nemotron) and Qwen 3.5 9B.</p>
      <span class="tag">:1234 → /lmstudio</span>
    </a>
  </div>
  <footer>OpenClaw Hub · B's Stack · Running on port ${PORT}</footer>
</body>
</html>`;

function getTarget(url) {
  if (url.startsWith("/gateway"))   return { key: "gateway",   prefix: "/gateway" };
  if (url.startsWith("/studio"))    return { key: "studio",    prefix: "/studio" };
  if (url.startsWith("/dashboard")) return { key: "dashboard", prefix: "/dashboard" };
  if (url.startsWith("/lmstudio"))  return { key: "lmstudio",  prefix: "/lmstudio" };
  return null;
}

const server = http.createServer((req, res) => {
  const match = getTarget(req.url);

  if (!match) {
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(LANDING.replace(`${PORT}`, PORT));
  }

  // Strip prefix before forwarding
  req.url = req.url.slice(match.prefix.length) || "/";
  const t = TARGETS[match.key];
  proxy.web(req, res, { target: `http://${t.host}:${t.port}` });
});

// WebSocket support
server.on("upgrade", (req, socket, head) => {
  const match = getTarget(req.url);
  if (!match) return socket.destroy();
  req.url = req.url.slice(match.prefix.length) || "/";
  const t = TARGETS[match.key];
  proxy.ws(req, socket, head, { target: `http://${t.host}:${t.port}` });
});

server.listen(PORT, () => {
  console.log(`\n🦞 OpenClaw Hub running on http://localhost:${PORT}`);
  console.log(`   /gateway   → http://localhost:${TARGETS.gateway.port}`);
  console.log(`   /studio    → http://localhost:${TARGETS.studio.port}`);
  console.log(`   /dashboard → http://localhost:${TARGETS.dashboard.port}`);
  console.log(`   /lmstudio  → http://localhost:${TARGETS.lmstudio.port}\n`);
});
