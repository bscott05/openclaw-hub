# 🦞 OpenClaw Hub

A lightweight unified reverse proxy that combines all your OpenClaw services under one port with a sleek landing page.

## What It Does

| Route | Service |
|-------|---------|
| `/` | Landing page (hub overview) |
| `/gateway` | OpenClaw Gateway Control UI (port 18789) |
| `/studio` | OpenClaw Studio — community dashboard (port 3000) |
| `/lmstudio` | LM Studio local LLM API (port 1234) |

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
PORT=8080 GATEWAY_PORT=18789 STUDIO_PORT=3000 LMSTUDIO_PORT=1234 node server.js
```

Open [http://localhost:8080](http://localhost:8080) — you'll see the hub landing page.

## Requirements

Make sure these are already running before starting the hub:

- **OpenClaw Gateway** on `:18789`
- **[OpenClaw Studio](https://github.com/grp06/openclaw-studio)** on `:3000` (community dashboard)
- **LM Studio** on `:1234` (local LLM server)

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
- [OpenClaw Studio](https://github.com/grp06/openclaw-studio) — community dashboard by [@grp06](https://github.com/grp06)
- [LM Studio](https://lmstudio.ai/) — local LLM server
