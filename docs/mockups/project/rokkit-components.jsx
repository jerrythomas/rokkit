/* Rokkit · shared UI primitives.
   Hand-built inline SVGs (no Iconify fetch for stability). Components are
   intentionally tiny — most layout work happens in CSS / variant files. */

const R = window.R = window.R || {};
const { useState } = React;

/* ───── Rokkit logo + mark ────────────────────────────────────────── */
function RokkitWordmark({ height = 28 }) {
  return <img src="assets/rokkit-wordmark.svg" alt="Rokkit"
    style={{ height, width: 'auto', display: 'block' }} />;
}
R.RokkitWordmark = RokkitWordmark;

/* Simplified rocket mark for in-app chrome — uses the wordmark scaled tight. */
function RokkitMark({ size = 22 }) {
  // Inline a minimal rocket silhouette in the brand red. Mirrors the
  // shape language of the uploaded rokkit.svg without the wordmark.
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none">
      <defs>
        <linearGradient id="rmark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FDD661"/>
          <stop offset="0.65" stopColor="#F47144"/>
          <stop offset="1" stopColor="#EF4136"/>
        </linearGradient>
      </defs>
      <path d="M16 3 C 22 7, 22 16, 19 21 L 13 21 C 10 16, 10 7, 16 3 Z" fill="url(#rmark)"/>
      <path d="M19 21 L 22 24 L 19 23 Z" fill="#F47144"/>
      <path d="M13 21 L 10 24 L 13 23 Z" fill="#F47144"/>
      <circle cx="16" cy="12" r="2.6" fill="#fff" stroke="#EF4136" strokeWidth="0.8"/>
      <path d="M14 25 Q 16 28, 18 25 L 17 30 L 15 30 Z" fill="#FDD661" opacity="0.85"/>
    </svg>
  );
}
R.RokkitMark = RokkitMark;

/* ───── Icon set (inline SVGs) ───────────────────────────────────── */
const I = {
  send: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8 L14 2 L10 14 L8 9 L2 8 Z"/></svg>,
  arrowRight: <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7 L11 7 M7.5 3.5 L11 7 L7.5 10.5"/></svg>,
  arrowUp: <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11 L7 3 M3.5 6.5 L7 3 L10.5 6.5"/></svg>,
  attach: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M11.5 5.5 L6.5 10.5 a 2 2 0 1 0 2.83 2.83 L13.5 9.16 a 4 4 0 0 0 -5.66 -5.66 L3.16 8.16"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5 L14 14"/></svg>,
  plus: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M7 2 L7 12 M2 7 L12 7"/></svg>,
  close: <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3 L11 11 M11 3 L3 11"/></svg>,
  more: <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><circle cx="3" cy="7" r="1.2"/><circle cx="7" cy="7" r="1.2"/><circle cx="11" cy="7" r="1.2"/></svg>,
  sun: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="7" cy="7" r="2.4"/><path d="M7 1 v1.5 M7 11.5 v1.5 M1 7 h1.5 M11.5 7 h1.5 M2.7 2.7 l1 1 M10.3 10.3 l1 1 M2.7 11.3 l1 -1 M10.3 3.7 l1 -1"/></svg>,
  moon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"><path d="M11.5 8.5 A 5 5 0 1 1 5.5 2.5 A 4 4 0 0 0 11.5 8.5 Z"/></svg>,
  voice: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="5" y="1.5" width="4" height="7" rx="2"/><path d="M2.5 6.5 a 4.5 4.5 0 0 0 9 0 M7 11 v1.5 M5 12.5 h4"/></svg>,
  copy: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><rect x="2" y="2" width="8" height="8" rx="1.5"/><path d="M5 12 h6 a1 1 0 0 0 1 -1 V5"/></svg>,
  download: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 2 v6.5 M4 5.5 L7 8.5 L10 5.5 M2.5 11 h9"/></svg>,
  refresh: <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7 a5 5 0 0 1 8.5 -3.5 L12 5 M12 2 V5 H9 M12 7 a5 5 0 0 1 -8.5 3.5 L2 9 M2 12 V9 H5"/></svg>,
  share: <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1.5 v8 M4.5 4 L7 1.5 L9.5 4 M2.5 8 v3 a1 1 0 0 0 1 1 h7 a1 1 0 0 0 1 -1 v -3"/></svg>,
  history: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="7" cy="7" r="5"/><path d="M7 4 V7 L9 8.5"/></svg>,
  settings: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="7" cy="7" r="1.6"/><path d="M7 1.5 v1.5 M7 11 v1.5 M1.5 7 h1.5 M11 7 h1.5 M3.5 3.5 l1 1 M9.5 9.5 l1 1 M3.5 10.5 l1 -1 M9.5 4.5 l1 -1" strokeLinecap="round"/></svg>,
  panel: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="2" y="2.5" width="10" height="9" rx="1"/><path d="M6 2.5 V11.5"/></svg>,
  command: <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M4 4 a2 2 0 1 1 2 2 H4 V4 Z M10 4 a2 2 0 1 0 -2 2 h2 V4 Z M4 10 a2 2 0 1 0 2 -2 H4 v2 Z M10 10 a2 2 0 1 1 -2 -2 h2 v2 Z"/></svg>,
  /* component / category icons */
  widget: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="2" width="5" height="5" rx="0.8"/><rect x="9" y="2" width="5" height="5" rx="0.8"/><rect x="2" y="9" width="5" height="5" rx="0.8"/><rect x="9" y="9" width="5" height="5" rx="0.8"/></svg>,
  palette: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M8 2 a 6 6 0 0 0 0 12 a 2 2 0 0 0 0 -4 h 1.5 a 4 4 0 0 0 4 -4 c 0 -2.2 -2.5 -4 -5.5 -4 Z"/><circle cx="5" cy="6" r="0.9" fill="currentColor"/><circle cx="8" cy="4" r="0.9" fill="currentColor"/><circle cx="11" cy="6" r="0.9" fill="currentColor"/><circle cx="11.5" cy="9" r="0.9" fill="currentColor"/></svg>,
  bookOpen: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"><path d="M8 4 C 6 2.5, 3 2.5, 2 3 v 9 c 1 -0.5 4 -0.5 6 1 v -9 Z M8 4 C 10 2.5, 13 2.5, 14 3 v 9 c -1 -0.5 -4 -0.5 -6 1 v -9 Z"/></svg>,
  question: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="7" cy="7" r="5"/><path d="M5.5 5.5 a 1.5 1.5 0 0 1 3 0 c 0 1 -1.5 1.5 -1.5 2.5 M7 10 v 0.2" strokeLinecap="round"/></svg>,
  wand: <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13 L 11 5 M 10 4 L 12 6 M 12 2 V 4 M 14 4 H 16 M 14 2 L 12 0"/></svg>,
  layers: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"><path d="M7 1.5 L 12.5 4.5 L 7 7.5 L 1.5 4.5 Z M 2 7 L 7 9.7 L 12 7 M 2 9.5 L 7 12.2 L 12 9.5"/></svg>,
  chat: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"><path d="M2 4 a 1.5 1.5 0 0 1 1.5 -1.5 h 7 a 1.5 1.5 0 0 1 1.5 1.5 v 4 a 1.5 1.5 0 0 1 -1.5 1.5 h -4 L 4 11.5 v -2 H 3.5 A 1.5 1.5 0 0 1 2 8 Z"/></svg>,
  code: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4 L 2 7 L 5 10 M 9 4 L 12 7 L 9 10"/></svg>,
  pin: <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M9 1.5 L12.5 5 L10 7.5 L7 6 L4 9 L3 12 L5 9 L8 8 M3 12 L5.5 9.5"/></svg>,
  table: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="2" y="3" width="10" height="8" rx="0.8"/><path d="M2 6 H 12 M 7 3 V 11"/></svg>,
  list: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2.5 4 H 11.5 M 2.5 7 H 11.5 M 2.5 10 H 11.5"/><circle cx="1" cy="4" r="0.5" fill="currentColor"/><circle cx="1" cy="7" r="0.5" fill="currentColor"/><circle cx="1" cy="10" r="0.5" fill="currentColor"/></svg>,
  tree: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M3 2 v 10 M 3 5 H 7 V 4 M 3 8 H 7 V 7 M 3 11 H 7 V 10 M 9 4 H 12 M 9 7 H 12 M 9 10 H 12"/></svg>,
  form: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="2" y="2" width="10" height="3" rx="0.6"/><rect x="2" y="6.5" width="10" height="2" rx="0.5"/><rect x="2" y="9.5" width="6" height="2" rx="0.5"/></svg>,
  chart: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 11 H 12 M 2 11 V 3 M 4 9 L 6 6 L 9 8 L 12 3"/></svg>,
  /* density icons — three bars at different spacing.
     compact = tight rhythm, cozy = mid, comfortable = wide. */
  densCompact: <svg width="13" height="13" viewBox="0 0 14 14"><rect x="2" y="3" width="10" height="1.5" rx="0.7" fill="currentColor"/><rect x="2" y="6.25" width="10" height="1.5" rx="0.7" fill="currentColor"/><rect x="2" y="9.5" width="10" height="1.5" rx="0.7" fill="currentColor"/></svg>,
  densCozy: <svg width="13" height="13" viewBox="0 0 14 14"><rect x="2" y="2.5" width="10" height="1.5" rx="0.7" fill="currentColor"/><rect x="2" y="6.25" width="10" height="1.5" rx="0.7" fill="currentColor"/><rect x="2" y="10" width="10" height="1.5" rx="0.7" fill="currentColor"/></svg>,
  densComfortable: <svg width="13" height="13" viewBox="0 0 14 14"><rect x="2" y="1.5" width="10" height="1.5" rx="0.7" fill="currentColor"/><rect x="2" y="6.25" width="10" height="1.5" rx="0.7" fill="currentColor"/><rect x="2" y="11" width="10" height="1.5" rx="0.7" fill="currentColor"/></svg>,
};
R.I = I;

/* Component-name to icon — used in conversation list and response cards. */
const componentIcon = {
  Tabs: I.layers, List: I.list, Tree: I.tree, Table: I.table,
  Form: I.form, Chart: I.chart, Combo: I.list, Stepper: I.list,
  MultiSelect: I.widget,
};
R.componentIcon = componentIcon;

/* History category → icon. */
R.kindIcon = (kind) => {
  if (kind === 'theme') return I.palette;
  if (kind === 'how') return I.question;
  if (kind === 'docs') return I.bookOpen;
  return I.widget; // component / build
};

/* ───── Step row ─────────────────────────────────────────────────── */
function StepRow({ kind = 'info', icon, head, who, ago, children, isUser }) {
  const nodeClass = isUser ? 'node user' : (kind === 'think' ? 'node think' : 'node ic');
  return (
    <div className={`k-step ${isUser ? 'user' : ''}`}>
      <span className={nodeClass}>{icon || (kind === 'think'
        ? <span className="thinking-dots"><span/><span/><span/></span>
        : <span style={{ width: 4, height: 4, borderRadius: 2, background: 'currentColor', opacity: 0.6 }}/>)}</span>
      <div className="head">
        <span>{head}</span>
        {who && <span className="who">{who}</span>}
        {ago && <span className="ago">{ago}</span>}
      </div>
      {children && <div className="body">{children}</div>}
    </div>
  );
}
R.StepRow = StepRow;

/* ───── Suggestion chips ─────────────────────────────────────────── */
function Chips({ items = [], solid = false }) {
  return (
    <div className="k-suggestions">
      {items.map((it, i) => (
        <button key={i} className={`k-chip ${solid ? 'solid' : ''}`}>
          {it.icon && <span className="gl">{it.icon}</span>}
          {it.label}
        </button>
      ))}
    </div>
  );
}
R.Chips = Chips;

/* ───── Composer ─────────────────────────────────────────────────── */
function Composer({ placeholder = 'Ask anything…', value = '', running, hint, accent = false, slim = false }) {
  return (
    <div className="k-composer" style={slim ? { padding: 0, borderTop: 0 } : null}>
      <div className="inner">
        <textarea rows={1} placeholder={placeholder} defaultValue={value}/>
        <div className="ctrl">
          <div className="left">
            <button className="icb" title="Attach">{I.attach}</button>
            <button className="icb" title="Voice">{I.voice}</button>
            <button className="icb" title="Commands">{I.command}</button>
          </div>
          <div className="right">
            <span className="hint">{hint || <><span className="kbd">⌘</span> <span className="kbd">↵</span> to send</>}</span>
            <button className={`send ${accent ? 'accent' : ''}`} title="Send">
              {running ? <span className="k-spinner"/> : I.send}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
R.Composer = Composer;

/* ───── Code block — copyable / downloadable ─────────────────────── */
function CodeBlock({ filename, language = 'svelte', code, height }) {
  // Simple syntax-tint: highlight strings, kw, comments via regex replacement.
  // Stays display-only; no editing.
  const tint = (line) => {
    // Render to React with subdued color highlights.
    const parts = [];
    let rest = line;
    const push = (text, cls) => parts.push({ text, cls });
    // Naive: handle comments first
    const cIdx = rest.indexOf('//');
    if (cIdx !== -1) {
      push(rest.slice(0, cIdx), '');
      push(rest.slice(cIdx), 'co');
      return parts;
    }
    // Tokenize by simple regex
    const re = /(<[^>]+>)|(\{[^}]+\})|('[^']*'|"[^"]*"|`[^`]*`)|\b(const|let|var|import|from|export|default|function|return|if|else|new|class|async|await)\b/g;
    let lastIdx = 0; let m;
    while ((m = re.exec(rest)) !== null) {
      if (m.index > lastIdx) push(rest.slice(lastIdx, m.index), '');
      if (m[1]) push(m[1], 'tag');
      else if (m[2]) push(m[2], 'expr');
      else if (m[3]) push(m[3], 'str');
      else if (m[4]) push(m[4], 'kw');
      lastIdx = re.lastIndex;
    }
    if (lastIdx < rest.length) push(rest.slice(lastIdx), '');
    return parts;
  };
  return (
    <div className="k-code">
      <div className="hd">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--ink-3)' }}>{I.code}</span>
          <span style={{ font: '500 11.5px var(--font-mono)', color: 'var(--ink-2)' }}>{filename}</span>
          <span style={{ font: '500 10px var(--font-mono)', color: 'var(--ink-4)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '2px 6px', border: 'var(--hairline)', borderRadius: 3 }}>{language}</span>
        </div>
        <div style={{ display: 'inline-flex', gap: 2 }}>
          <button title="Copy">{I.copy}<span>Copy</span></button>
          <button title="Download">{I.download}<span>.svelte</span></button>
        </div>
      </div>
      <pre style={height ? { maxHeight: height } : null}>
{code.split('\n').map((line, i) => (
  <code key={i}>
    <span className="ln">{String(i + 1).padStart(2, ' ')}</span>
    <span>{tint(line).map((p, j) =>
      p.cls ? <span key={j} className={p.cls}>{p.text}</span> : <React.Fragment key={j}>{p.text}</React.Fragment>
    )}</span>
  </code>
))}
      </pre>
    </div>
  );
}
R.CodeBlock = CodeBlock;

/* ───── Density / mode toggle controls ───────────────────────────── */
function DensityTriplet({ value = 'cozy', onChange }) {
  const opts = [
    { id: 'compact',     icon: I.densCompact,     label: 'Compact' },
    { id: 'cozy',        icon: I.densCozy,        label: 'Cozy' },
    { id: 'comfortable', icon: I.densComfortable, label: 'Comfortable' },
  ];
  return (
    <div className="k-toggle-trio" role="group" aria-label="Density">
      {opts.map(o => (
        <button key={o.id} className={o.id === value ? 'on' : ''} title={o.label}
          onClick={() => onChange && onChange(o.id)}>{o.icon}</button>
      ))}
    </div>
  );
}
R.DensityTriplet = DensityTriplet;

function ModeToggle({ value = 'light', onChange }) {
  return (
    <button className="k-mode-toggle"
      title={value === 'dark' ? 'Light mode' : 'Dark mode'}
      onClick={() => onChange && onChange(value === 'dark' ? 'light' : 'dark')}>
      {value === 'dark' ? I.sun : I.moon}
    </button>
  );
}
R.ModeToggle = ModeToggle;

function StyleSwatch({ id, label, swatchColors, on, onClick }) {
  // Each style preset has 3 swatch colors representing paper/ink/accent.
  return (
    <button className={`k-style-sw ${on ? 'on' : ''}`} onClick={onClick} title={label}>
      <span className="swr">
        {swatchColors.map((c, i) => <span key={i} style={{ background: c }}/>)}
      </span>
      <span className="lbl">{label}</span>
    </button>
  );
}
R.StyleSwatch = StyleSwatch;

/* The four built-in styles. Each has its own paper/ink/accent expression. */
const STYLES = [
  { id: 'zen-sumi', label: 'zen-sumi', colors: ['#F7F3EA', '#2A2925', '#A83D1F'] },
  { id: 'rokkit',   label: 'rokkit',   colors: ['#FFFFFF', '#1F2937', '#EF4136'] },
  { id: 'minimal',  label: 'minimal',  colors: ['#FAFAFA', '#0A0A0A', '#0A0A0A'] },
  { id: 'material', label: 'material', colors: ['#FFFFFF', '#1F1F1F', '#6750A4'] },
];
R.STYLES = STYLES;

/* ───── Themed Tabs preview — pure CSS, no "variant" prop.
   The component is identical; what changes is data-style on the parent. */
function TabsPreview({ style = 'zen-sumi', active = 1, items }) {
  const tabs = items || ['Overview', 'Theming', 'Anatomy', 'A11y', 'API'];
  return (
    <div className={`k-tabs k-tabs-${style}`} data-style={style}>
      <div className="bar">
        {tabs.map((t, i) => (
          <button key={i} className={i === active ? 'on' : ''}>{t}</button>
        ))}
      </div>
      <div className="cnt">
        <strong>Theming · data-driven</strong>
        <p>One component definition. The look — bar, indicator, density — comes from <code>data-style</code>, <code>data-density</code>, <code>data-mode</code> on the parent. Same items in, same value out.</p>
      </div>
    </div>
  );
}
R.TabsPreview = TabsPreview;

/* ───── Response card grammar (header / body / footer w/ actions) ── */
function ResponseCard({ icon, name, meta, kicker, kickerColor, children, propsRow, actions = ['Copy code', 'Download', 'Edit'] }) {
  return (
    <div className="k-rcard">
      <div className="hd">
        <div className="ttl">
          {icon && <span className="icon">{icon}</span>}
          <span className="name">{name}</span>
          {meta && <span className="meta">{meta}</span>}
        </div>
        {kicker && (
          <span className="kicker" style={kickerColor ? { color: kickerColor, borderColor: kickerColor, background: `color-mix(in oklab, ${kickerColor} 12%, transparent)` } : null}>
            {kicker}
          </span>
        )}
      </div>
      <div className="body">{children}</div>
      <div className="ft">
        <div className="props">
          {propsRow || <><span>import from</span><span className="v">@rokkit/ui</span></>}
        </div>
        <div className="actions">
          {actions.map((a, i) => (
            <button key={i}>
              {i === 0 ? I.copy : i === 1 ? I.download : I.code}
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
R.ResponseCard = ResponseCard;

/* ───── Conversation list (sidebar populated state) ──────────────── */
const sampleHistory = {
  today: [
    { id: 'h1', kind: 'build', component: 'Tabs',  title: 'Show me how Tabs work', ago: '12m' },
    { id: 'h2', kind: 'theme', title: 'Theme for our brand red', ago: '47m' },
    { id: 'h3', kind: 'how',   title: 'How do I bind a list to async data?', ago: '2h' },
    { id: 'h4', kind: 'build', component: 'MultiSelect', title: 'Multi-select with chip overflow', ago: '3h' },
  ],
  yesterday: [
    { id: 'h5', kind: 'build', component: 'Tree',  title: 'Compare List vs Tree', ago: 'yest' },
    { id: 'h6', kind: 'how',   title: 'A11y for tree navigation', ago: 'yest' },
    { id: 'h7', kind: 'build', component: 'Form',  title: 'Form validation · per-field', ago: 'yest' },
  ],
  older: [
    { id: 'h8', kind: 'docs',  title: 'When to use Combo vs Select?', ago: 'Mon' },
    { id: 'h9', kind: 'theme', title: 'Custom skin from brand palette', ago: 'Sun' },
    { id: 'h10', kind: 'build', component: 'Stepper', title: 'Stepper · 5-step onboarding', ago: 'Sun' },
    { id: 'h11', kind: 'build', component: 'Chart', title: 'Embed a sparkline chart', ago: 'last wk' },
  ],
};
R.sampleHistory = sampleHistory;

function ConvList({ activeId, collapsed = false }) {
  const groups = [
    { label: 'Today', items: sampleHistory.today },
    { label: 'Yesterday', items: sampleHistory.yesterday },
    { label: 'Earlier this week', items: sampleHistory.older },
  ];
  if (collapsed) {
    // Compact icon-only list
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 0' }}>
        {[...sampleHistory.today, ...sampleHistory.yesterday].slice(0, 8).map(it => (
          <div key={it.id} className={`k-conv-mini ${it.id === activeId ? 'active' : ''}`} title={it.title}>
            {R.kindIcon(it.kind)}
          </div>
        ))}
      </div>
    );
  }
  return (
    <>
      {groups.map(g => (
        <React.Fragment key={g.label}>
          <div className="group-label">{g.label}</div>
          {g.items.map(it => (
            <div key={it.id} className={`k-conv ${it.id === activeId ? 'active' : ''}`}>
              <span className="ic">{R.kindIcon(it.kind)}</span>
              <span className="ttl">{it.title}</span>
              <span className="when">{it.ago}</span>
            </div>
          ))}
        </React.Fragment>
      ))}
    </>
  );
}
R.ConvList = ConvList;
