/**
 * OpenClaw Hub — Smart Landing Page
 *
 * Serves a landing page with direct LAN links to each service.
 * Each card opens the service directly in a new tab.
 * Includes a /status API endpoint for live port checks.
 *
 * Services:
 *   Gateway   → http://192.168.1.211:18789
 *   Studio    → http://192.168.1.211:3000
 *   Dashboard → http://192.168.1.211:3001
 *   LM Studio → http://192.168.1.211:1234
 *
 * Usage:
 *   PORT=8080 node server.js
 */

const http = require("http");
const net = require("net");

const PORT = process.env.PORT || 8080;
const LAN_IP = process.env.LAN_IP || "192.168.1.211";

const SERVICES = [
  { key: "gateway",   name: "Gateway Control UI",  icon: "⚙️",  port: 18789, desc: "Full OpenClaw dashboard — sessions, agents, config, channels." },
  { key: "studio",    name: "OpenClaw Studio",      icon: "🖥️",  port: 3000,  desc: "Community dashboard — connect to Gateway, manage agents, approvals, and jobs." },
  { key: "dashboard", name: "Bot Dashboard",        icon: "📊",  port: 3001,  desc: "Enhanced monitoring — agents, models, sessions, costs, pixel office." },
  { key: "lmstudio",  name: "LM Studio",            icon: "🧠",  port: 1234,  desc: "Local LLM server running Forge (Nemotron) and Qwen 3.5 9B." },
];

/** Check if a TCP port is open (resolves true/false) */
function checkPort(port, host = "127.0.0.1", timeoutMs = 1500) {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    sock.setTimeout(timeoutMs);
    sock.once("connect", () => { sock.destroy(); resolve(true); });
    sock.once("timeout", () => { sock.destroy(); resolve(false); });
    sock.once("error",   () => { sock.destroy(); resolve(false); });
    sock.connect(port, host);
  });
}

/** Check all services, return { key: boolean } map */
async function checkAllServices() {
  const results = {};
  await Promise.all(
    SERVICES.map(async (s) => {
      results[s.key] = await checkPort(s.port);
    })
  );
  return results;
}

function buildLanding(statusMap) {
  const cards = SERVICES.map((s) => {
    const up = statusMap[s.key];
    const dot = up
      ? '<span class="dot up" title="Online">●</span>'
      : '<span class="dot down" title="Offline">●</span>';
    const url = `http://${LAN_IP}:${s.port}`;
    return `
    <a class="card" href="${url}" target="_blank" rel="noopener">
      <div class="card-header">
        <span class="icon">${s.icon}</span>
        ${dot}
      </div>
      <h2>${s.name}</h2>
      <p>${s.desc}</p>
      <span class="tag">:${s.port}</span>
    </a>`;
  }).join("\n");

  return `<!DOCTYPE html>
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
    .card .card-header { display: flex; justify-content: space-between; align-items: center; }
    .card .icon { font-size: 2.5rem; }
    .card h2 { font-size: 1.15rem; font-weight: 600; }
    .card p { font-size: 0.875rem; color: var(--muted); line-height: 1.5; }
    .card .tag { font-size: 0.75rem; background: #2e2e2e; border-radius: 4px; padding: 2px 8px; width: fit-content; color: var(--muted); font-family: monospace; }
    .dot { font-size: 1.2rem; }
    .dot.up { color: #22c55e; }
    .dot.down { color: #ef4444; }
    footer { margin-top: 3rem; color: var(--muted); font-size: 0.8rem; }
  </style>
</head>
<body>
  <header>
    <div class="logo">🦞</div>
    <h1>OpenClaw Hub — B's Command Center</h1>
    <p>All services, one door · opens each in a new tab</p>
  </header>
  <div class="grid">
    ${cards}
  </div>
  <footer>OpenClaw Hub · B's Stack · Running on port ${PORT}</footer>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  // API endpoint for status checks (useful for client-side refresh)
  if (req.url === "/status") {
    const status = await checkAllServices();
    res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
    return res.end(JSON.stringify(status));
  }

  // Everything else → landing page
  const status = await checkAllServices();
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(buildLanding(status));
});

server.listen(PORT, () => {
  console.log(`\n🦞 OpenClaw Hub running on http://localhost:${PORT}`);
  console.log(`   LAN IP: ${LAN_IP}`);
  SERVICES.forEach((s) => {
    console.log(`   ${s.name} → http://${LAN_IP}:${s.port}`);
  });
  console.log();
});
