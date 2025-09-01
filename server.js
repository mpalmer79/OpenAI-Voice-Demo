// server.js
import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files
app.use(express.static(path.join(process.cwd(), "public")));

// --- Simple binary relay format ---
// Client sends: Float32 PCM frames @ 48kHz in small chunks (ArrayBuffer)
// Server responds with audio frames to play immediately.

wss.on("connection", (ws) => {
  console.log("WS connected");

  ws.on("message", async (data, isBinary) => {
    if (!isBinary) return; // ignore text frames

    // 🔁 LOOPBACK: send audio back immediately to prove low‑latency pipeline
    // Replace this block with a bridge to OpenAI Realtime Voice once enabled.

    // TODO: OpenAI Realtime hook (sketch):
    // 1) Maintain a persistent connection/session to OpenAI Realtime API
    // 2) Forward inbound PCM frames
    // 3) Stream AI TTS PCM frames back here

    ws.send(data, { binary: true });
  });

  ws.on("close", () => console.log("WS closed"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Voice demo listening on http://localhost:${PORT}`));
