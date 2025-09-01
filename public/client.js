// public/client.js
const startBtn = document.getElementById('startBtn');
const stopBtn  = document.getElementById('stopBtn');
const statusEl = document.getElementById('status');
const logEl    = document.getElementById('log');

let ws;
let audioCtx;
let sourceNode;
let processor;

function log(msg){ logEl.textContent = `${new Date().toLocaleTimeString()} — ${msg}\n` + logEl.textContent; }

async function start() {
  if (ws && ws.readyState === WebSocket.OPEN) return;
  statusEl.textContent = 'starting…';

  // 1) Connect WS
  ws = new WebSocket(`ws://${location.host}`);
  ws.binaryType = 'arraybuffer';

  ws.onopen = () => { log('WS open'); statusEl.textContent = 'connected'; };
  ws.onclose = () => { log('WS closed'); statusEl.textContent = 'idle'; };
  ws.onerror = (e) => { log('WS error'); console.error(e); };

  // 2) Get mic
  const stream = await navigator.mediaDevices.getUserMedia({ audio: {
    channelCount: 1,
    sampleRate: 48000,
    noiseSuppression: true,
    echoCancellation: true
  }});

  // 3) Audio graph
  audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 });
  sourceNode = audioCtx.createMediaStreamSource(stream);
  processor = audioCtx.createScriptProcessor(2048, 1, 1);

  sourceNode.connect(processor);
  processor.connect(audioCtx.destination); // required for onaudioprocess to fire

  processor.onaudioprocess = (e) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const input = e.inputBuffer.getChannelData(0); // Float32Array
    const buf = new Float32Array(input.length);
    buf.set(input);
    ws.send(buf.buffer);
  };

  // 4) Playback: create a small buffer source per incoming chunk
  ws.onmessage = (evt) => {
    const arrayBuf = evt.data;
    const float32 = new Float32Array(arrayBuf);
    const audioBuffer = audioCtx.createBuffer(1, float32.length, 48000);
    audioBuffer.copyToChannel(float32, 0, 0);

    const src = audioCtx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(audioCtx.destination);
    src.start();
  };

  startBtn.disabled = true;
  stopBtn.disabled = false;
}

function stop() {
  try { processor && processor.disconnect(); } catch {}
  try { sourceNode && sourceNode.disconnect(); } catch {}
  try { audioCtx && audioCtx.close(); } catch {}
  try { ws && ws.close(); } catch {}
  startBtn.disabled = false;
  stopBtn.disabled = true;
  statusEl.textContent = 'idle';
}

startBtn.onclick = start;
stopBtn.onclick = stop;
