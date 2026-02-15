// =======================
// ALIZA'S REVENGE v3 — Puzzles + Audio + Fight
// =======================

"use strict";

// ---------- DOM ----------
const UI = {
  title: document.getElementById("title"),
  bootStatus: document.getElementById("bootStatus"),
  portrait: document.getElementById("portrait"),
  console: document.getElementById("console"),
  consoleBox: document.getElementById("consoleBox"),
  timer: document.getElementById("timer"),
  progress: document.getElementById("progress"),
  compWrap: document.getElementById("compWrap"),
  compText: document.getElementById("compText"),
  bannerWrap: document.getElementById("bannerWrap"),
  bannerText: document.getElementById("bannerText"),
  agentWrap: document.getElementById("agentWrap"),
  agentLine: document.getElementById("agentLine"),
  agentStage: document.getElementById("agentStage"),
  agentSprite: document.getElementById("agentSprite"),

  p1data: document.getElementById("p1data"),
  p1in: document.getElementById("p1in"),
  p1go: document.getElementById("p1go"),
  p1msg: document.getElementById("p1msg"),

  p2data: document.getElementById("p2data"),
  p2in: document.getElementById("p2in"),
  p2go: document.getElementById("p2go"),
  p2msg: document.getElementById("p2msg"),

  p3data: document.getElementById("p3data"),
  p3in: document.getElementById("p3in"),
  p3go: document.getElementById("p3go"),
  p3msg: document.getElementById("p3msg"),

  tools: document.getElementById("tools"),
  toolsToggle: document.getElementById("toolsToggle"),
  tabs: [...document.querySelectorAll(".tab")],
  panes: {
    decoder: document.getElementById("tab-decoder"),
    triage: document.getElementById("tab-triage"),
    checksum: document.getElementById("tab-checksum"),
  },

  // decoder
  dSort: document.getElementById("dSort"),
  dJoin: document.getElementById("dJoin"),
  dB64: document.getElementById("dB64"),
  dReverse: document.getElementById("dReverse"),
  dUpper: document.getElementById("dUpper"),
  dOut: document.getElementById("dOut"),
  dStats: document.getElementById("dStats"),

  // triage
  tHigh: document.getElementById("tHigh"),
  tNeon: document.getElementById("tNeon"),
  tBlock: document.getElementById("tBlock"),
  tQuery: document.getElementById("tQuery"),
  tScan: document.getElementById("tScan"),
  tExtract: document.getElementById("tExtract"),
  tClear: document.getElementById("tClear"),
  tOut: document.getElementById("tOut"),
  tStats: document.getElementById("tStats"),

  // checksum
  cIn: document.getElementById("cIn"),
  cCalc: document.getElementById("cCalc"),
  cTryA: document.getElementById("cTryA"),
  cTryB: document.getElementById("cTryB"),
  cTryC: document.getElementById("cTryC"),
  cTryD: document.getElementById("cTryD"),
  cOut: document.getElementById("cOut"),
};

// ---------- Canvas ----------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: true });

let W = 0, H = 0, DPR = 1;

function resize() {
  DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  W = Math.floor(window.innerWidth);
  H = Math.floor(window.innerHeight);
  canvas.width = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener("resize", resize);
resize();

// ---------- Helpers ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const choice = (arr) => arr[(Math.random() * arr.length) | 0];

function fmtTime(t) {
  t = Math.max(0, t);
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

// ---------- Boot portrait (pixel “Trinity-ish” Aliza) ----------
const pctx = UI.portrait.getContext("2d");
function drawPortrait() {
  const s = UI.portrait.width;
  pctx.clearRect(0, 0, s, s);

  // background scan
  const g = pctx.createLinearGradient(0, 0, s, s);
  g.addColorStop(0, "rgba(56,246,255,.10)");
  g.addColorStop(0.5, "rgba(255,80,200,.08)");
  g.addColorStop(1, "rgba(0,255,120,.06)");
  pctx.fillStyle = g;
  pctx.fillRect(0, 0, s, s);

  // simple blocky face
  const cx = s / 2;
  const cy = s / 2 + 6;

  // hair
  pctx.fillStyle = "rgba(0,0,0,.85)";
  pctx.fillRect(cx - 34, cy - 46, 68, 70);
  // face
  pctx.fillStyle = "rgba(230,210,200,.95)";
  pctx.fillRect(cx - 22, cy - 28, 44, 46);
  // glasses
  pctx.fillStyle = "rgba(0,0,0,.85)";
  pctx.fillRect(cx - 20, cy - 12, 18, 10);
  pctx.fillRect(cx + 2, cy - 12, 18, 10);
  pctx.fillRect(cx - 2, cy - 9, 4, 2);
  // lens glints
  pctx.fillStyle = "rgba(56,246,255,.45)";
  pctx.fillRect(cx - 17, cy - 11, 10, 2);
  pctx.fillStyle = "rgba(255,80,200,.35)";
  pctx.fillRect(cx + 5, cy - 11, 10, 2);

  // eyes
  pctx.fillStyle = "rgba(0,0,0,.75)";
  pctx.fillRect(cx - 15, cy - 8, 4, 2);
  pctx.fillRect(cx + 11, cy - 8, 4, 2);

  // coat / collar
  pctx.fillStyle = "rgba(0,0,0,.8)";
  pctx.fillRect(cx - 34, cy + 20, 68, 44);
  pctx.fillStyle = "rgba(56,246,255,.10)";
  pctx.fillRect(cx - 34, cy + 20, 68, 5);

  // tiny caption
  pctx.fillStyle = "rgba(230,241,255,.85)";
  pctx.font = "10px ui-monospace, Menlo, Consolas, monospace";
  pctx.fillText("ALIZA // OPERATOR", 10, s - 10);
}
drawPortrait();

// ---------- Audio ----------
let ac = null;
let master = null;
let musicNodes = [];
let startedAudio = false;

function initAudio() {
  if (startedAudio) return;
  startedAudio = true;

  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain();
  master.gain.value = 0.20;
  master.connect(ac.destination);

  // keep light at start
  setMusicStage(0);
}

function beep(freq = 220, dur = 0.12, type = "sine", vol = 0.08) {
  if (!ac) return;
  const t = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur);
}

function alarmDeep() {
  if (!ac) return;
  const t = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  const f = ac.createBiquadFilter();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(60, t + 0.35);
  f.type = "lowpass";
  f.frequency.setValueAtTime(700, t);
  g.gain.setValueAtTime(0.18, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  o.connect(f); f.connect(g); g.connect(master);
  o.start(t);
  o.stop(t + 0.5);
}

function boom() {
  if (!ac) return;
  const t = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  const f = ac.createBiquadFilter();
  o.type = "triangle";
  o.frequency.setValueAtTime(90, t);
  o.frequency.exponentialRampToValueAtTime(35, t + 0.6);
  f.type = "lowpass";
  f.frequency.setValueAtTime(250, t);
  g.gain.setValueAtTime(0.22, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
  o.connect(f); f.connect(g); g.connect(master);
  o.start(t);
  o.stop(t + 0.85);
}

// TTS “agent voice” (deep male-ish + robotic vibe using pitch/rate)
function speak(line) {
  try {
    if (!("speechSynthesis" in window)) return;
    
    // Ensure voices are loaded
    const speakWithVoice = () => {
      const u = new SpeechSynthesisUtterance(line);
      u.rate = 0.95;
      u.pitch = 0.55;
      u.volume = 1.0;
      // attempt choose a male voice if available
      const vs = speechSynthesis.getVoices() || [];
      const male = vs.find(v => /male|daniel|alex|fred|david/i.test(v.name));
      if (male) u.voice = male;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    };
    
    // Check if voices are already loaded
    if (speechSynthesis.getVoices().length > 0) {
      speakWithVoice();
    } else {
      // Wait for voices to load
      speechSynthesis.addEventListener('voiceschanged', speakWithVoice, { once: true });
      // Fallback timeout
      setTimeout(speakWithVoice, 100);
    }
  } catch {}
}

function clearMusic() {
  try {
    musicNodes.forEach(n => { try { n.stop?.(); } catch {} });
  } catch {}
  musicNodes = [];
}

// Stage 0: groovy
function musicStage0() {
  if (!ac) return;
  const t0 = ac.currentTime + 0.02;

  const bass = ac.createOscillator();
  bass.type = "sine";
  const bg = ac.createGain();
  bg.gain.value = 0.10;

  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 220;

  bass.connect(lp); lp.connect(bg); bg.connect(master);

  const seq = [55, 62, 55, 49];
  let step = 0;
  const interval = 0.36;

  function tick() {
    const t = ac.currentTime;
    bass.frequency.setValueAtTime(seq[step % seq.length], t);
    step++;
    // small click
    beep(880, 0.03, "square", 0.02);
    if (musicNodes.includes(bass)) setTimeout(tick, interval * 1000);
  }

  bass.start(t0);
  setTimeout(tick, 40);

  musicNodes.push(bass);
}

// Stage 1: moody
function musicStage1() {
  if (!ac) return;
  const t0 = ac.currentTime + 0.02;

  const bass = ac.createOscillator();
  bass.type = "triangle";
  const bg = ac.createGain();
  bg.gain.value = 0.12;

  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 260;

  bass.connect(lp); lp.connect(bg); bg.connect(master);

  const seq = [52, 49, 46, 49];
  let step = 0;
  const interval = 0.30;

  function tick() {
    const t = ac.currentTime;
    bass.frequency.setValueAtTime(seq[step % seq.length], t);
    step++;
    beep(660, 0.025, "square", 0.015);
    if (musicNodes.includes(bass)) setTimeout(tick, interval * 1000);
  }

  bass.start(t0);
  setTimeout(tick, 40);

  musicNodes.push(bass);
}

// Stage 2: bassy
function musicStage2() {
  if (!ac) return;
  const t0 = ac.currentTime + 0.02;

  const bass = ac.createOscillator();
  bass.type = "sawtooth";
  const bg = ac.createGain();
  bg.gain.value = 0.14;

  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 340;

  bass.connect(lp); lp.connect(bg); bg.connect(master);

  const seq = [55, 55, 62, 55, 49, 49, 46, 49];
  let step = 0;
  const interval = 0.18;

  function tick() {
    const t = ac.currentTime;
    bass.frequency.setValueAtTime(seq[step % seq.length], t);
    step++;
    // faint hat-ish
    beep(1200, 0.015, "square", 0.012);
    if (musicNodes.includes(bass)) setTimeout(tick, interval * 1000);
  }

  bass.start(t0);
  setTimeout(tick, 40);

  musicNodes.push(bass);
}

// Stage 3: fight aggro
function musicStage3() {
  if (!ac) return;
  const t0 = ac.currentTime + 0.02;

  // bass
  const bass = ac.createOscillator();
  bass.type = "sawtooth";
  const bg = ac.createGain();
  bg.gain.value = 0.16;

  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 420;

  bass.connect(lp); lp.connect(bg); bg.connect(master);

  // treble arp
  const arp = ac.createOscillator();
  arp.type = "square";
  const ag = ac.createGain();
  ag.gain.value = 0.035;
  arp.connect(ag); ag.connect(master);

  const bseq = [55, 62, 55, 49, 46, 49, 55, 62];
  const aseq = [440, 660, 880];
  let step = 0;
  const interval = 0.14;

  function tick() {
    const t = ac.currentTime;
    bass.frequency.setValueAtTime(bseq[step % bseq.length], t);
    arp.frequency.setValueAtTime(aseq[step % aseq.length], t);
    step++;
    // punchy hat
    beep(1800, 0.012, "square", 0.015);
    if (musicNodes.includes(bass)) setTimeout(tick, interval * 1000);
  }

  bass.start(t0);
  arp.start(t0);
  setTimeout(tick, 40);

  musicNodes.push(bass, arp);
}

function setMusicStage(stage) {
  if (!ac) return;
  clearMusic();
  if (stage === 0) musicStage0();
  if (stage === 1) musicStage1();
  if (stage === 2) musicStage2();
  if (stage === 3) musicStage3();
}

// ---------- Agent popup ----------
let agentHideTimer = null;

function showAgent(line, stageNum = 1, stageLabel = "STAGE") {
  UI.agentWrap.style.display = "block";
  UI.agentLine.textContent = line;
  UI.agentStage.textContent = `${stageLabel} ${String(stageNum).padStart(2, "0")}`;

  // tiny “voice click” + speak
  beep(220, 0.06, "square", 0.05);
  speak(line);

  drawAgentSprite(stageNum);

  clearTimeout(agentHideTimer);
  agentHideTimer = setTimeout(() => {
    UI.agentWrap.style.display = "none";
  }, 2500);
}

function showBanner(text) {
  UI.bannerText.textContent = text;
  UI.bannerWrap.style.display = "grid";
  setTimeout(() => (UI.bannerWrap.style.display = "none"), 1200);
}

// ---------- Agent sprite (blocky pixel agent) ----------
const as = UI.agentSprite.getContext("2d");
function drawAgentSprite(stageNum) {
  const s = UI.agentSprite.width;
  as.clearRect(0, 0, s, s);

  // glow ring
  const g = as.createRadialGradient(s / 2, s / 2, 6, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,80,200,.28)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  as.fillStyle = g;
  as.fillRect(0, 0, s, s);

  // body
  as.fillStyle = "rgba(0,0,0,.8)";
  as.fillRect(16, 14, 24, 30);

  // visor
  as.fillStyle = "rgba(255,80,200,.45)";
  as.fillRect(18, 20, 20, 6);

  // shoulders / coat
  as.fillStyle = "rgba(56,246,255,.12)";
  as.fillRect(14, 14, 28, 6);

  // stage mark
  as.fillStyle = "rgba(255,209,102,.85)";
  as.font = "10px ui-monospace, Menlo, Consolas, monospace";
  as.fillText(String(stageNum), 4, 12);
}

// ---------- Game state ----------
let phase = "boot"; // boot | console | fight
let defenseRunning = false;
let defenseTime = 300; // 5 min
let solved = 0;

let compromised = false;
let corruptLeft = 0;

function resetRun() {
  // called by button on compromised overlay
  compromised = false;
  corruptLeft = 0;
  UI.compWrap.style.display = "none";

  // reset puzzles
  solved = 0;
  UI.progress.textContent = "0 / 3 MITIGATED";

  lockPuzzle(1, false);
  lockPuzzle(2, true);
  lockPuzzle(3, true);

  UI.p1msg.textContent = "";
  UI.p2msg.textContent = "";
  UI.p3msg.textContent = "";

  UI.p1in.value = "";
  UI.p2in.value = "";
  UI.p3in.value = "";

  // reset time
  defenseTime = 300;
  UI.timer.textContent = "TIME LEFT: 05:00";

  // restore console
  UI.console.style.display = "grid";
  phase = "console";
  defenseRunning = true;

  // reset music
  if (ac) setMusicStage(0);
}

function begin() {
  initAudio();
  UI.title.style.display = "none";
  UI.console.style.display = "grid";
  phase = "console";
  defenseRunning = true;
  UI.bootStatus.textContent = "(booted)";
  showAgent("Operator online. Stop the vectors. Then survive the fight.", 1, "STAGE");
}

window.begin = begin;
window.resetRun = resetRun;

// ---------- Tabs ----------
UI.tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    UI.tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    Object.values(UI.panes).forEach(p => p.classList.remove("active"));
    UI.panes[tab].classList.add("active");
  });
});

// Collapse tools
let toolsCollapsed = false;
UI.toolsToggle.addEventListener("click", () => {
  toolsCollapsed = !toolsCollapsed;
  UI.tools.style.display = toolsCollapsed ? "none" : "block";
  UI.toolsToggle.textContent = toolsCollapsed ? "Expand" : "Collapse";
});

// ---------- Puzzle locking ----------
function lockPuzzle(n, locked) {
  const card = document.getElementById("card" + n);
  const input = UI["p" + n + "in"];
  const btn = UI["p" + n + "go"];
  card.style.opacity = locked ? "0.55" : "1";
  input.disabled = locked;
  btn.disabled = locked;
}

// =======================
// PUZZLES DATA
// =======================

// Puzzle 1: fragments -> sort -> join -> base64 -> reverse -> uppercase
const P1 = {
  fragments: [
    "bGk=",
    "emE=",
    "IGlz",
    "IHRo",
    "ZSBl",
    "bmQg",
    "b2Yg",
    "dGhl",
    "IHdp",
    "cmU=",
    "Lg=="
  ],
  // the final expected phrase after decoding + reverse + uppercase
  expected: "WIRE THE END IS ALIZA.",
  instructions:
`Fragments (unordered):
  bGk=  emE=  IGlz  IHRo  ZSBl  bmQg  b2Yg  dGhl  IHdp  cmU=  Lg==
Goal: reconstruct the payload phrase.`,
};

// Puzzle 2: log triage -> extract key
const RAW_LOGS = [
  "2026-02-15T08:12:04Z lvl=LOW  sig=NEON  rule=ALLOW  note=handshake ok",
  "2026-02-15T08:12:10Z lvl=HIGH sig=EMBER rule=BLOCK  note=anomaly spike id=K0-29",
  "2026-02-15T08:12:14Z lvl=HIGH sig=NEON  rule=ALLOW  note=benign operator ping",
  "2026-02-15T08:12:19Z lvl=HIGH sig=NEON  rule=BLOCK  note=vector matched key=TRIAGE-NEO",
  "2026-02-15T08:12:21Z lvl=MED  sig=NEON  rule=BLOCK  note=rate limit",
  "2026-02-15T08:12:25Z lvl=HIGH sig=NEON  rule=BLOCK  note=spo0n drift id=S-77",
  "2026-02-15T08:12:31Z lvl=HIGH sig=NEON  rule=BLOCK  note=vector matched key=TRIAGE-TRIN",
  "2026-02-15T08:12:36Z lvl=LOW  sig=GLASS rule=ALLOW  note=cache warm",
  "2026-02-15T08:12:40Z lvl=HIGH sig=NEON  rule=BLOCK  note=vector matched key=TRIAGE-ONE",
];
const P2_EXPECT = "TRIAGE-TRIN"; // hardest “neo+trinity” vibe

// Puzzle 3: checksum gate
const P3 = `Integrity Gate:
Target checksum: 42

Choose the correct phrase EXACTLY:
A) "NEO FINDS TRINITY"
B) "TRINITY FINDS NEO"
C) "NEO & TRINITY: ONE"
D) "THE ONE IS TRINITY"

Hint: checksum(text) = sum(ASCII codes) mod 97`;

const P3_CHOICES = {
  A: "NEO FINDS TRINITY",
  B: "TRINITY FINDS NEO",
  C: "NEO & TRINITY: ONE",
  D: "THE ONE IS TRINITY",
};
const P3_TARGET = 42;
const P3_EXPECT = P3_CHOICES.C;

// ---------- Render initial puzzle text ----------
function renderPuzzles() {
  UI.p1data.textContent = P1.instructions;
  UI.p2data.textContent = RAW_LOGS.join("\n");
  UI.p3data.textContent = P3;
}
renderPuzzles();

// ---------- Tool panel state ----------
let p1State = {
  fragments: [...P1.fragments],
  joined: "",
  decoded: "",
};

function toolUpdateStats() {
  UI.dStats.textContent = `Fragments: ${p1State.fragments.length} | Joined: ${p1State.joined.length} chars | Decoded: ${p1State.decoded.length} chars`;
}

function b64decode(s) {
  try {
    return atob(s);
  } catch {
    return "";
  }
}

// Decoder buttons
UI.dSort.addEventListener("click", () => {
  p1State.fragments.sort();
  UI.dOut.value = p1State.fragments.join(" ");
  toolUpdateStats();
  beep(330, 0.06, "square", 0.04);
});

UI.dJoin.addEventListener("click", () => {
  p1State.joined = p1State.fragments.join("");
  UI.dOut.value = p1State.joined;
  toolUpdateStats();
  beep(280, 0.06, "square", 0.04);
});

UI.dB64.addEventListener("click", () => {
  p1State.decoded = b64decode(p1State.joined || p1State.fragments.join(""));
  UI.dOut.value = p1State.decoded;
  toolUpdateStats();
  beep(240, 0.06, "square", 0.04);
});

UI.dReverse.addEventListener("click", () => {
  const src = UI.dOut.value || p1State.decoded;
  UI.dOut.value = src.split("").reverse().join("");
  beep(200, 0.06, "square", 0.04);
});

UI.dUpper.addEventListener("click", () => {
  UI.dOut.value = (UI.dOut.value || "").toUpperCase();
  beep(170, 0.06, "square", 0.04);
});

// Triage tools
let triageView = [...RAW_LOGS];

function applyTriageFilters() {
  const wantHigh = UI.tHigh.checked;
  const wantNeon = UI.tNeon.checked;
  const wantBlock = UI.tBlock.checked;

  const q = (UI.tQuery.value || "").trim().toLowerCase().split(/\s+/).filter(Boolean);

  triageView = RAW_LOGS.filter(line => {
    if (wantHigh && !/lvl=HIGH/.test(line)) return false;
    if (wantNeon && !/sig=NEON/.test(line)) return false;
    if (wantBlock && !/rule=BLOCK/.test(line)) return false;

    if (q.length) {
      const l = line.toLowerCase();
      for (const w of q) if (!l.includes(w)) return false;
    }
    return true;
  });

  UI.tOut.value = triageView.join("\n");
  UI.tStats.textContent = `Matches: ${triageView.length}`;
}

UI.tScan.addEventListener("click", () => {
  applyTriageFilters();
  beep(320, 0.05, "square", 0.04);
});

UI.tClear.addEventListener("click", () => {
  UI.tHigh.checked = true;
  UI.tNeon.checked = true;
  UI.tBlock.checked = true;
  UI.tQuery.value = "";
  triageView = [...RAW_LOGS];
  UI.tOut.value = triageView.join("\n");
  UI.tStats.textContent = `Matches: ${triageView.length}`;
  beep(220, 0.05, "square", 0.04);
});

UI.tExtract.addEventListener("click", () => {
  applyTriageFilters();
  // extract last "key=...." occurrence from filtered logs
  const keys = triageView
    .map(l => (l.match(/key=([A-Z0-9\-]+)/) || [])[1])
    .filter(Boolean);

  const key = keys[keys.length - 1] || "";
  UI.tOut.value = triageView.join("\n") + (key ? `\n\nExtracted key: ${key}` : "\n\nNo key found.");
  beep(260, 0.06, "square", 0.04);
});

// Checksum tool
function checksum97(text) {
  let sum = 0;
  for (let i = 0; i < text.length; i++) sum += text.charCodeAt(i);
  return sum % 97;
}

function checksumReport(text) {
  const c = checksum97(text);
  return `Text: ${text}\nChecksum: ${c} (target ${P3_TARGET})`;
}

UI.cCalc.addEventListener("click", () => {
  UI.cOut.value = checksumReport(UI.cIn.value || "");
  beep(280, 0.06, "square", 0.04);
});

UI.cTryA.addEventListener("click", () => { UI.cIn.value = P3_CHOICES.A; UI.cOut.value = checksumReport(P3_CHOICES.A); });
UI.cTryB.addEventListener("click", () => { UI.cIn.value = P3_CHOICES.B; UI.cOut.value = checksumReport(P3_CHOICES.B); });
UI.cTryC.addEventListener("click", () => { UI.cIn.value = P3_CHOICES.C; UI.cOut.value = checksumReport(P3_CHOICES.C); });
UI.cTryD.addEventListener("click", () => { UI.cIn.value = P3_CHOICES.D; UI.cOut.value = checksumReport(P3_CHOICES.D); });

// ---------- Penalty ----------
function penalize(whichMsgEl) {
  defenseTime = Math.max(0, defenseTime - 5);
  whichMsgEl.textContent = "✖ Incorrect — -05 seconds";
  whichMsgEl.style.color = "var(--red)";
  alarmDeep();
  // flash console
  UI.consoleBox.style.outline = "2px solid rgba(255,51,85,.65)";
  UI.consoleBox.style.boxShadow = "0 0 0 2px rgba(255,51,85,.25), 0 18px 60px rgba(0,0,0,.75)";
  setTimeout(() => {
    UI.consoleBox.style.outline = "";
    UI.consoleBox.style.boxShadow = "";
  }, 180);
}

// ---------- Solve tracking ----------
function solvedOne() {
  solved++;
  UI.progress.textContent = `${solved} / 3 MITIGATED`;

  if (solved === 1) {
    lockPuzzle(2, false);
    setMusicStage(1);
    showAgent("Cute. You can decode. Try reading the logs, operator.", 1, "VECTOR");
  } else if (solved === 2) {
    lockPuzzle(3, false);
    setMusicStage(2);
    showAgent("You filtered noise like a pro. Integrity gate next — don't blink.", 2, "VECTOR");
  } else if (solved === 3) {
    showAgent("That was your last warm-up.", 3, "VECTOR");
    fightCountdown();
  }
}

// ---------- Verify buttons ----------
UI.p1go.addEventListener("click", () => {
  const ans = (UI.p1in.value || "").trim().toUpperCase();
  if (ans === P1.expected) {
    UI.p1msg.textContent = "✓ Vector 01 mitigated.";
    UI.p1msg.style.color = "var(--green)";
    lockPuzzle(1, true);
    solvedOne();
  } else {
    penalize(UI.p1msg);
  }
});

UI.p2go.addEventListener("click", () => {
  const ans = (UI.p2in.value || "").trim().toUpperCase();
  if (ans === P2_EXPECT) {
    UI.p2msg.textContent = "✓ Vector 02 mitigated.";
    UI.p2msg.style.color = "var(--green)";
    lockPuzzle(2, true);
    solvedOne();
  } else {
    penalize(UI.p2msg);
  }
});

UI.p3go.addEventListener("click", () => {
  const ans = (UI.p3in.value || "").trim();
  if (ans === P3_EXPECT) {
    UI.p3msg.textContent = "✓ Vector 03 mitigated.";
    UI.p3msg.style.color = "var(--green)";
    lockPuzzle(3, true);
    solvedOne();
  } else {
    penalize(UI.p3msg);
  }
});

// initially only puzzle 1 active
lockPuzzle(1, false);
lockPuzzle(2, true);
lockPuzzle(3, true);

// =======================
// MATRIX RAIN + SPOONS (background)
// =======================
const glyphs = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&@*+?~";
const spoons = [];

let rainCols = [];
function initRain() {
  const colW = 16;
  const cols = Math.ceil(W / colW);
  rainCols = new Array(cols).fill(0).map(() => ({
    x: Math.random() * W,
    y: Math.random() * H,
    speed: rand(60, 220),
    len: rand(8, 28),
    phase: Math.random() * 10,
  }));

  spoons.length = 0;
  const n = Math.floor(W / 140) + 6;
  for (let i = 0; i < n; i++) {
    spoons.push({
      x: rand(0, W),
      y: rand(-H, H),
      vy: rand(20, 90),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.7, 0.7),
      s: rand(0.7, 1.3),
      tint: choice(["cyan", "pink", "green"]),
    });
  }
}
initRain();
window.addEventListener("resize", initRain);

function drawSpoon(sp) {
  ctx.save();
  ctx.translate(sp.x, sp.y);
  ctx.rotate(sp.rot);
  ctx.scale(sp.s, sp.s);

  const col =
    sp.tint === "cyan" ? "rgba(56,246,255,.30)" :
    sp.tint === "pink" ? "rgba(255,80,200,.26)" :
    "rgba(0,255,120,.24)";

  ctx.strokeStyle = col;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, -18);
  ctx.quadraticCurveTo(-2, -24, 6, -18);
  ctx.quadraticCurveTo(0, -12, -6, -18);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(0, 18);
  ctx.stroke();

  ctx.restore();
}

function drawRain(dt) {
  // subtle background wash
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, "rgba(5,8,18,0.25)");
  grd.addColorStop(1, "rgba(5,8,18,0.65)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  ctx.font = "14px ui-monospace, Menlo, Consolas, monospace";

  for (const c of rainCols) {
    c.y += c.speed * dt;
    if (c.y > H + c.len * 18) {
      c.y = -rand(20, 200);
      c.x = rand(0, W);
      c.speed = rand(60, 240);
      c.len = rand(8, 30);
      c.phase = Math.random() * 10;
    }

    for (let i = 0; i < c.len; i++) {
      const y = c.y - i * 18;
      if (y < -20 || y > H + 20) continue;

      // blend matrix-green with synthwave accents
      const isHead = i === 0;
      const a = isHead ? 0.55 : 0.20;
      const col = (Math.random() < 0.08)
        ? `rgba(255,80,200,${a})`
        : (Math.random() < 0.12)
          ? `rgba(56,246,255,${a})`
          : `rgba(0,255,120,${a})`;

      ctx.fillStyle = col;
      const ch = glyphs[(Math.random() * glyphs.length) | 0];
      ctx.fillText(ch, c.x, y);
    }
  }

  // spoons
  for (const sp of spoons) {
    sp.y += sp.vy * dt;
    sp.rot += sp.vr * dt;
    if (sp.y > H + 60) {
      sp.y = -rand(40, 260);
      sp.x = rand(0, W);
      sp.vy = rand(20, 100);
      sp.tint = choice(["cyan", "pink", "green"]);
    }
    drawSpoon(sp);
  }

  // scanlines
  ctx.fillStyle = "rgba(0,0,0,.16)";
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
}

function drawBackground(dt) {
  drawRain(dt);
}

// =======================
// COMPROMISED CORRUPTION
// =======================
const corruptGlyphs = "☠︎⌁⟟⧫⧖⧗⧉⧊⟁⟊⟒⟟⟟⟒⟟⟊⟊⌘⌬⌯⌰⌲⍉⍁⍂⍃⍄⍅⍆⍇⍈⌁⌁⌁";
function scrambleText(text) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\n" || ch === " ") { out += ch; continue; }
    if (Math.random() < 0.28) out += corruptGlyphs[(Math.random() * corruptGlyphs.length) | 0];
    else out += ch;
  }
  return out;
}

function triggerCompromised() {
  compromised = true;
  defenseRunning = false;
  corruptLeft = 3.0;

  UI.compWrap.style.display = "grid";
  UI.compText.textContent = "YOU'VE BEEN COMPROMISED!";
  showAgent("Time's up. That was adorable.", 9, "FAIL");
  boom();
}

// =======================
// FIGHT TRANSITION
// =======================
function fightCountdown(){
  // cinematic: taunt -> banner -> fade console -> fight
  showAgent("WE'VE GOT YOU NOW!", 2, "ALERT");
  showBanner("FIGHT TO SURVIVE");
  setMusicStage(3);
  setTimeout(()=>enterFight(), 1250);
}

// =======================
// FIGHT MODE (simple 2D fighter)
// =======================
const FUI = {
  hud: document.getElementById("fightHUD"),
  hpA: document.getElementById("hpAliza"),
  hpE: document.getElementById("hpAgent"),
  round: document.getElementById("roundPanel"),
  hint: document.getElementById("hudHint"),
  mobile: document.getElementById("mobileControls"),
};

let mode = "console"; // console | fight | win | lose
let shake = 0;
let round = 1;

const keys = new Set();
window.addEventListener("keydown", (e)=>{
  keys.add(e.key.toLowerCase());
});
window.addEventListener("keyup", (e)=>{
  keys.delete(e.key.toLowerCase());
});

// Mobile buttons (pointer events)
const act = {left:false,right:false,duck:false,lp:false,hp:false,lk:false,hk:false};
document.querySelectorAll(".mBtn").forEach(btn=>{
  const a = btn.dataset.act;
  const down = (ev)=>{ ev.preventDefault(); act[a]=true; };
  const up   = (ev)=>{ ev.preventDefault(); act[a]=false; };
  btn.addEventListener("pointerdown", down);
  btn.addEventListener("pointerup", up);
  btn.addEventListener("pointercancel", up);
  btn.addEventListener("pointerleave", up);
});

function isMobileLike(){
  return matchMedia("(pointer:coarse)").matches || innerWidth < 900;
}

// World + fighters
const G = {
  groundY: 0,
  camX: 0
};

function makeFighter(name, x, facing){
  return {
    name,
    x, y:0,
    vx:0, vy:0,
    w: 34, h: 62,
    facing, // 1 right, -1 left
    hp: 100,
    duck:false,
    stun:0,
    cd:0,
    atk:null, // {type, t, dur, hit, dmg, reach, height}
    inv:0,
  };
}

let aliza = makeFighter("ALIZA", 160, 1);
let agent = makeFighter("AGENT", 520, -1);

function resetFight(){
  aliza = makeFighter("ALIZA", 160, 1);
  agent = makeFighter("AGENT", 520, -1);
  shake = 0;
  mode = "fight";
  FUI.round.textContent = "ROUND " + round;
  updateHUD();
}

function enterFight(){
  // hide console UI
  UI.console.style.display = "none";
  mode = "fight";
  phase = "fight";
  defenseRunning = false;

  // show HUD + controls
  FUI.hud.style.display = "block";
  FUI.mobile.style.display = isMobileLike() ? "flex" : "none";
  FUI.hint.textContent = isMobileLike()
    ? "Tap buttons to fight · rotate to landscape for best feel"
    : "← → move · ↓ duck · Z/X punch · A/S kick";

  // announce
  showAgent("This is where you break. Or you become legend.", 2, "FIGHT");
  resetFight();
}

function updateHUD(){
  FUI.hpA.style.width = clamp(aliza.hp,0,100) + "%";
  FUI.hpE.style.width = clamp(agent.hp,0,100) + "%";
}

function playHit(kind="light"){
  if(!ac) return;
  const now=ac.currentTime;
  const o=ac.createOscillator(); o.type="square";
  const g=ac.createGain();
  const f=ac.createBiquadFilter(); f.type="lowpass"; f.frequency.value = kind==="heavy" ? 700 : 1100;
  o.frequency.setValueAtTime(kind==="heavy" ? 140 : 220, now);
  o.frequency.exponentialRampToValueAtTime(kind==="heavy" ? 72 : 120, now+0.10);
  g.gain.setValueAtTime(kind==="heavy" ? 0.22 : 0.14, now);
  g.gain.exponentialRampToValueAtTime(0.001, now+0.14);
  o.connect(f); f.connect(g); g.connect(master);
  o.start(now); o.stop(now+0.15);
}

function playWhoosh(){
  if(!ac) return;
  const now=ac.currentTime;
  const o=ac.createOscillator(); o.type="sawtooth";
  const g=ac.createGain();
  const bp=ac.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=900; bp.Q.value=0.9;
  o.frequency.setValueAtTime(520, now);
  o.frequency.exponentialRampToValueAtTime(210, now+0.07);
  g.gain.setValueAtTime(0.06, now);
  g.gain.exponentialRampToValueAtTime(0.001, now+0.08);
  o.connect(bp); bp.connect(g); g.connect(master);
  o.start(now); o.stop(now+0.09);
}

function rectsOverlap(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}

function fighterBodyRect(f){
  const h = f.duck ? f.h*0.62 : f.h;
  return {x:f.x - f.w/2, y:G.groundY - h, w:f.w, h:h};
}

function attackRect(f){
  if(!f.atk) return null;
  const reach = f.atk.reach;
  const hh = f.atk.height;
  const body = fighterBodyRect(f);
  const ax = (f.facing===1) ? (body.x + body.w) : (body.x - reach);
  const ay = body.y + (body.h - hh);
  return {x:ax, y:ay, w:reach, h:hh};
}

function startAttack(f, type){
  if(f.cd > 0 || f.stun > 0 || f.atk) return;
  const isHeavy = (type==="hp" || type==="hk");
  const isKick = (type==="lk" || type==="hk");
  const dur = isHeavy ? 0.26 : 0.18;
  const reach = isKick ? (isHeavy ? 50 : 44) : (isHeavy ? 44 : 38);
  const height = isKick ? (f.duck ? 26 : 22) : (f.duck ? 22 : 18);
  const dmg = isHeavy ? (isKick ? 18 : 16) : (isKick ? 12 : 10);
  f.atk = {type, t:0, dur, hit:false, dmg, reach, height};
  f.cd = isHeavy ? 0.44 : 0.30;
  playWhoosh();
}

function applyHit(attacker, defender, heavy=false){
  if(defender.inv > 0) return;
  const dmg = attacker.atk?.dmg ?? (heavy?16:10);
  defender.hp = Math.max(0, defender.hp - dmg);
  defender.stun = heavy ? 0.22 : 0.14;
  defender.inv = 0.12;
  shake = heavy ? 10 : 6;
  playHit(heavy ? "heavy" : "light");
  updateHUD();
}

function controlInput(dt){
  // Aliza controls: arrows for move, down for duck; Z/X punches; A/S kicks
  const left = keys.has("arrowleft") || act.left;
  const right = keys.has("arrowright") || act.right;
  const duck = keys.has("arrowdown") || act.duck;

  const lp = keys.has("z") || act.lp;
  const hp = keys.has("x") || act.hp;
  const lk = keys.has("a") || act.lk;
  const hk = keys.has("s") || act.hk;

  aliza.duck = duck && aliza.stun<=0;
  const speed = aliza.duck ? 110 : 175;

  if(aliza.stun<=0 && !aliza.atk){
    aliza.vx = (right?1:0 - (left?1:0)) * speed;
  } else {
    aliza.vx *= 0.85;
  }

  if(lp) startAttack(aliza,"lp");
  if(hp) startAttack(aliza,"hp");
  if(lk) startAttack(aliza,"lk");
  if(hk) startAttack(aliza,"hk");
}

function agentAI(dt){
  // simple AI: approach + occasional attacks + duck sometimes
  const dist = aliza.x - agent.x;
  agent.facing = dist>0 ? 1 : -1;

  if(agent.stun>0 || agent.atk) {
    agent.vx *= 0.85;
    return;
  }

  const absd = Math.abs(dist);
  const wantDuck = (absd < 120) && Math.random() < 0.01;
  agent.duck = wantDuck;

  if(absd > 130){
    agent.vx = (dist>0?1:-1) * (agent.duck ? 90 : 150);
  } else {
    agent.vx *= 0.80;
    // choose attack
    if(agent.cd<=0 && Math.random() < 0.035){
      const pick = Math.random();
      if(pick < 0.45) startAttack(agent,"lp");
      else if(pick < 0.70) startAttack(agent,"lk");
      else if(pick < 0.88) startAttack(agent,"hp");
      else startAttack(agent,"hk");
    }
  }
}

function physicsStep(f, dt){
  f.x += f.vx * dt;

  // clamp arena
  f.x = clamp(f.x, 70, W-70);

  if(f.stun>0) f.stun = Math.max(0, f.stun - dt);
  if(f.cd>0) f.cd = Math.max(0, f.cd - dt);
  if(f.inv>0) f.inv = Math.max(0, f.inv - dt);

  if(f.atk){
    f.atk.t += dt;
    if(f.atk.t >= f.atk.dur){
      f.atk = null;
    }
  }
}

function resolveFacing(){
  // face each other
  const d = agent.x - aliza.x;
  aliza.facing = d>=0 ? 1 : -1;
  agent.facing = d>=0 ? -1 : 1;
}

function fightLoop(dt){
  G.groundY = H - 84;

  controlInput(dt);
  agentAI(dt);

  resolveFacing();

  physicsStep(aliza, dt);
  physicsStep(agent, dt);

  // collisions: attacks
  if(aliza.atk && !aliza.atk.hit){
    const ar = attackRect(aliza);
    const br = fighterBodyRect(agent);
    if(ar && rectsOverlap(ar, br)){
      aliza.atk.hit = true;
      applyHit(aliza, agent, (aliza.atk.type==="hp"||aliza.atk.type==="hk"));
    }
  }
  if(agent.atk && !agent.atk.hit){
    const ar = attackRect(agent);
    const br = fighterBodyRect(aliza);
    if(ar && rectsOverlap(ar, br)){
      agent.atk.hit = true;
      applyHit(agent, aliza, (agent.atk.type==="hp"||agent.atk.type==="hk"));
    }
  }

  // win/lose
  if(aliza.hp<=0 && mode==="fight"){
    mode="lose";
    showAgent("You fought well. But the system still owns you.", 2, "DEFEAT");
    showBanner("DEFEAT");
    try{ master.gain.setTargetAtTime(0.18, ac.currentTime, 0.2); }catch{}
  }
  if(agent.hp<=0 && mode==="fight"){
    mode="win";
    showAgent("Impossible. You're not supposed to be this… real.", 2, "VICTORY");
    showBanner("VICTORY");
    try{ master.gain.setTargetAtTime(0.24, ac.currentTime, 0.2); }catch{}
  }
}

function drawFighter(f, palette){
  // palette: [main, accent, glow]
  const body = fighterBodyRect(f);
  const px = body.x, py = body.y, pw = body.w, ph = body.h;

  // slight bob
  const bob = (f.atk ? Math.sin((f.atk.t/f.atk.dur)*Math.PI) : 0) * 3;

  // shadow
  ctx.fillStyle = "rgba(0,0,0,.55)";
  ctx.beginPath();
  ctx.ellipse(f.x, G.groundY+8, f.w*0.85, 10, 0, 0, Math.PI*2);
  ctx.fill();

  // coat/body
  ctx.fillStyle = palette[0];
  ctx.fillRect(px, py + bob, pw, ph);

  // collar / trim
  ctx.fillStyle = palette[1];
  ctx.fillRect(px, py + bob, pw, 6);
  ctx.fillRect(px, py + bob + ph-6, pw, 3);

  // glasses highlight for Aliza
  if(f.name==="ALIZA"){
    ctx.fillStyle = "rgba(56,246,255,.55)";
    ctx.fillRect(f.x-8, py + bob + 16, 16, 2);
    ctx.fillStyle = "rgba(255,80,200,.45)";
    ctx.fillRect(f.x+2, py + bob + 16, 14, 2);
  }

  // face/visor
  ctx.fillStyle = "rgba(0,0,0,.75)";
  ctx.fillRect(f.x-8, py + bob + 12, 16, 10);

  // attack flash (swing)
  const ar = attackRect(f);
  if(f.atk && ar){
    const p = f.atk.t / f.atk.dur;
    const alpha = (p>0.15 && p<0.75) ? 0.20 : 0.08;
    ctx.fillStyle = palette[2].replace("ALPHA", String(alpha));
    ctx.fillRect(ar.x, ar.y, ar.w, ar.h);
  }

  // stun stars
  if(f.stun>0){
    ctx.fillStyle = "rgba(255,209,102,.65)";
    ctx.fillText("✦", f.x-12, py-8);
    ctx.fillText("✧", f.x+8, py-4);
  }
}

function drawArena(){
  // cyber floor
  const y = G.groundY;
  const grd = ctx.createLinearGradient(0,y,0,H);
  grd.addColorStop(0,"rgba(0,0,0,.0)");
  grd.addColorStop(1,"rgba(0,0,0,.75)");
  ctx.fillStyle = grd;
  ctx.fillRect(0,y, W, H-y);

  // grid lines
  ctx.strokeStyle = "rgba(56,246,255,.10)";
  ctx.lineWidth = 1;
  for(let i=0;i<18;i++){
    const yy = y + i*14;
    ctx.beginPath();
    ctx.moveTo(0,yy);
    ctx.lineTo(W,yy);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(255,80,200,.08)";
  for(let i=0;i<14;i++){
    const xx = i*(W/14);
    ctx.beginPath();
    ctx.moveTo(xx,y);
    ctx.lineTo(xx,H);
    ctx.stroke();
  }

  // horizon glow
  const g = ctx.createLinearGradient(0,y-50,0,y+60);
  g.addColorStop(0,"rgba(255,80,200,.00)");
  g.addColorStop(0.45,"rgba(255,80,200,.10)");
  g.addColorStop(0.55,"rgba(56,246,255,.14)");
  g.addColorStop(1,"rgba(0,0,0,.00)");
  ctx.fillStyle = g;
  ctx.fillRect(0,y-60,W,120);
}

function drawFight(dt){
  // screen shake
  if(shake>0){
    shake = Math.max(0, shake - dt*30);
    const sx = (Math.random()*2-1) * shake;
    const sy = (Math.random()*2-1) * shake;
    ctx.save();
    ctx.translate(sx, sy);
  } else {
    ctx.save();
  }

  drawArena();

  // palettes
  drawFighter(aliza, ["rgba(0,0,0,.78)","rgba(56,246,255,.16)","rgba(56,246,255,ALPHA)"]);
  drawFighter(agent, ["rgba(0,0,0,.78)","rgba(255,80,200,.16)","rgba(255,80,200,ALPHA)"]);

  // winner text
  if(mode==="win" || mode==="lose"){
    ctx.fillStyle = mode==="win" ? "rgba(0,255,120,.85)" : "rgba(255,51,85,.85)";
    ctx.font = "bold 18px ui-monospace, Menlo, Consolas, monospace";
    const t = mode==="win" ? "YOU WIN" : "YOU LOSE";
    ctx.fillText(t, W/2 - 45, 110);
    ctx.font = "bold 12px ui-monospace, Menlo, Consolas, monospace";
    ctx.fillStyle = "rgba(230,241,255,.70)";
    ctx.fillText("Tap RESET RUN to try again", W/2 - 92, 132);
  }

  ctx.restore();
}

// Hook resetRun to also return to console + fight HUD off
const _resetRun = window.resetRun;
window.resetRun = function(){
  try{
    // hide fight UI
    FUI.hud.style.display = "none";
    FUI.mobile.style.display = "none";
    // show console
    UI.console.style.display = "grid";
    phase = "console";
    mode = "console";
    // restore compromised overlay text
    document.querySelector(".compSub").textContent = "SYSTEM GLYPH CORRUPTION // RESET REQUIRED";
  }catch{}
  _resetRun();
};


// =======================
// MAIN LOOP
// =======================
let last = performance.now();

function tick(now){
  const dt = Math.min(0.033, (now-last)/1000);
  last = now;

  drawBackground(dt);

  if(phase==="console" && defenseRunning && !compromised){
    defenseTime -= dt;
    UI.timer.textContent = "TIME LEFT: " + fmtTime(defenseTime);
    if(defenseTime <= 0){
      defenseTime = 0;
      UI.timer.textContent = "TIME LEFT: 00:00";
      triggerCompromised();
    }
  }

  if(phase==="fight"){
    if(mode==="fight") fightLoop(dt);
    drawFight(dt);
    updateHUD();
  }

  if(compromised && corruptLeft > 0){
    corruptLeft -= dt;
    UI.p1data.textContent = scrambleText(P1.instructions);
    UI.p2data.textContent = scrambleText(RAW_LOGS.join("\n"));
    UI.p3data.textContent = scrambleText(P3);
    UI.consoleBox.style.filter =
      `contrast(${1.0 + Math.random()*0.6}) brightness(${0.85 + Math.random()*0.5}) saturate(${1.0 + Math.random()*0.8})`;
    UI.compWrap.style.opacity = String(0.65 + Math.random()*0.35);
  } else if(compromised){
    UI.consoleBox.style.filter = "contrast(1.12) brightness(0.98)";
    UI.compWrap.style.opacity = "1";
  } else if(phase==="console") {
    UI.consoleBox.style.filter = "";
  }

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// Start audio on first interaction anywhere (mobile-friendly)
["pointerdown","touchstart","mousedown","keydown"].forEach(evt=>{
  window.addEventListener(evt, ()=>{
    initAudio();
    if(ac && ac.state === "suspended") ac.resume();
  }, { once:false, passive:true });
});

// Title screen: start game on click/touch
UI.title.addEventListener("click", ()=>{
  if(phase === "boot") begin();
});
UI.title.addEventListener("touchstart", (e)=>{
  if(phase === "boot"){
    e.preventDefault();
    begin();
  }
}, { passive: false });
