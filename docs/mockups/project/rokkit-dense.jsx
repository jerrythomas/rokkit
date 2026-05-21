/* Rokkit · Block Builder layout (dense alternative).
   ─ Full-width chat, inline artifact cards beneath responses.
   ─ Compact density · Linear/Cursor flavor · `/` command-bar feel.
   ─ Same components, same data, different chat shape.

   Exports: window.R.dense = { Welcome, Response }
*/

const _RD = window.R;
const {
  RokkitWordmark, RokkitMark, I: DI, componentIcon: DCI, kindIcon: DKI,
  TabsPreview: DTabs, CodeBlock: DCode, Chips: DChips,
  DensityTriplet: DDens, ModeToggle: DMode, STYLES: DSTYLES, sampleHistory: DHist,
} = _RD;
const { useState: dUseState } = React;

/* ───── Icon rail (thin nav) ─────────────────────────────────────── */
function Rail({ active = 'chat' }) {
  return (
    <nav className="k-rail">
      <div className="icb glyph" title="Rokkit"><RokkitMark size={20}/></div>
      <div className={`icb ${active === 'chat' ? 'active' : ''}`} title="Chat">{DI.chat}</div>
      <div className={`icb ${active === 'lib' ? 'active' : ''}`} title="Components">{DI.widget}</div>
      <div className={`icb ${active === 'docs' ? 'active' : ''}`} title="Docs">{DI.bookOpen}</div>
      <div className={`icb ${active === 'play' ? 'active' : ''}`} title="Playground">{DI.wand}</div>
      <div className={`icb ${active === 'theme' ? 'active' : ''}`} title="Theme">{DI.palette}</div>
      <div className="spacer"/>
      <div className="icb" title="History">{DI.history}</div>
      <div className="icb" title="Settings">{DI.settings}</div>
    </nav>
  );
}

/* ───── Top bar (denser variant) ─────────────────────────────────── */
function TopBar({ crumb, style, setStyle, density, setDensity, mode, setMode }) {
  const cur = DSTYLES.find(s => s.id === style) || DSTYLES[0];
  return (
    <div className="k-chrome" style={{ height: 40, padding: '0 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <RokkitWordmark height={18}/>
      </div>
      <div className="k-crumb" style={{ marginLeft: 10 }}>
        <span className="sep">/</span>{crumb}
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          height: 26, padding: '0 12px 0 10px',
          border: 'var(--hairline)', borderRadius: 6,
          background: 'var(--paper-2)',
          font: '400 12px var(--font-ui)', color: 'var(--ink-3)',
          cursor: 'pointer', minWidth: 320,
        }}>
          {DI.search}
          <span style={{ flex: 1, textAlign: 'left' }}>Search components, docs, history…</span>
          <span className="kbd">⌘K</span>
        </button>
      </div>
      <div className="k-prefs-strip">
        <span className="lbl">style</span>
        <button className="k-style-pill" onClick={() => setStyle(DSTYLES[(DSTYLES.indexOf(cur) + 1) % DSTYLES.length].id)}>
          <span className="swatch">{cur.colors.slice(0, 3).map((c, i) => <span key={i} style={{ background: c }}/>)}</span>
          {cur.label}
        </button>
        <div className="div"/>
        <DDens value={density} onChange={setDensity}/>
      </div>
      <DMode value={mode} onChange={setMode}/>
    </div>
  );
}

/* ───── Inline message (chat) ─────────────────────────────────────── */
function Msg({ role = 'user', icon, head, ago, children, kicker }) {
  const isUser = role === 'user';
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{
        width: 26, height: 26, flexShrink: 0,
        display: 'grid', placeItems: 'center',
        borderRadius: 4,
        border: 'var(--hairline)',
        background: isUser ? 'var(--paper-3)' : 'var(--accent-soft)',
        color: isUser ? 'var(--ink)' : 'var(--accent)',
      }}>{icon || (isUser ? DI.chat : DI.layers)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span style={{ font: '500 11px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{head}</span>
          {ago && <span style={{ font: '500 10.5px var(--font-mono)', color: 'var(--ink-4)' }}>{ago}</span>}
          {kicker && <span style={{ marginLeft: 'auto', font: '500 9.5px var(--font-mono)', padding: '2px 6px', borderRadius: 3, background: 'var(--accent-soft)', color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{kicker}</span>}
        </div>
        <div style={{ font: '400 13.5px var(--font-ui)', lineHeight: 1.55, color: 'var(--ink)' }}>{children}</div>
      </div>
    </div>
  );
}

/* ───── Thread (the main column) ──────────────────────────────────── */
function Thread({ children, placeholder = 'Ask · type / for commands', running }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--paper)' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 48px 32px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {children}
        </div>
      </div>
      <div style={{ borderTop: 'var(--hairline)', padding: '12px 48px 16px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div className="k-composer" style={{ padding: 0, borderTop: 0 }}>
            <div className="inner" style={{ padding: '8px 10px 6px' }}>
              <textarea rows={1} placeholder={placeholder} style={{ fontSize: 13, minHeight: 18 }}/>
              <div className="ctrl">
                <div className="left">
                  <button className="icb">{DI.attach}</button>
                  <button className="icb">{DI.command}</button>
                  <span style={{ font: '500 10px var(--font-mono)', color: 'var(--ink-4)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>/ for commands</span>
                </div>
                <div className="right">
                  <span className="hint"><span className="kbd">⌘</span> <span className="kbd">↵</span></span>
                  <button className="send accent">{running ? <span className="k-spinner"/> : DI.send}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───── Screens ──────────────────────────────────────────────────── */

function WelcomeDense() {
  const [style, setStyle] = dUseState('rokkit');
  const [density, setDensity] = dUseState('compact');
  const [mode, setMode] = dUseState('light');
  return (
    <div className="zs k-app" data-screen-label="Block · Welcome"
      data-theme={mode} data-style={style} data-density={density}>
      <TopBar crumb="new thread" style={style} setStyle={setStyle} density={density} setDensity={setDensity} mode={mode} setMode={setMode}/>
      <div className="k-stage">
        <Rail active="chat"/>
        <Thread placeholder="What would you like to build?">
          <div style={{ padding: '24px 0 12px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '4px 10px', border: 'var(--hairline)', borderRadius: 999, alignSelf: 'flex-start', background: 'var(--paper-2)', fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
              <span style={{ width: 5, height: 5, borderRadius: 2, background: 'var(--accent)' }}/>
              rokkit v2 · 47 components ready to mount
            </div>
            <h1 style={{ font: '300 32px/1.15 var(--font-display)', letterSpacing: '-0.025em', color: 'var(--ink)', margin: 0 }}>
              Pass the data.<br/>
              The component does the rest.
            </h1>
            <p style={{ font: '400 14px/1.6 var(--font-ui)', color: 'var(--ink-2)', margin: 0, maxWidth: 560 }}>
              Describe what you need — a tab strip, a tree, a table, a form. Rokkit mounts the right component live, in the style you've picked, with sample data you can replace.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8, maxWidth: 640 }}>
              {[
                { kind: 'build', icon: DI.layers,   t: 'Mount a Tabs demo with 5 panes' },
                { kind: 'docs',  icon: DI.question, t: 'How do data-driven controls work?' },
                { kind: 'theme', icon: DI.palette,  t: 'Apply our brand palette to everything' },
                { kind: 'build', icon: DI.table,    t: 'Sortable data table with a sparkline cell' },
                { kind: 'docs',  icon: DI.question, t: 'When to use Tree vs List?' },
                { kind: 'build', icon: DI.widget,   t: 'Multi-select with async search' },
              ].map((p, i) => (
                <button key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  border: 'var(--hairline)', borderRadius: 6,
                  background: 'var(--paper)',
                  textAlign: 'left', cursor: 'pointer',
                }}>
                  <span style={{ color: 'var(--accent)', display: 'grid', placeItems: 'center', width: 16 }}>{p.icon}</span>
                  <span style={{ font: '400 13px var(--font-ui)', color: 'var(--ink)', flex: 1 }}>{p.t}</span>
                  <span style={{ font: '500 9.5px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: 3, background: 'var(--paper-2)' }}>{p.kind}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <span style={{ font: '500 10.5px var(--font-mono)', color: 'var(--ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>tip</span>
              <span style={{ font: '400 12px var(--font-ui)', color: 'var(--ink-3)' }}>
                Type <span style={{ font: '500 11.5px var(--font-mono)', color: 'var(--ink-2)', padding: '1px 5px', borderRadius: 3, background: 'var(--paper-2)' }}>/</span> for a command palette · <span style={{ font: '500 11.5px var(--font-mono)', color: 'var(--ink-2)', padding: '1px 5px', borderRadius: 3, background: 'var(--paper-2)' }}>@</span> to reference a component by name
              </span>
            </div>
          </div>
        </Thread>
      </div>
    </div>
  );
}

function ResponseDense() {
  const [style, setStyle] = dUseState('rokkit');
  const [density, setDensity] = dUseState('compact');
  const [mode, setMode] = dUseState('light');
  const code = `<script>
  import { Tabs } from '@rokkit/ui'

  let items = $state([
    { label: 'Overview',  content: ... },
    { label: 'Theming',   content: ... },
    { label: 'Anatomy',   content: ... },
    { label: 'A11y',      content: ... },
    { label: 'API',       content: ... },
  ])
  let value = $state(null)
</script>

<Tabs bind:items bind:value />`;
  return (
    <div className="zs k-app" data-screen-label="Block · Response"
      data-theme={mode} data-style={style} data-density={density}>
      <TopBar crumb={<><span>Tabs</span><span className="sep">·</span><span>mounted</span></>}
        style={style} setStyle={setStyle} density={density} setDensity={setDensity} mode={mode} setMode={setMode}/>
      <div className="k-stage">
        <Rail active="chat"/>
        <Thread placeholder="Refine, theme, ask follow-ups…">
          <Msg role="user" head="YOU · Jerry" ago="2m">
            Mount a Tabs demo with 5 panes. Walk me through how the data-driven API works.
          </Msg>

          <Msg role="assistant" head="ROKKIT" ago="just now" icon={DI.layers} kicker="mounted">
            Mounted <code style={{ font: '500 12px var(--font-mono)', padding: '1px 5px', borderRadius: 3, background: 'var(--paper-2)', border: 'var(--hairline)' }}>&lt;Tabs/&gt;</code> below — 5 panes from one items array. The look comes from <code style={{ font: '500 12px var(--font-mono)', padding: '1px 5px', borderRadius: 3, background: 'var(--paper-2)', border: 'var(--hairline)' }}>data-style={'"'}{style}{'"'}</code> on the parent — flip the style toggle above to re-theme.
          </Msg>

          <div style={{ paddingLeft: 38 }}>
            <div className="k-rcard">
              <div className="hd">
                <div className="ttl">
                  <span className="icon">{DI.layers}</span>
                  <span className="name">&lt;Tabs/&gt;</span>
                  <span className="meta">· @rokkit/ui · style={style}</span>
                </div>
                <span className="kicker">LIVE</span>
              </div>
              <div className="body"><DTabs style={style} active={1}/></div>
              <div className="ft">
                <div className="props">
                  <span>items</span><span className="v">[5]</span>
                  <span className="sep">·</span>
                  <span>style</span><span className="v">{style}</span>
                  <span className="sep">·</span>
                  <span>bytes</span><span className="v">2.1kb</span>
                </div>
                <div className="actions">
                  <button>{DI.copy} Copy</button>
                  <button>{DI.download} Download</button>
                  <button>{DI.code} Edit</button>
                </div>
              </div>
            </div>
          </div>

          <Msg role="assistant" head="ROKKIT" ago="" icon={DI.code}>
            <div>The Svelte source — items in, value out, snippets-not-slots:</div>
            <div style={{ marginTop: 8 }}>
              <DCode filename="Tabs.demo.svelte" language="svelte" code={code}/>
            </div>
          </Msg>

          <Msg role="assistant" head="ROKKIT" ago="" icon={DI.palette}>
            <div>The four levers — every component honors them — are surfaced as global preferences:</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              {[
                { ic: DI.palette, name: 'data-style', value: style, desc: 'thematic character — zen-sumi · rokkit · minimal · material' },
                { ic: DI.moon,    name: 'data-mode',  value: mode,    desc: 'light · dark · auto' },
                { ic: DI.densComfortable, name: 'data-density', value: density, desc: 'compact · cozy · comfortable' },
                { ic: DI.layers,  name: 'skin',       value: 'warm-gray + shu', desc: 'role × palette × step mapping (per mode)' },
              ].map((t, i) => (
                <div key={i} style={{ padding: '8px 10px', border: 'var(--hairline)', borderRadius: 5, background: 'var(--paper)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--accent)', display: 'grid', placeItems: 'center' }}>{t.ic}</span>
                    <span style={{ font: '500 11.5px var(--font-mono)', color: 'var(--ink)' }}>{t.name}</span>
                    <span style={{ font: '500 11.5px var(--font-mono)', color: 'var(--accent)' }}>= {t.value}</span>
                  </div>
                  <div style={{ font: '400 11.5px var(--font-ui)', color: 'var(--ink-3)', marginTop: 4 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </Msg>

          <div style={{ display: 'flex', gap: 6, paddingLeft: 38, flexWrap: 'wrap', marginTop: 4 }}>
            <DChips items={[
              { icon: DI.palette,  label: 'switch style' },
              { icon: DI.refresh,  label: 'wire to real data' },
              { icon: DI.download, label: 'export as Svelte file' },
            ]}/>
          </div>
        </Thread>
      </div>
    </div>
  );
}

window.R.dense = { Welcome: WelcomeDense, Response: ResponseDense };
