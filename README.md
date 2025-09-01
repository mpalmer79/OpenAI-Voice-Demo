# OpenAI Voice Demo Starter (Web + Node)

Minimal live audio streaming demo: browser mic → WebSocket → Node server → back to browser (loopback).
Swap the loopback with OpenAI Realtime Voice when enabled.

## Quick start
```bash
npm init -y
npm i express ws dotenv
node server.js
```
Open http://localhost:3000 and click **Start**.

## Next steps
- Replace loopback with OpenAI Realtime bridge (see TODO in `server.js`).
- Keep PII out of prompts; tag calls with correlation IDs.

## Scripts
```json
{ "type": "module" }
```
