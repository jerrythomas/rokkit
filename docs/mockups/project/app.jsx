/* Rokkit · design canvas wiring. */

const C = window.R.composer;
const D = window.R.dense;
const Landing = window.R.Landing;

// Dimensions
const APP_W = 1280, APP_H = 800;
const LANDING_W = 1280, LANDING_H = 2400;

function App() {
  return (
    <DesignCanvas style={{ background: '#efece6' }}>

      {/* ───── HOME / LANDING ───────────────────────────────────────── */}
      <DCSection
        id="landing"
        title="Rokkit · landing"
        subtitle="The single marketing + docs front door. Editorial flow with live themed-component examples, the AI/chat embed pitch, and the eight packages. Same Tabs component, four data-style values."
      >
        <DCArtboard id="L1" label="Landing page" width={LANDING_W} height={LANDING_H}>
          <Landing/>
        </DCArtboard>
      </DCSection>

      {/* ───── ROKKIT COMPOSER (primary chat product) ───────────────── */}
      <DCSection
        id="composer"
        title="Rokkit composer · the chat product"
        subtitle="Three-pane: collapsible history sidebar · chat conversation · live canvas. Light/dark, style, and density toggles in the chrome are real — click to flip. Demo response is the data-driven <Tabs/> with copyable Svelte source; theme wizard demo shows the style → skin → typography flow."
      >
        <DCArtboard id="C1" label="01 Welcome" width={APP_W} height={APP_H}><C.Welcome/></DCArtboard>
        <DCArtboard id="C2" label="02 In progress · thinking" width={APP_W} height={APP_H}><C.Thinking/></DCArtboard>
        <DCArtboard id="C3" label="03 Tabs response · with copyable code" width={APP_W} height={APP_H}><C.Tabs/></DCArtboard>
        <DCArtboard id="C4" label="04 Theme wizard · step 2 (skin)" width={APP_W} height={APP_H}><C.Wizard/></DCArtboard>
        <DCArtboard id="C5" label="05 Dark mode · collapsed sidebar" width={APP_W} height={APP_H}><C.Dark/></DCArtboard>
      </DCSection>

      {/* ───── BLOCK BUILDER (dense alt-layout) ─────────────────────── */}
      <DCSection
        id="dense"
        title="Block Builder · dense alt-layout"
        subtitle="Full-width chat with inline artifact cards (Linear / Cursor flavor). Compact density. Thin icon rail. Same data-driven components, different chat shape — for users who'd rather scroll one column than juggle three."
      >
        <DCArtboard id="D1" label="01 Welcome · prompts inline" width={APP_W} height={APP_H}><D.Welcome/></DCArtboard>
        <DCArtboard id="D2" label="02 Tabs response · inline artifact + code" width={APP_W} height={APP_H}><D.Response/></DCArtboard>
      </DCSection>

    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
