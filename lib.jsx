// Shared utilities, icons, color palette, sound effects

// ============ COLOR PALETTE ============
// Curated kit-color palette - football jersey-ish
const KIT_COLORS = [
  { name: 'אדום', hex: '#dc2626' },
  { name: 'כחול', hex: '#2563eb' },
  { name: 'תכלת', hex: '#38bdf8' },
  { name: 'ירוק', hex: '#16a34a' },
  { name: 'צהוב', hex: '#facc15' },
  { name: 'כתום', hex: '#f97316' },
  { name: 'סגול', hex: '#9333ea' },
  { name: 'ורוד', hex: '#ec4899' },
  { name: 'שחור', hex: '#0c1421' },
  { name: 'לבן', hex: '#f8fafc' },
  { name: 'אפור', hex: '#64748b' },
  { name: 'חום', hex: '#78350f' },
  { name: 'טורקיז', hex: '#06b6d4' },
  { name: 'ליים', hex: '#84cc16' },
];

// Default team name suggestions
const TEAM_SUGGESTIONS = [
  'הברקים', 'הנמרים', 'הכרישים', 'הזאבים',
  'האריות', 'הנשרים', 'הדרקונים', 'הפנתרים',
  'הקוסמים', 'הגיבורים', 'האלופים', 'הכוכבים',
  'הסופות', 'הרעמים', 'הנינג׳ות', 'הגלקטיקה',
];

// Default player names
const DEFAULT_PLAYERS = [
  'דני', 'יוסי', 'תום', 'איתי', 'רון', 'גיא',
  'נועם', 'עידו', 'אורי', 'אריאל', 'יותם',
];

// ============ ICONS ============
const Icon = {
  Ball: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15"/>
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
      <polygon points="12,7 15.5,9.5 14,13.5 10,13.5 8.5,9.5" fill="currentColor"/>
    </svg>
  ),
  Whistle: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a6 6 0 0 1 6-6h6l5-3v18l-5-3H9a6 6 0 0 1-6-6Z"/>
      <circle cx="9" cy="12" r="2"/>
    </svg>
  ),
  Play: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>
  ),
  Pause: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1"/>
      <rect x="14" y="5" width="4" height="14" rx="1"/>
    </svg>
  ),
  Stop: ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2"/>
    </svg>
  ),
  Check: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  X: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  ),
  Plus: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  Minus: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M5 12h14"/>
    </svg>
  ),
  ArrowRight: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 6 6 6-6 6"/>
    </svg>
  ),
  ArrowLeft: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 6-6 6 6 6"/>
    </svg>
  ),
  Trophy: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  Shuffle: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 14 4 4-4 4"/>
      <path d="m18 2 4 4-4 4"/>
      <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/>
      <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/>
      <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>
    </svg>
  ),
  Back: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  ),
  Trash: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Volume: ({ size = 18, muted }) => muted ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4V5z"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4V5z"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  ),
  Card: ({ size = 16, type = 'yellow' }) => (
    <svg width={size * 0.75} height={size} viewBox="0 0 12 16">
      <rect width="12" height="16" rx="1.5" fill={type === 'yellow' ? '#facc15' : '#dc2626'}/>
    </svg>
  ),
};

// ============ UTIL ============
const uid = () => Math.random().toString(36).slice(2, 9);

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const roundName = (round) => {
  switch (round) {
    case 'round32': return 'שלב ה-32';
    case 'round16': return 'שמינית גמר';
    case 'quarter': return 'רבע גמר';
    case 'semi': return 'חצי גמר';
    case 'third': return 'משחק על המקום השלישי';
    case 'final': return 'גמר';
    default: return round;
  }
};

const formatTime = (totalSec) => {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const isLightColor = (hex) => {
  // simple luminance check for choosing dark or light text
  const c = hex.replace('#','');
  const r = parseInt(c.substring(0,2),16);
  const g = parseInt(c.substring(2,4),16);
  const b = parseInt(c.substring(4,6),16);
  const l = (0.299*r + 0.587*g + 0.114*b) / 255;
  return l > 0.7;
};

// ============ SOUND EFFECTS ============
// Web-Audio-API generated sounds; no external assets
let _audioCtx = null;
const getAudioCtx = () => {
  if (!_audioCtx) {
    try {
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return null; }
  }
  return _audioCtx;
};

const soundMuted = () => localStorage.getItem('noam_muted') === '1';
const setSoundMuted = (v) => localStorage.setItem('noam_muted', v ? '1' : '0');

const playTone = (freq, dur = 0.15, type = 'sine', vol = 0.2, delay = 0) => {
  if (soundMuted()) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
};

const sounds = {
  whistle: () => {
    // Quick high pip-pip
    playTone(2200, 0.12, 'square', 0.15, 0);
    playTone(2400, 0.10, 'square', 0.15, 0.14);
  },
  longWhistle: () => {
    if (soundMuted()) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2200, t0);
    osc.frequency.linearRampToValueAtTime(2000, t0 + 0.7);
    osc.frequency.linearRampToValueAtTime(2300, t0 + 1.0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.15, t0 + 0.05);
    gain.gain.setValueAtTime(0.15, t0 + 0.85);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.0);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 1.05);
  },
  goal: () => {
    // Cheer-y rising tone
    playTone(523, 0.12, 'triangle', 0.2, 0);
    playTone(659, 0.12, 'triangle', 0.2, 0.11);
    playTone(784, 0.20, 'triangle', 0.22, 0.22);
  },
  click: () => {
    playTone(1100, 0.04, 'sine', 0.1, 0);
  },
  warn: () => {
    playTone(440, 0.08, 'sawtooth', 0.15, 0);
    playTone(440, 0.08, 'sawtooth', 0.15, 0.1);
  },
  win: () => {
    [523, 659, 784, 1046].forEach((f, i) => playTone(f, 0.2, 'triangle', 0.2, i * 0.12));
  },
};

// ============ PERSISTENCE ============
const SAVE_KEY = 'noam_tournament_v1';
const saveState = (state) => {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
};
const loadState = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
};
const clearState = () => localStorage.removeItem(SAVE_KEY);

// ============ TEAM FLAG (used everywhere) ============
const TeamFlag = ({ colors, className = '' }) => {
  const cs = colors && colors.length ? colors : ['#94a3b8'];
  return (
    <div className={className} style={{ display: 'flex' }}>
      {cs.map((c, i) => <div key={i} style={{ background: c }} />)}
    </div>
  );
};

// ============ EXPORT ============
Object.assign(window, {
  KIT_COLORS, TEAM_SUGGESTIONS, DEFAULT_PLAYERS,
  Icon, TeamFlag,
  uid, shuffle, roundName, formatTime, isLightColor,
  sounds, soundMuted, setSoundMuted,
  saveState, loadState, clearState,
});
