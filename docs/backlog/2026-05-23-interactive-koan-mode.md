# Interactive Koan Mode — LLM-driven query routing

**Date:** 2026-05-23
**Status:** Draft — architecture spec, not yet scheduled
**Parent:** Stage D — Koan demo catalog (component-mounting + answering questions)

## Summary

Replace the current `setTimeout(1500)` + lexical `runMatch` with a real LLM-driven intent router. Three intent classes the chat needs to route between:

| Intent | Example | What renders |
|---|---|---|
| **Show me a component** | "Tabs with 5 panes", "sortable table" | mount the matching demo on the canvas, optionally with parameters |
| **How-to question** | "How does theming work?", "How do I bind a list?" | render a response composition in the chat stream — prose + **inline components** + code snippets — no canvas mount |
| **Refine the current demo** | "switch style to rokkit", "add a column", "make it dark" | mutate state on the *already-mounted* canvas; no new mount, no new route |

Today's deterministic matcher handles only the first intent, and only when the user's wording overlaps catalog keywords.

## Response compositions (inline components in chat)

This is the centerpiece of the move from "static demo cards" to "real chat-first showcase". A chat response is not a static template per demo type — it's an **ordered list of blocks** the LLM composes:

```
response = Block[]
Block = { kind: 'text', markdown: string }
      | { kind: 'code', language: string, source: string }
      | { kind: 'component', name: string, props: object }
      | { kind: 'comparison', left: Block[], right: Block[] }
```

The renderer walks the blocks and renders each one inline in the chat stream. A `'component'` block instantiates a live, themed, interactive component from a whitelist — same components as the canvas demos, but rendered at smaller size inline. Selecting / interacting with the inline component updates state visible to the next LLM turn.

**Why this matters:**

- Today's "MOUNTED / EXPLAINED / TRY" sequence is scripted per-demo and identical every time. It's a stand-in for the real thing.
- Real chat-assistant behavior: prose interleaved with live artifacts. ChatGPT-style inline tables, Claude-style artifacts, but generated per-query.
- The catalog becomes a *component palette* the LLM picks from; the response is *composed*, not selected.

**Examples of compositions the LLM might generate:**

- "How do I bind a list to async data?" → text explaining the pattern + a small inline `<List>` populated from a faked async fetch + a code block showing the binding.
- "Compare List vs Tree" → text framing the comparison + side-by-side inline `<List collapsible>` and `<Tree>` with the same data, so the user can interact with both.
- "Show me Tabs theming" → text + a small inline `<Tabs>` + a row of style chips that, on click, swap `data-style` on the inline tabs only.
- "Make a settings form" → text + an inline `<FormBuilder>` with a sample schema, fully interactive.

**Inline vs canvas — when to use which:**

- **Inline (chat stream)** for explanations, comparisons, illustrative micro-demos. The component is small, the response prose is the focus.
- **Canvas mount** for the focal artifact — the user wants to see the *full* component with all its chrome (code block, props row, actions, theme switcher). One canvas artifact at a time; chat stream can host many inline mini-demos.

The LLM decides which mode based on intent: "show me X" → canvas; "explain X / compare X / how do I X" → inline composition.

**The component whitelist:**

Each catalog entry's tool spec declares whether it's `inline_capable: true`. Components like Tabs, List, Tree, Table, MultiSelect, Chart are inline-capable. Heavy artifacts like the full ThemeWizard step view are canvas-only.

**Trust boundary:** the LLM picks from the whitelist and provides JSON props that match a schema. It never writes Svelte source that gets evaluated.

## Architecture

**Hybrid: deterministic fast-path + LLM tool-use fallback.**

```
user query
    │
    ▼
runMatch  ──── single strong match + "show me X" verb ────► goto(/app/<id>)
    │
    │ ambiguous / no match / not a "show" intent
    ▼
intent router (LLM) — tools = catalog + answer-card + refine
    │
    ├── tool_use: mountDemo(id, params)       → goto(...)
    ├── tool_use: refineCurrentDemo(action)   → shell store mutation
    ├── tool_use: answerHowTo(question)       → markdown response card
    └── text response                         → chat-left EXPLAINED message
```

**The LLM never:**

- Generates Svelte components dynamically
- Executes arbitrary code
- Renders untrusted markup

It only **chooses** what to render and **writes** the prose. The renderer stays deterministic.

## Phase 1 — Server-side LLM (Anthropic / OpenAI)

Standard tool-use flow with API key (server-side, never exposed). Lives behind a SvelteKit `+server.ts` endpoint so the Anthropic key stays out of the bundle.

**Pros:** state-of-the-art model quality, fast inference, no model-download cost.

**Cons:** requires backend, API cost per query, network round-trip latency, user privacy (queries leave the browser).

Fits if the demo is hosted on infrastructure we control with a managed API key.

## Phase 2 — In-browser LLM (transformers.js / web-llm)

Run a small chat model entirely in the browser via WebGPU/WASM.

| Library | What it does | Models |
|---|---|---|
| **transformers.js** (Xenova / Hugging Face) | General-purpose JS runtime for transformer models; broad model support. | Phi-3 mini, TinyLlama, Llama-3.2-1B-Instruct, etc. |
| **web-llm** (MLC) | Specialized chat-model runtime, WebGPU-first, optimized inference. | Llama-3, Mistral, Phi, Qwen, Gemma — chat-tuned variants. |

**Pros:** zero API cost, complete privacy (queries never leave the browser), no backend, offline-capable after initial download.

**Cons:** model download is multi-hundred-MB to multi-GB; first-token latency is slow on cold start (cache helps for repeat visits); reasoning quality is meaningfully below frontier models.

**Why it fits Koan:**

- The interaction is constrained — pick a tool from a small palette, fill its parameters, write a short response. Small models handle this kind of structured task well.
- Demo is a public showcase, not a per-user product — managing API keys would be friction.
- Privacy doesn't matter much (no PII), but eliminating API cost for an indefinitely-running demo does.

**The download tax is the real question.** Mitigations:

- Lazy-load only when the user submits a query that the fast-path can't resolve.
- Cache the model in IndexedDB via the library's built-in cache.
- Pick the smallest viable model (Phi-3 mini ~1.5GB Q4-quantized, or smaller).
- Show a one-time progress UI on first model load with copy explaining "first run downloads a local AI; subsequent loads are instant".

## Per-demo customization variations (post-MVP)

Each component-demo will benefit from **variations** that explore the same component with different data, mapping, layout, snippets, event handlers, etc. — surfaced as follow-up questions in the chat.

Two ways to expose them, picked per case:

**A. Dynamic on one page (preferred for most variations).**

One route per component (`/app/tabs`). The page reads a `variant` URL param or chat-driven state, and swaps:
- the data passed to the component (e.g. fewer items, grouped data, async-loaded data)
- the field mapping (e.g. `fields={'{ label: title, value: slug }'}` instead of defaults)
- the layout config (e.g. orientation prop, density)
- snippet usage (custom cell/option renderers)
- which event handlers are wired (live console of events emitted)

The component stays the same Svelte instance — only its props change. The chat-left messages update to reflect the variation. The URL is `/app/tabs?variant=snippets` and is still bookmarkable.

This is the cleaner pattern because:
- One state owner per component (the page).
- Side-by-side comparison: the user can toggle variations interactively without leaving the page.
- The LLM's "refine the current demo" intent maps to swapping the variant in place — no navigation.
- Less route proliferation.

**B. Sub-routes (for substantially different demos).**

`/app/tabs/grouped` as a real sibling route when the variation is *structurally* different enough that "same component, different props" undersells it (e.g. Tabs in vertical orientation with content panels that load from different endpoints — that's a different *story*, not just different props).

This keeps the option open without forcing it on every variation.

**Catalog tool spec:**

Each catalog entry declares its variants:

```ts
inline?: {
  capable: boolean
  variants?: Array<{
    id: string                  // 'snippets', 'mapping', 'async', 'grouped', …
    label: string               // shown in chat as a follow-up suggestion chip
    mode: 'dynamic' | 'route'   // dynamic = swap props on /app/<demo>?variant=ID
                                // route   = navigate to /app/<demo>/<variant>
    props?: object              // for dynamic variants
  }>
}
```

The LLM uses this to suggest follow-ups ("Try this with async data") and route them correctly. The state-setter pages stay tiny; the layout reads `shell.demoVariant` (set from URL param or chat) and merges variant props into the mounted component.

**Timing:** ship the interactive chat first (this spec). Customization variants come after — they're the content the chat surfaces, and the plumbing has to exist first.

## Catalog entries become tool specs

Extend `DemoMeta` with optional `tool` + `inline` fields:

```ts
export type DemoMeta = {
  id: string
  title: string
  description: string
  keywords: string[]
  category: DemoCategory
  icon: string
  load: () => Promise<{ default: Component }>

  // NEW — for interactive mode
  tool?: {
    name: string                    // e.g. 'mount_theme_wizard'
    description: string             // when to use this, written for the LLM
    parameters?: ToolParamSchema    // JSON-schema-ish: { palette?: string, step?: string }
  }

  // NEW — for inline composition in chat responses
  inline?: {
    capable: boolean                // can this render inline in a chat message?
    component: () => Promise<Component>  // smaller / embeddable variant if different from canvas
    propSchema: ToolParamSchema     // what the LLM can pass; bounded for safety
    defaultProps?: object           // sensible defaults if LLM omits
  }
}
```

The LLM sees the union of these tool specs as available functions. Routes accept the parameters as URL query params (`/app/theming?palette=shu&step=500`) so each tool call lands as a deep-link.

## New files this would add

- `demo/src/lib/koan/intent.svelte.ts` — LLM call + tool-result handler. Adapter pattern: a single interface, swappable backends (`anthropic`, `openai`, `transformers-js`, `web-llm`).
- `demo/src/lib/koan/components/AnswerCard.svelte` — renders how-to text + code blocks on the canvas (sibling to ChatResponse).
- Extend each `demos/<id>/meta.ts` with a `tool` block.
- Each demo route accepts URL params for parameters.
- A small `ConversationHistory` slice in the shell store — the LLM needs context across turns.

## Context budget for the LLM

- Conversation history grows; cap at last 6–8 turns or summarize older ones.
- Catalog tool specs: a few hundred tokens total — fine.
- Current canvas state: small JSON blob — fine.
- For in-browser models, keep prompts terse — context length is the bottleneck.

## What's deferred to "v2 of v2"

- Multi-turn refinement that needs deep history awareness ("change the colors back to what they were three messages ago").
- Generating new demo entries from queries that don't match any catalog item.
- RAG over the docs (only useful once docs are comprehensive).
- Voice input.

## Acceptance criteria (when shipped)

1. "Show me a sortable table" → mounts `/app/table` without a fast-path keyword match.
2. "How does theming work?" → answer card on the canvas with prose + a short code example; no mount.
3. "Theme to my brand red" → mounts `/app/theming?palette=shu` with the wizard's role mapping pre-populated.
4. "Make it dark" (with a demo mounted) → toggles mode without remounting.
5. First-query latency on a cold cache is shown with progress UI; subsequent queries on a warm cache feel instant.
6. The fast-path (deterministic match) still handles the obvious cases without LLM call, keeping the common case fast and free.

## Estimated cost

- Architecture + Phase 1 (server LLM): ~2–3 days.
- Phase 2 (in-browser): ~3–5 days including model selection, cache UI, perf tuning.
- Catalog tool-spec extensions: trivial alongside Phase 1, ~30 min per existing demo.

## Open questions

- Server-managed key vs. user-supplied (BYOK) for Phase 1?
- Which in-browser library wins on bundle + first-token for our intent shape? Benchmark transformers.js vs web-llm with Phi-3-mini before committing.
- Should the answer-card support live previews of the components it mentions? (e.g. "Here's how to use Tabs — [inline mini-Tabs demo]") — probably yes, since the components are already locally available.
