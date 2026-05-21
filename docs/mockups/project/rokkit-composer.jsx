/* Rokkit · primary chat product (the "Composer" layout the user preferred).
   ─ Layout:  [history sidebar (collapsible)] [chat-left] [canvas-right]
   ─ Wired toggles: light/dark works; style + density are real controls
   ─ Theme wizard rebuilt with style → skin → typography flow
   ─ Tabs response uses themed preview (no "variant" prop) + copyable code

   Exports: window.R.composer = { Welcome, Thinking, Tabs, Wizard, Dark }
*/

const _RC = window.R;
const {
  RokkitWordmark, RokkitMark, I, componentIcon, kindIcon,
  StepRow, Chips, Composer, ResponseCard, CodeBlock, TabsPreview,
  DensityTriplet, ModeToggle, StyleSwatch, STYLES, ConvList, sampleHistory,
} = _RC;
const { useState } = React;

/* ───── Chrome (with working preference controls) ─────────────────── */
function Chrome({ crumb, mode, setMode, style, setStyle, density, setDensity }) {
  const currentStyle = STYLES.find(s => s.id === style) || STYLES[0];
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <div className="k-chrome">
      <div className="k-traffic"><span/><span/><span/></div>
      <div className="k-brand" style={{ marginLeft: 8 }}>
        <RokkitWordmark height={20}/>
      </div>
      {crumb && (
        <div className="k-crumb" style={{ marginLeft: 14 }}>
          <span className="sep">/</span>
          {crumb}
        </div>
      )}
      <div className="k-spacer"/>

      {/* Preferences strip */}
      <div className="k-prefs-strip">
        {/* Style */}
        <span className="lbl">style</span>
        <button className="k-style-pill" onClick={() => setPickerOpen(o => !o)}>
          <span className="swatch">
            {currentStyle.colors.slice(0, 3).map((c, i) => <span key={i} style={{ background: c }}/>)}
          </span>
          {currentStyle.label}
        </button>
        {pickerOpen && (
          <div style={{
            position: 'absolute', top: 38, right: 110, zIndex: 30,
            background: 'var(--paper)', border: 'var(--hairline)', borderRadius: 8,
            boxShadow: 'var(--shadow)', padding: 4, minWidth: 180,
          }}>
            {STYLES.map(s => (
              <button key={s.id} onClick={() => { setStyle(s.id); setPickerOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '7px 10px',
                  background: s.id === style ? 'var(--paper-3)' : 'transparent',
                  border: 0, cursor: 'pointer', borderRadius: 5,
                  font: '500 12px var(--font-mono)', color: 'var(--ink)',
                  letterSpacing: '0.02em',
                }}>
                <span style={{ display: 'inline-flex', gap: 1.5 }}>
                  {s.colors.slice(0, 3).map((c, i) => <span key={i} style={{ width: 6, height: 12, background: c, borderRadius: 1, border: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)' }}/>)}
                </span>
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div className="div"/>

        {/* Density */}
        <span className="lbl">density</span>
        <DensityTriplet value={density} onChange={setDensity}/>
      </div>

      <ModeToggle value={mode} onChange={setMode}/>
      <button className="k-chrome-btn" title="Settings">{I.settings}</button>
    </div>
  );
}

/* ───── Sidebar (collapsible) ─────────────────────────────────────── */
function Sidebar({ collapsed, setCollapsed, activeId }) {
  return (
    <aside className={`k-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="hd">
        {!collapsed && (
          <button className="new-btn" title="New conversation">
            {I.plus}
            <span className="label">New conversation</span>
            <span className="k">⌘N</span>
          </button>
        )}
        {collapsed && (
          <button className="new-btn" title="New conversation">{I.plus}</button>
        )}
        <button className="k-collapse-btn" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>{I.panel}</span> : I.panel}
        </button>
      </div>
      <div className="search-row">
        <div className="k-search-input">
          {I.search}<input placeholder="Search past · docs · components"/><span className="kbd">⌘K</span>
        </div>
      </div>
      <div className="scroll">
        <ConvList activeId={activeId} collapsed={collapsed}/>
      </div>
      <div className="foot">
        <span className="meta">11 conversations · <span className="v">3 pinned</span></span>
      </div>
    </aside>
  );
}

/* ───── ChatLeft container ────────────────────────────────────────── */
function ChatLeft({ title, sub, placeholder, running, accent, children }) {
  return (
    <aside className="k-chat left">
      <div className="hd">
        <span className="ttl">{title || 'Conversation'} {sub && <span className="sub">· {sub}</span>}</span>
        <div className="actions">
          <button className="icb" title="Share">{I.share}</button>
          <button className="icb" title="More">{I.more}</button>
        </div>
      </div>
      <div className="k-stream">{children}</div>
      <Composer placeholder={placeholder} running={running} accent={accent}/>
    </aside>
  );
}

/* ───── CanvasRight container ─────────────────────────────────────── */
function CanvasRight({ eyebrow, head, sub, headActions, children, empty }) {
  if (empty) {
    return <main className="k-canvas">{empty}</main>;
  }
  return (
    <main className="k-canvas">
      <div className="k-canvas-head">
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <div className="ttl">{head}</div>
          {sub && <div className="sub">{sub}</div>}
        </div>
        <div className="head-actions">{headActions}</div>
      </div>
      <div className="k-canvas-body">{children}</div>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SCREEN BODIES — each renders the chat-left + canvas-right pair
   ═══════════════════════════════════════════════════════════════════ */

function WelcomeBody({ style }) {
  return (
    <>
      <ChatLeft placeholder="Ask anything · type / for commands">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '8px 4px' }}>
          <h2 style={{ font: '400 22px/1.3 var(--font-display)', color: 'var(--ink)', letterSpacing: '-0.015em', margin: 0 }}>
            Welcome back, Jerry.
          </h2>
          <p style={{ font: '400 14px/1.6 var(--font-ui)', color: 'var(--ink-2)', margin: 0 }}>
            What are you building today? Three places people usually start —
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={{ font: '500 10.5px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6 }}>Build a component</div>
              <Chips items={[
                { icon: I.layers, label: 'Tabs · 5 panes' },
                { icon: I.table,  label: 'Sortable data table' },
                { icon: I.tree,   label: 'Tree select' },
                { icon: I.widget, label: 'Multi-select with chips' },
              ]}/>
            </div>
            <div>
              <div style={{ font: '500 10.5px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6 }}>How-to</div>
              <Chips items={[
                { icon: I.question, label: 'How does theming work?' },
                { icon: I.question, label: 'Bind a list to async data' },
                { icon: I.question, label: 'A11y for keyboard nav' },
              ]}/>
            </div>
            <div>
              <div style={{ font: '500 10.5px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 6 }}>Theme & customize</div>
              <Chips items={[
                { icon: I.palette, label: 'Theme to my brand' },
                { icon: I.palette, label: 'Build a custom skin' },
              ]}/>
            </div>
          </div>
        </div>
      </ChatLeft>
      <main className="k-canvas">
        <div className="k-welcome">
          <div className="mark"><RokkitWordmark height={64}/></div>
          <div className="lede">
            Pass the data. The component does the rest.
          </div>
          <div className="sub">
            Type a question on the left. The answer mounts here — themed, density-tuned, copyable, and identical to what you'd ship.
          </div>
          <div style={{ marginTop: 32, display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ font: '500 10.5px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>style</div>
            <div style={{ font: '500 12px var(--font-mono)', color: 'var(--ink-2)' }}>{style}</div>
            <span style={{ color: 'var(--ink-4)' }}>·</span>
            <div style={{ font: '500 10.5px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>47 components</div>
            <span style={{ color: 'var(--ink-4)' }}>·</span>
            <div style={{ font: '500 10.5px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Svelte 5 runes</div>
          </div>
        </div>
      </main>
    </>
  );
}

function ThinkingBody() {
  return (
    <>
      <ChatLeft sub="Tabs · mounting" running placeholder="…">
        <StepRow isUser head="YOU" who="Jerry" ago="just now" icon={I.chat}>
          Mount a Tabs demo with five panes. Walk me through how the data-driven API works.
        </StepRow>
        <StepRow kind="info" head="UNDERSTOOD" icon={I.layers} who="Rokkit">
          Three things — locate <code>&lt;Tabs/&gt;</code>, mount it with sample items, and show the Svelte source you'd copy.
        </StepRow>
        <StepRow kind="info" head="LOCATED" icon={I.search}>
          <code>@rokkit/ui</code> · <code>Tabs.svelte</code>. Component reads <code>items</code> + binds <code>value</code>.
        </StepRow>
        <StepRow kind="think" head="MOUNTING">
          <span><span className="thinking-dots" style={{ verticalAlign: 'middle', marginRight: 8 }}><span/><span/><span/></span>
            wiring sample data and the style cascade…</span>
        </StepRow>
      </ChatLeft>
      <main className="k-canvas">
        <div className="k-canvas-head" style={{ opacity: 0.6 }}>
          <div>
            <div className="eyebrow">Canvas · preparing</div>
            <div className="ttl">Tabs · how the data-driven API works</div>
            <div className="sub">A live preview, the source, and the four levers that change its look.</div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--ink-3)', font: '500 12px var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <span className="k-spinner"/>
            mounting — step 3 of 4
          </div>
        </div>
      </main>
    </>
  );
}

function TabsBody({ style }) {
  const code = `<script>
  import { Tabs } from '@rokkit/ui'

  let items = $state([
    { label: 'Overview',  content: overviewSnippet },
    { label: 'Theming',   content: themingSnippet  },
    { label: 'Anatomy',   content: anatomySnippet  },
    { label: 'A11y',      content: a11ySnippet     },
    { label: 'API',       content: apiSnippet      },
  ])
  let value = $state(null)
</script>

<Tabs bind:items bind:value />`;
  return (
    <>
      <ChatLeft sub="Tabs · mounted" placeholder="Refine · ask follow-ups · request another component">
        <StepRow isUser head="YOU" who="Jerry" ago="2m" icon={I.chat}>
          Mount a Tabs demo with five panes. Walk me through how the data-driven API works.
        </StepRow>
        <StepRow kind="info" head="MOUNTED" icon={I.layers} ago="just now">
          <div><code>&lt;Tabs/&gt;</code> from <code>@rokkit/ui</code> on the canvas. Five panes from <code>items</code>. The style on screen is whatever <code>data-style</code> is set to — there is no <code>variant</code> prop.</div>
          <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--accent-soft)', borderRadius: 6, border: '1px dashed color-mix(in oklab, var(--accent) 30%, transparent)', fontSize: 12.5 }}>
            <span style={{ font: '500 10.5px var(--font-mono)', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Canvas →</span>
            <span style={{ marginLeft: 8 }}>Tabs · how the data-driven API works</span>
          </div>
        </StepRow>
        <StepRow kind="info" head="EXPLAINED" icon={I.bookOpen}>
          <strong>Items in, value out.</strong> The component owns selection, keyboard nav, focus, a11y. You hand it data, it hands you back which one is active.
        </StepRow>
        <StepRow kind="info" head="TRY" icon={I.palette}>
          Flip the <em>style</em> at the top of the window — the same Tabs re-renders. Or copy the source on the right and paste it in.
        </StepRow>
        <Chips items={[
          { icon: I.palette, label: 'switch style → rokkit' },
          { icon: I.code,    label: 'show the .css too' },
          { label: 'wire it to a real list' },
        ]}/>
      </ChatLeft>
      <CanvasRight
        eyebrow="Mounted demo · live"
        head="Tabs · how the data-driven API works"
        sub={<>Five panes from one <code style={{ fontFamily: 'var(--font-mono)', padding: '1px 5px', background: 'var(--paper-2)', border: 'var(--hairline)', borderRadius: 3, fontSize: 12.5 }}>items</code> array. Selection is bound. Style comes from <code style={{ fontFamily: 'var(--font-mono)', padding: '1px 5px', background: 'var(--paper-2)', border: 'var(--hairline)', borderRadius: 3, fontSize: 12.5 }}>data-style</code> on the parent. Flip the chrome toggle to see it re-render.</>}
        headActions={<>
          <button className="k-chrome-btn" title="Pin">{I.pin}</button>
          <button className="k-chrome-btn" title="Share">{I.share}</button>
        </>}>
        <ResponseCard
          icon={I.layers}
          name="<Tabs/>"
          meta={`· @rokkit/ui · style=${style}`}
          kicker="LIVE"
          propsRow={<><span>items</span><span className="v">[5]</span><span className="sep">·</span><span>style</span><span className="v">{style}</span><span className="sep">·</span><span>bytes</span><span className="v">2.1kb</span></>}
        >
          <TabsPreview style={style} active={1}/>
        </ResponseCard>
        <CodeBlock
          filename="Tabs.demo.svelte"
          language="svelte"
          code={code}
        />
      </CanvasRight>
    </>
  );
}

function WizardBody({ style, mode }) {
  // Palette options for picker
  const palettes = [
    { id: 'warm-gray', label: 'warm gray',  swatches: ['#f7f3ea', '#ece4d2', '#d6c8a8', '#9c8e72', '#3a3528'] },
    { id: 'slate',     label: 'slate',      swatches: ['#f8fafc', '#e2e8f0', '#94a3b8', '#475569', '#0f172a'] },
    { id: 'neutral',   label: 'neutral',    swatches: ['#fafafa', '#e5e5e5', '#a3a3a3', '#525252', '#171717'] },
    { id: 'shu',       label: 'shu',        swatches: ['#fff2ee', '#fcd4c6', '#f08667', '#a83d1f', '#5c1d0e'] },
  ];

  // Skin → role × palette mapping
  const roles = [
    { role: 'paper',    desc: 'page surface',     light: ['warm-gray', '100'], dark: ['warm-gray', '950'] },
    { role: 'paper-2',  desc: 'raised, cards',    light: ['warm-gray', '50'],  dark: ['warm-gray', '900'] },
    { role: 'paper-3',  desc: 'sunken, hover',    light: ['warm-gray', '200'], dark: ['warm-gray', '800'] },
    { role: 'edge',     desc: 'hairlines',        light: ['warm-gray', '300'], dark: ['warm-gray', '700'] },
    { role: 'ink',      desc: 'primary text',     light: ['warm-gray', '900'], dark: ['warm-gray', '100'] },
    { role: 'ink-2',    desc: 'secondary text',   light: ['warm-gray', '700'], dark: ['warm-gray', '300'] },
    { role: 'accent',   desc: 'links · ctas',     light: ['shu',       '500'], dark: ['shu',       '400'] },
  ];

  return (
    <>
      <ChatLeft sub="theme wizard · step 2" placeholder="Tweak palettes · save preset · export tokens">
        <StepRow isUser head="YOU" who="Jerry" ago="just now" icon={I.chat}>
          Help me build a theme for our brand — vermillion accent on warm-gray neutrals.
        </StepRow>
        <StepRow kind="info" head="STARTED" icon={I.palette} ago="just now">
          Opened the theme wizard on the canvas. Step 02 — Skin — is active. Each role on the left can pick its palette and step. Mode-aware: light + dark share roles, swap palette steps.
        </StepRow>
        <StepRow kind="info" head="GLOSSARY" icon={I.bookOpen}>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink-2)' }}>
            <li><strong>Palette</strong> — a 50→950 color scale.</li>
            <li><strong>Skin</strong> — roles (paper, ink, accent…) mapped to a palette + step. Optionally dual-mapped for light + dark.</li>
            <li><strong>Style</strong> — the thematic character: zen-sumi (underline), rokkit (block), minimal, material.</li>
            <li><strong>Density</strong> — padding rhythm. Chrome-wide attribute.</li>
          </ul>
        </StepRow>
        <Chips items={[
          { label: '← previous step' },
          { label: 'next step → typography' },
          { icon: I.download, label: 'export tokens.css' },
        ]}/>
      </ChatLeft>

      <CanvasRight
        eyebrow="Theme wizard · live preview"
        head="Build a theme · step 02 of 04"
        sub="Style chosen; now map roles to palette steps. The right side previews each role on the running app."
        headActions={<>
          <button className="k-chrome-btn" title="Preview against components">{I.refresh}</button>
          <button className="k-chrome-btn" title="Download">{I.download}</button>
        </>}>
        <ResponseCard
          icon={I.palette}
          name="<ThemeWizard/>"
          meta="· step 02 · skin"
          kicker="WIZARD"
          propsRow={<><span>style</span><span className="v">{style}</span><span className="sep">·</span><span>palette</span><span className="v">warm-gray + shu</span><span className="sep">·</span><span>dual-mode</span><span className="v">yes</span></>}
          actions={['Save preset', 'Export tokens.css', 'Preview live']}
        >
          <div className="k-wiz">
            {/* Horizontal stepper */}
            <div className="k-wiz-steps">
              <div className="k-wiz-step done"><span className="n">01</span>Style</div>
              <span className="sep">/</span>
              <div className="k-wiz-step on"><span className="n">02</span>Skin</div>
              <span className="sep">/</span>
              <div className="k-wiz-step"><span className="n">03</span>Typography</div>
              <span className="sep">/</span>
              <div className="k-wiz-step"><span className="n">04</span>Preview &amp; export</div>
            </div>

            {/* Palette catalog */}
            <div className="k-wiz-section">
              <span className="lbl">Palettes in this skin</span>
              <span className="desc">Two palettes are enough for most themes — one neutral, one accent. Hit + to add more (info, warning, danger).</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 4 }}>
                {palettes.map((p, i) => (
                  <div key={p.id} style={{
                    padding: 12, border: i < 2 ? '1px solid var(--accent)' : 'var(--hairline)',
                    borderRadius: 6, background: i < 2 ? 'color-mix(in oklab, var(--accent) 5%, var(--paper))' : 'var(--paper)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span style={{ font: '500 12.5px var(--font-mono)', color: 'var(--ink)' }}>{p.label}</span>
                      {i < 2 && <span style={{ font: '500 9px var(--font-mono)', padding: '1px 5px', background: 'var(--accent)', color: 'var(--paper)', borderRadius: 3, letterSpacing: '0.06em' }}>IN USE</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {p.swatches.map((c, j) => (
                        <span key={j} style={{ width: 18, height: 22, background: c, borderRadius: 2, border: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)' }}/>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                      {['50', '200', '500', '700', '950'].map((s, j) => (
                        <span key={j} style={{ width: 18, font: '500 9px var(--font-mono)', color: 'var(--ink-4)', textAlign: 'center', letterSpacing: '0.02em' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Role mapping table */}
            <div className="k-wiz-section">
              <span className="lbl">Roles · light / dark mapping</span>
              <span className="desc">Each role picks a palette and a step. Same row, two columns — light and dark stay in sync.</span>
              <div style={{
                marginTop: 4, border: 'var(--hairline)', borderRadius: 8, overflow: 'hidden',
                background: 'var(--paper-2)',
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '180px 1fr 1fr',
                  padding: '10px 14px', borderBottom: 'var(--hairline)',
                  font: '500 10.5px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>
                  <span>Role</span>
                  <span>Light palette + step</span>
                  <span>Dark palette + step</span>
                </div>
                {roles.map((r, i) => (
                  <div key={r.role} style={{
                    display: 'grid', gridTemplateColumns: '180px 1fr 1fr',
                    padding: '10px 14px', alignItems: 'center',
                    background: 'var(--paper)',
                    borderTop: i ? 'var(--hairline)' : 0,
                  }}>
                    <div>
                      <div style={{ font: '500 12.5px var(--font-mono)', color: 'var(--ink)' }}>--{r.role}</div>
                      <div style={{ font: '400 11px var(--font-ui)', color: 'var(--ink-3)', marginTop: 1 }}>{r.desc}</div>
                    </div>
                    <PaletteStepPicker palette={r.light[0]} step={r.light[1]} active={mode === 'light'}/>
                    <PaletteStepPicker palette={r.dark[0]}  step={r.dark[1]}  active={mode === 'dark'}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ResponseCard>
      </CanvasRight>
    </>
  );
}

function PaletteStepPicker({ palette, step, active }) {
  const ramps = {
    'warm-gray': ['#fbf8f1', '#f0e9d8', '#dfd2af', '#c4b384', '#a18d59', '#7a6845', '#574832', '#3a3025', '#241d16', '#13100b'],
    'shu':       ['#fff8f5', '#fdd6c6', '#f7a18b', '#ed7559', '#dd4d2e', '#a83d1f', '#7a2a14', '#52190c', '#310f07', '#1a0703'],
  };
  const swatches = ramps[palette] || ramps['warm-gray'];
  const stepKeys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '950'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: active ? 1 : 0.55 }}>
      <span style={{ font: '500 11.5px var(--font-mono)', color: 'var(--ink-2)', minWidth: 80, padding: '3px 8px', background: 'var(--paper-2)', border: 'var(--hairline)', borderRadius: 3 }}>{palette}</span>
      <div style={{ display: 'flex', gap: 1.5 }}>
        {swatches.map((c, i) => (
          <span key={i} title={stepKeys[i]} style={{
            width: 14, height: 18, background: c, borderRadius: 2,
            border: '1px solid color-mix(in oklab, var(--ink) 8%, transparent)',
            outline: stepKeys[i] === step ? '2px solid var(--accent)' : 'none',
            outlineOffset: stepKeys[i] === step ? 1 : 0,
            cursor: 'pointer',
          }}/>
        ))}
      </div>
      <span style={{ font: '500 11px var(--font-mono)', color: 'var(--ink-3)', minWidth: 28 }}>·{step}</span>
    </div>
  );
}

/* ───── App wrapper with state ────────────────────────────────────── */
function RokkitApp({
  screen,
  initialStyle = 'zen-sumi',
  initialDensity = 'cozy',
  initialMode = 'light',
  initialCollapsed = false,
  activeId,
  crumb,
  label,
}) {
  const [style, setStyle] = useState(initialStyle);
  const [density, setDensity] = useState(initialDensity);
  const [mode, setMode] = useState(initialMode);
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  let body;
  if (screen === 'welcome')  body = <WelcomeBody style={style}/>;
  if (screen === 'thinking') body = <ThinkingBody/>;
  if (screen === 'tabs')     body = <TabsBody style={style}/>;
  if (screen === 'wizard')   body = <WizardBody style={style} mode={mode}/>;

  return (
    <div className="zs k-app"
      data-theme={mode}
      data-style={style}
      data-density={density}
      data-screen-label={label}
    >
      <Chrome
        crumb={crumb}
        mode={mode} setMode={setMode}
        style={style} setStyle={setStyle}
        density={density} setDensity={setDensity}
      />
      <div className="k-stage">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} activeId={activeId}/>
        {body}
      </div>
    </div>
  );
}

/* ───── Screen exports ────────────────────────────────────────────── */
window.R.composer = {
  Welcome:  () => <RokkitApp screen="welcome" label="01 Welcome"/>,
  Thinking: () => <RokkitApp screen="thinking" activeId="h1" crumb={<><span>Tabs</span><span className="sep">·</span><span>mounting</span></>} label="02 In progress"/>,
  Tabs:     () => <RokkitApp screen="tabs" activeId="h1"
              crumb={<><span>Tabs</span><span className="sep">·</span><span>data-driven API</span></>}
              label="03 Tabs response · copyable code"/>,
  Wizard:   () => <RokkitApp screen="wizard" activeId="h2"
              crumb={<><span>Theme</span><span className="sep">·</span><span>brand palette</span></>}
              label="04 Theme wizard · step 2"/>,
  Dark:     () => <RokkitApp screen="tabs" activeId="h1"
              initialMode="dark" initialCollapsed={true}
              crumb={<><span>Tabs</span><span className="sep">·</span><span>dark · collapsed</span></>}
              label="05 Dark + collapsed sidebar"/>,
};
