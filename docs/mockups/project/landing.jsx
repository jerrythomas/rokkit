/* Rokkit · single consolidated landing — marketing + docs front door.
   Editorial flow, accurate copy, real Rokkit wordmark, interactive component
   strip, AI/chat embed pitch, packages, CTA.

   Exports: window.R.Landing
*/

const _R = window.R;
const _I = _R.I;
const { RokkitWordmark, RokkitMark, TabsPreview, I: LI } = _R;

/* ───── Nav (lives at the top of every landing scroll) ────────────── */
function LandingNav() {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-5)',
      padding: '18px 48px',
      borderBottom: 'var(--hairline)',
      background: 'var(--paper)',
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}>
        <RokkitWordmark height={28}/>
      </div>
      <nav style={{ display: 'flex', gap: 'var(--space-5)', marginLeft: 'var(--space-7)' }}>
        {['Components', 'Themes', 'Docs', 'Playground', 'GitHub'].map((l, i) => (
          <span key={l} style={{ font: '500 13px var(--font-ui)', color: i === 0 ? 'var(--ink)' : 'var(--ink-2)', cursor: 'pointer', whiteSpace: 'nowrap' }}>{l}{l === 'GitHub' ? ' ↗' : ''}</span>
        ))}
      </nav>
      <div style={{ flex: 1 }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ font: '500 11.5px var(--font-mono)', color: 'var(--ink-3)', padding: '3px 8px', border: 'var(--hairline)', borderRadius: 4, whiteSpace: 'nowrap' }}>
          v2.0 · svelte 5
        </span>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', background: 'var(--ink)', color: 'var(--paper)',
          font: '500 13px var(--font-ui)', borderRadius: 6, border: 0, cursor: 'pointer',
        }}>
          {LI.chat}
          Open the playground
        </button>
      </div>
    </header>
  );
}

/* ───── Hero — Rokkit wordmark + brief, calm ───────────────────────── */
function Hero() {
  return (
    <section style={{
      padding: '80px 48px 64px',
      display: 'grid', gridTemplateColumns: '1fr 460px',
      gap: 'var(--space-9)', alignItems: 'center',
    }}>
      <div>
        <div style={{ font: '500 11px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>
          A data-driven Svelte 5 component library
        </div>
        <h1 style={{
          font: '300 64px/1.04 var(--font-display)', letterSpacing: '-0.025em',
          color: 'var(--ink)', margin: 0,
        }}>
          Pass the data.<br/>
          The <em style={{ color: 'var(--accent)', fontStyle: 'normal', fontWeight: 400 }}>component</em> does the rest.
        </h1>
        <p style={{
          margin: '28px 0 0',
          font: '400 17px/1.6 var(--font-ui)', color: 'var(--ink-2)', maxWidth: 560,
        }}>
          A list is an items array. A tree is a nested shape. A form is its schema. Rokkit components read their own data — selection, validation, theming, keyboard, a11y — so your code stays about what the user sees, not how to wire it.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 36, alignItems: 'center', flexWrap: 'wrap' }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 20px', background: 'var(--ink)', color: 'var(--paper)',
            font: '500 14px var(--font-ui)', borderRadius: 6, border: 0, cursor: 'pointer',
          }}>
            {LI.chat}
            Open the playground
          </button>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 20px', background: 'transparent', color: 'var(--ink)',
            font: '500 14px var(--font-ui)', borderRadius: 6, border: '1px solid var(--ink)', cursor: 'pointer',
          }}>
            Browse all 47 components →
          </button>
          <code style={{
            font: '500 12.5px var(--font-mono)', color: 'var(--ink-2)',
            padding: '10px 14px', background: 'var(--paper-2)', border: 'var(--hairline)',
            borderRadius: 6,
          }}>
            <span style={{ color: 'var(--ink-4)' }}>$</span> bun add @rokkit/ui
          </code>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'relative', width: 420, height: 380 }}>
          {/* Background concentric brushstroke — large, ink */}
          <svg viewBox="0 0 360 360" width="380" height="380" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', opacity: 0.06 }}>
            <path
              d="M 180 30 C 80 30, 30 110, 30 190 C 30 280, 120 330, 200 320 C 290 305, 330 220, 320 150 C 310 80, 240 40, 180 50"
              stroke="var(--ink)" strokeWidth="60" fill="none" strokeLinecap="round"
            />
          </svg>
          {/* Rokkit wordmark floating in the foreground */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <RokkitWordmark height={88}/>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ font: '500 11px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>data in</span>
              <span style={{ color: 'var(--accent)' }}>{LI.arrowRight}</span>
              <span style={{ font: '500 11px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>component out</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───── What it is — four points, kanji-anchored brief ─────────────── */
function FourPoints() {
  const pts = [
    {
      icon: LI.layers,
      t: 'Data is the API',
      d: 'A List takes items. A Tree takes a nested shape. A Form reads its schema. No snippet trees, no recursive composition — pass the data, get a working control.',
    },
    {
      icon: LI.palette,
      t: 'One config drives every look',
      d: 'Pick a style (zen-sumi, rokkit, minimal, material), a skin (paper / ink / accent palette), a typography pair, a density. Set it once on the body — every component picks it up.',
    },
    {
      icon: LI.densComfortable,
      t: 'Density is a data attribute',
      d: 'Compact for a power-user table. Cozy for a settings page. Comfortable for an onboarding flow. Type stays put — only the rhythm changes.',
    },
    {
      icon: LI.chat,
      t: 'Embeddable in any AI surface',
      d: 'Every component is a typed artifact — items in, value out, no global state. Drop one into Claude, into your own chat, into Rokkit\'s playground. Same code, themed to its host.',
    },
  ];
  return (
    <section style={{ padding: '72px 48px', borderTop: 'var(--hairline)', background: 'var(--paper-2)' }}>
      <div style={{ font: '500 11px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 32 }}>
        What makes Rokkit different
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-7)' }}>
        {pts.map((p, i) => (
          <div key={i}>
            <div style={{
              width: 36, height: 36,
              display: 'grid', placeItems: 'center',
              borderRadius: 8, color: 'var(--accent)',
              background: 'var(--accent-soft)', border: '1px solid color-mix(in oklab, var(--accent) 22%, transparent)',
              marginBottom: 14,
            }}>{p.icon}</div>
            <h3 style={{ font: '500 18px/1.3 var(--font-display)', color: 'var(--ink)', letterSpacing: '-0.01em', margin: '0 0 10px' }}>
              {p.t}
            </h3>
            <p style={{ font: '400 14px/1.6 var(--font-ui)', color: 'var(--ink-2)', margin: 0 }}>{p.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───── Touch-them strip · the same component, four styles ──────── */
function ThemedTabsRow() {
  return (
    <section style={{ padding: '80px 48px', borderTop: 'var(--hairline)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 28 }}>
        <div>
          <div style={{ font: '500 11px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
            One component · four styles
          </div>
          <h2 style={{ font: '300 36px/1.2 var(--font-display)', letterSpacing: '-0.025em', color: 'var(--ink)', margin: 0, maxWidth: 720 }}>
            The same <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '0.85em' }}>&lt;Tabs/&gt;</code>, rendered four ways — by changing one attribute on the parent.
          </h2>
          <p style={{ font: '400 14px/1.55 var(--font-ui)', color: 'var(--ink-2)', margin: '14px 0 0', maxWidth: 640 }}>
            No variant prop. No conditional CSS in the component. The style — zen-sumi underline, rokkit block, minimal hairline, material pill — comes from <code style={{ fontFamily: 'var(--font-mono)', padding: '1px 5px', borderRadius: 3, background: 'var(--paper-2)', border: 'var(--hairline)', fontSize: 12 }}>data-style</code> on the body. Components don't know which one is on; they just render.
          </p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {[
          { id: 'zen-sumi', label: 'zen-sumi', desc: 'underline · sumi accent' },
          { id: 'rokkit',   label: 'rokkit',   desc: 'filled block · brand red' },
          { id: 'minimal',  label: 'minimal',  desc: 'hairline only · ink' },
          { id: 'material', label: 'material', desc: 'pill bar · brand violet' },
        ].map(s => (
          <div key={s.id} className="zs" data-style={s.id} style={{ background: 'var(--paper)', border: 'var(--hairline)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: 'var(--hairline)', background: 'var(--paper-2)' }}>
              <code style={{ font: '500 11.5px var(--font-mono)', color: 'var(--ink-2)' }}>data-style="{s.label}"</code>
              <span style={{ font: '500 11px var(--font-mono)', color: 'var(--ink-3)', marginLeft: 'auto', letterSpacing: '0.04em' }}>{s.desc}</span>
            </div>
            <div style={{ padding: '18px 18px 20px' }}>
              <TabsPreview style={s.id} active={1}/>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───── Themed chat-embed proof — Rokkit inside another product's chat ── */
function ChatEmbed() {
  return (
    <section style={{ padding: '88px 48px', borderTop: 'var(--hairline)', background: 'var(--paper-2)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 'var(--space-8)', alignItems: 'flex-start' }}>
        <div>
          <div style={{ font: '500 11px var(--font-mono)', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14 }}>
            For AI · for chat surfaces
          </div>
          <h2 style={{ font: '300 36px/1.2 var(--font-display)', letterSpacing: '-0.025em', color: 'var(--ink)', margin: '0 0 18px' }}>
            Components that<br/>belong in a conversation.
          </h2>
          <p style={{ font: '400 15px/1.65 var(--font-ui)', color: 'var(--ink-2)', margin: 0 }}>
            Stream a JSON spec from your model. Rokkit's <code style={{ fontFamily: 'var(--font-mono)', padding: '1px 5px', borderRadius: 3, background: 'var(--paper)', border: 'var(--hairline)', fontSize: 12 }}>&lt;Form/&gt;</code>, <code style={{ fontFamily: 'var(--font-mono)', padding: '1px 5px', borderRadius: 3, background: 'var(--paper)', border: 'var(--hairline)', fontSize: 12 }}>&lt;Table/&gt;</code>, <code style={{ fontFamily: 'var(--font-mono)', padding: '1px 5px', borderRadius: 3, background: 'var(--paper)', border: 'var(--hairline)', fontSize: 12 }}>&lt;Chart/&gt;</code> render the response as a real, themed, interactive artifact. The user clicks. Your model gets the result back.
          </p>
          <ul style={{ margin: '24px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'Human-in-the-loop forms — AI proposes, user confirms',
              'Themed to the host product, not to Rokkit',
              'Same code in the embed, in your app, in Rokkit\'s own docs',
              'Components serialize to and from JSON',
            ].map((line, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, font: '400 14px/1.5 var(--font-ui)', color: 'var(--ink-2)' }}>
                <span style={{ color: 'var(--accent)', marginTop: 4 }}>{LI.arrowRight}</span>
                {line}
              </li>
            ))}
          </ul>
        </div>

        {/* Mock chat exchange with a real Rokkit form mounted */}
        <div className="zs" data-style="zen-sumi" style={{
          border: 'var(--hairline)', borderRadius: 12, overflow: 'hidden',
          background: 'var(--paper)', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ padding: '10px 14px', borderBottom: 'var(--hairline)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--paper-2)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--success)' }}/>
            <span style={{ font: '500 11px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.06em', flex: 1 }}>
              Inside a Claude / OpenAI chat
            </span>
            <span style={{ font: '500 10.5px var(--font-mono)', color: 'var(--ink-4)', letterSpacing: '0.06em' }}>themed to host</span>
          </div>
          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{
              alignSelf: 'flex-end', maxWidth: '78%',
              padding: '10px 14px', background: 'var(--paper-2)', border: 'var(--hairline)', borderRadius: 8,
              font: '400 14px/1.5 var(--font-ui)', color: 'var(--ink)',
            }}>
              help me lock the Q3 plan — give me the three priorities and a deadline.
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{
                width: 26, height: 26, flexShrink: 0,
                display: 'grid', placeItems: 'center',
                border: 'var(--hairline)', borderRadius: 6,
                background: 'var(--accent-soft)', color: 'var(--accent)',
              }}>{LI.form}</span>
              <div style={{ flex: 1 }}>
                <div style={{ font: '500 10.5px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                  rokkit · &lt;Form/&gt; · streamed from response
                </div>
                <div style={{ border: 'var(--hairline)', borderRadius: 8, padding: 14, background: 'var(--paper)' }}>
                  <div style={{ font: '500 13px var(--font-display)', color: 'var(--ink)', marginBottom: 4, letterSpacing: '-0.005em' }}>Q3 plan · priorities</div>
                  <div style={{ font: '400 11.5px var(--font-mono)', color: 'var(--ink-3)', marginBottom: 12 }}>3 items · 1 date · editable</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {[['Ship rokkit v2.0', true], ['Launch the playground beta', true], ['Improve a11y coverage', false]].map(([p, on], i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', background: 'var(--paper-2)', border: 'var(--hairline)', borderRadius: 5, font: '400 12.5px var(--font-ui)', color: 'var(--ink)' }}>
                        <span style={{ width: 14, height: 14, border: 'var(--hairline)', borderRadius: 3, background: on ? 'var(--ink)' : 'transparent', position: 'relative', flexShrink: 0 }}>
                          {on && <svg viewBox="0 0 10 10" width="10" height="10" style={{ position: 'absolute', top: 1, left: 1 }}><path d="M2 5 L4 7 L8 3" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        {p}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--edge)' }}>
                    <span style={{ font: '500 11.5px var(--font-ui)', color: 'var(--ink-2)', flex: 1 }}>Deadline</span>
                    <span style={{ font: '500 12px var(--font-mono)', padding: '4px 10px', background: 'var(--paper-2)', border: 'var(--hairline)', borderRadius: 4 }}>30 Sep 2026</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 14, justifyContent: 'flex-end' }}>
                    <button style={{ font: '500 12px var(--font-ui)', padding: '7px 14px', background: 'transparent', border: 'var(--hairline)', borderRadius: 5, color: 'var(--ink-2)', cursor: 'pointer' }}>Edit</button>
                    <button style={{ font: '500 12px var(--font-ui)', padding: '7px 14px', background: 'var(--accent)', color: 'white', border: 0, borderRadius: 5, cursor: 'pointer' }}>Confirm</button>
                  </div>
                </div>
                <div style={{ font: '500 10.5px var(--font-mono)', color: 'var(--ink-4)', letterSpacing: '0.02em', marginTop: 8 }}>
                  rendered from {'{ items: [...], deadline: "..." }'} · 11 lines of Svelte
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───── Packages strip — the seven ─────────────────────────────────── */
function Packages() {
  const pkgs = [
    { pkg: '@rokkit/core',    icon: LI.layers,   desc: 'primitives, tokens, types' },
    { pkg: '@rokkit/data',    icon: LI.table,    desc: 'item shapes, stores' },
    { pkg: '@rokkit/actions', icon: LI.wand,     desc: 'svelte actions: themable, keyboard, focus' },
    { pkg: '@rokkit/states',  icon: LI.refresh,  desc: 'finite states for interactive UI' },
    { pkg: '@rokkit/icons',   icon: LI.widget,   desc: 'icon set · customizable' },
    { pkg: '@rokkit/themes',  icon: LI.palette,  desc: 'styles · skins · typography pairs' },
    { pkg: '@rokkit/ui',      icon: LI.list,     desc: 'the components themselves' },
    { pkg: '@rokkit/chat',    icon: LI.chat,     desc: 'AI / chat embed kit', isNew: true },
  ];
  return (
    <section style={{ padding: '72px 48px', borderTop: 'var(--hairline)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ font: '500 11px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
            The eight packages
          </div>
          <h2 style={{ font: '300 32px/1.2 var(--font-display)', letterSpacing: '-0.025em', color: 'var(--ink)', margin: 0 }}>
            Pull in only what you need.
          </h2>
        </div>
        <a style={{ font: '500 13px var(--font-ui)', color: 'var(--ink-2)' }}>see all on npm ↗</a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {pkgs.map((p, i) => (
          <div key={i} style={{ padding: '16px 16px 14px', border: 'var(--hairline)', borderRadius: 8, background: 'var(--paper)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ color: 'var(--accent)' }}>{p.icon}</span>
              <span style={{ font: '500 13px var(--font-mono)', color: 'var(--ink)' }}>{p.pkg}</span>
            </div>
            <div style={{ font: '400 12.5px var(--font-ui)', color: 'var(--ink-3)', lineHeight: 1.45 }}>{p.desc}</div>
            {p.isNew && (
              <span style={{ position: 'absolute', top: 12, right: 12, font: '500 9px var(--font-mono)', padding: '2px 6px', background: 'var(--accent)', color: 'white', borderRadius: 3, letterSpacing: '0.1em' }}>NEW</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───── CTA + footer ─────────────────────────────────────────────── */
function CTAFooter() {
  return (
    <>
      <section style={{ padding: '80px 48px', borderTop: 'var(--hairline)', background: 'var(--paper-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ font: '300 40px/1.2 var(--font-display)', letterSpacing: '-0.025em', color: 'var(--ink)', margin: '0 0 12px' }}>
              The library is the chat is the docs.
            </h2>
            <p style={{ font: '400 15px/1.6 var(--font-ui)', color: 'var(--ink-2)', margin: 0, maxWidth: 600 }}>
              Open the playground, ask for any component or how-to, get a real working artifact back. Browse the same components from the sidebar. Read the same docs they were mounted from.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{
              padding: '14px 22px', background: 'var(--ink)', color: 'var(--paper)',
              font: '500 14px var(--font-ui)', borderRadius: 6, border: 0, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              {LI.chat} Open the playground
            </button>
            <button style={{
              padding: '14px 22px', background: 'transparent', color: 'var(--ink)',
              font: '500 14px var(--font-ui)', borderRadius: 6, border: '1px solid var(--ink)', cursor: 'pointer',
            }}>
              Read the docs
            </button>
          </div>
        </div>
      </section>

      <footer style={{ padding: '32px 48px 40px', borderTop: 'var(--hairline)', display: 'flex', alignItems: 'flex-end', gap: 'var(--space-7)' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
          <RokkitWordmark height={22}/>
          <span style={{ font: '500 11px var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>v2.0 · MIT · Svelte 5</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
          <span style={{ font: '500 11.5px var(--font-mono)', color: 'var(--ink-2)' }}>jerrythomas / rokkit</span>
          <span style={{ font: '500 11px var(--font-mono)', color: 'var(--ink-4)' }}>github · npm · vercel</span>
        </div>
      </footer>
    </>
  );
}

function Landing() {
  return (
    <div className="zs" data-style="zen-sumi" data-density="cozy" data-screen-label="Landing · Rokkit"
      style={{ background: 'var(--paper)', color: 'var(--ink)', minHeight: '100%', fontFamily: 'var(--font-ui)' }}>
      <LandingNav/>
      <Hero/>
      <FourPoints/>
      <ThemedTabsRow/>
      <ChatEmbed/>
      <Packages/>
      <CTAFooter/>
    </div>
  );
}

window.R.Landing = Landing;
