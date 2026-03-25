# 🦞 OpenClaw Hub

A lightweight unified reverse proxy that combines all your OpenClaw services under one port with a sleek landing page.

## What It Does

| Route | Service |
|-------|---------|
| `/` | Landing page (hub overview) |
| `/studio` | OpenClaw Studio (port 3000) |
| `/dashboard` | Bot Review Dashboard (port 3001) |
| `/gateway` | OpenClaw Gateway (port 18789) |

## Stack

- **Node.js** — no framework, minimal deps
- **http-proxy** — battle-tested reverse proxy
- **WebSocket support** — proxies WS connections too

## Setup

```bash
git clone https://github.com/bscott05/openclaw-hub.git
cd openclaw-hub
npm install
```

## Usage

```bash
# Default: starts on port 8080
node server.js

# Custom port
PORT=8080 node server.js

# Custom upstream ports (if yours differ)
PORT=8080 STUDIO_PORT=3000 DASHBOARD_PORT=3001 GATEWAY_PORT=18789 node server.js
```

Open [http://localhost:8080](http://localhost:8080) — you'll see the hub landing page.

## Requirements

Make sure these are already running before starting the hub:

- **OpenClaw Studio** on `:3000` (built into OpenClaw)
- **[OpenClaw Bot Review Dashboard](https://github.com/xmanrui/OpenClaw-bot-review)** on `:3001`
- **OpenClaw Gateway** on `:18789`

## Auto-start (macOS launchd)

To run the hub automatically on login, create a launchd plist:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.openclaw.hub</string>
  <key>ProgramArguments</key>
  <array>
    <string>/opt/homebrew/bin/node</string>
    <string>/path/to/openclaw-hub/server.js</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PORT</key>
    <string>8080</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/openclaw-hub.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/openclaw-hub.err</string>
</dict>
</plist>
```

Save to `~/Library/LaunchAgents/com.openclaw.hub.plist` then:

```bash
launchctl load ~/Library/LaunchAgents/com.openclaw.hub.plist
```

## Credits

- [OpenClaw](https://github.com/openclaw/openclaw) — the agent platform
- [OpenClaw Bot Review Dashboard](https://github.com/xmanrui/OpenClaw-bot-review) — by [@xmanrui](https://github.com/xmanrui)
