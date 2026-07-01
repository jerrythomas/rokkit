# Ask Rokkit — AI Demo Evolution — Design

**Date:** 2026-06-30
**App:** `apps/learn` (SvelteKit, Svelte 5 runes)
**Status:** Approved (brainstorm) → ready for implementation plan

## Goal

Evolve the `/chat` "Chat demo" into **Ask Rokkit**: a mode-picker entry that keeps the
three inference engines (**Simulated / OpenRouter / Web LLM**) genuinely separate, each
with its own route, history, and an explanatory card (what it is, capabilities, example
prompts). Give chat conversations tidy summary titles. This is **Sub-project 2** (Sub-project 1,
the Components+Catalog consolidation, is shipped).

## Current state (as built)

- **`src/routes/chat/+page.svelte`** (~1108 lines): a single chat surface — welcome state
  (heading + 8 example chips), `ChatTimeline` stream, `ChatComposer`, `ChatHistory` rail,
  a **3-way mode `Toggle`** (Scripted/OpenRouter/Web-LLM) in `.chat-subtoolbar`, model
  dropdowns + Web-LLM load/progress states, and a drag-drop data overlay. `<title>Chat · Rokkit</title>`.
- **`src/lib/chat-demo/store.svelte.ts`**: `mode` is `$derived` from `llm.enabled` +
  `llm.provider`; `setMode(next)` flips those. `submitText`→`submitQuery`/`submitData`;
  `submitQuery` calls `routeViaLLM` (LLM modes) or the scripted `routeQuery` (Simulated).
  `conversation` getter maps the shared store's turns to the chat shape.
- **`src/lib/chat-demo/llm.svelte.ts`**: `llm` state (`enabled`, `provider`,
  `openRouterModel` default `openai/gpt-oss-20b:free`, `webllmModel` default
  `Llama-3.2-3B-Instruct-q4f32_1-MLC`, `webllmProgress`, `webllmStage`). `routeViaOpenRouter`
  (POST `/api/llm/openrouter`, key server-side), `routeViaWebLLM` (`@mlc-ai/web-llm`,
  WebGPU, `ensureWebLLMEngine`/`resetWebLLMEngine`), a `WEBLLM_MODELS` list (4 models),
  and a shared system prompt that yields fenced components. Errors already produce
  friendly `ErrorBlock`s.
- **Response rendering** (`BlockList.svelte` + `InlineComponent.svelte`): 7 block kinds
  (prose/markdown/code/component/error/data-note/suggestions); components mount live
  `@rokkit/{chart,ui,forms}` with edit/export. **Unchanged by this project.**
- **`src/lib/koan/conversations.svelte.ts`**: shared store for `/app` + `/chat`. Chat
  `startNew` title = `query.slice(0,80)`, always appends (no dedup). Assistant turns carry
  `provider` + `model`. `bucketByRecency(surface?)` groups the rail.
- **`src/lib/components/SiteNav.svelte`**: nav entry `{ label: 'Chat demo', href: '/chat' }`.

## Design

### 1. Rename + routing

- **Rename "Chat demo" → "Ask Rokkit"** in: `SiteNav` label, the page `<title>`, and the
  in-page kicker/welcome copy.
- **`/chat` becomes the picker (hub), always** — visiting `/chat` never auto-enters a mode.
- **Per-mode chat lives at `/chat/[mode]/+page.svelte`** — one param route, `mode ∈
  { simulated, openrouter, webllm }`. Validate in `src/routes/chat/[mode]/+page.ts`
  (`load`): an unknown `mode` throws `redirect(308, '/chat')` before render; a valid mode
  returns `{ mode }` for the page.
- **Model as a query param:** `/chat/openrouter?model=openai/gpt-oss-20b:free`,
  `/chat/webllm?model=Llama-3.2-3B-Instruct-q4f32_1-MLC`; `/chat/simulated` has none.
  Absent `?model=` → the mode's default. Matches the app's existing `?variant=` convention;
  handles model IDs containing `/` and `:`.
- **The in-chat mode `Toggle` is removed.** The engine is fixed by the route. Returning to
  the picker (the nav "Ask Rokkit" link → `/chat`) is the only way to change engine — no
  hot-swap. The **model dropdown stays** inside OpenRouter/Web-LLM (changing model is not an
  engine switch) and keeps `?model=` in sync (via `goto(..., { replaceState: true })`).
- **"Scripted" is relabeled "Simulated"** in all UI + as the `simulated` route segment.
  Internally it still maps to the existing scripted engine (`llm.enabled = false`,
  `routeQuery`) — no persisted-data migration; a small route↔engine map handles it.

### 2. The picker (`/chat`)

A `ModePicker` view (new component, e.g. `src/lib/chat-demo/components/ModePicker.svelte`)
renders three cards from a static `MODES` descriptor:

| Mode | What it is | Capabilities | Example chips |
|---|---|---|---|
| **Simulated** | Instant canned demos — no AI, works offline | Fixed set: chart/table/form/list examples | "Bar chart of quarterly revenue", "Sortable products table", "Sign-up form" |
| **OpenRouter** | A hosted LLM builds live components | Any prompt → charts/tables/forms/lists; needs network (key server-side); model picker | "Generate a Q3 sales scenario and chart it", "Table of the top 5 EVs by range" |
| **Web LLM** | A model runs in your browser — fully private | Same generation, offline after a one-time WebGPU model download (~0.7–2 GB); model picker | "Invent a startup's monthly burn and plot it", "Build a newsletter signup form" |

- **Clicking a card** → `goto('/chat/{mode}')` (with the default `?model=` for
  openrouter/webllm).
- **Clicking an example chip** → enters that mode **and auto-sends** the prompt. Mechanism:
  a module-level one-shot `pendingPrompt` in the chat-demo store; the chip sets it and
  `goto`s the mode route; the mode page consumes + clears it on mount and submits. (Avoids
  a `?q=` in the URL.)
- **Web-LLM availability:** the card checks `navigator.gpu`; if absent, it renders disabled
  with a "needs WebGPU (Chrome/Edge)" note.
- Card content lives in one `MODES` descriptor (single source for labels, blurbs,
  capabilities, examples, default model) reused by the picker and the mode-route setup.

### 3. The mode routes (`/chat/[mode]`)

The existing chat surface — `ChatShell`/`ChatComposer`/`ChatHistory` + the block/inline
renderer — extracted into a reusable piece the `[mode]` page renders, scoped to one engine:

- On mount/`$effect`: derive the engine from `params.mode` + `?model=`, set `llm` state
  accordingly (simulated → `enabled=false`; openrouter/webllm → `enabled=true`, provider,
  and the model from `?model=` or default). No mode Toggle.
- OpenRouter/Web-LLM keep their **model dropdown** + Web-LLM load/progress/ready/error UI;
  changing the model updates `?model=` (replaceState) and, for Web-LLM, resets the engine.
- A small **"Ask Rokkit ›"** eyebrow/breadcrumb links back to the picker (`/chat`).
- **History rail is mode-scoped:** it shows only conversations belonging to the current
  mode. Resuming a conversation stays in its own mode (routes to `/chat/{conv.mode}`).

### 4. Conversation mode tag + summary titles

- **Tag chat conversations with their mode.** Add optional `mode?: ChatProvider` to
  `Conversation`; `startNew('chat', query, mode)` records it (default the current engine).
  The rail filters chat conversations by `mode`; `bucketByRecency` gains an optional mode
  filter (or the caller filters). `/app` conversations are unaffected (`mode` undefined).
- **Summary titles (heuristic, A+B):** a `summarizeTitle(query)` helper strips leading
  filler (`show me`, `can you`, `please`, `give me`, `make (me)`, `build`, `generate`, …),
  collapses whitespace, caps ~40 chars, and upper-cases the first letter →
  `Bar chart of quarterly revenue`. The chat `startNew` uses it for the initial title.
  After the **first** assistant turn settles, if that turn produced exactly **one**
  component block, refine the title to the component's type label (`Bar chart`,
  `Products table`, `Sign-up form`, `List`) via a `refineChatTitle(convId)` call. Later
  turns don't re-title. `/app` titling is unchanged.
- **No dedup on the chat surface** — chat threads are real, multi-turn, and kept distinct
  (only `/app` upserts by title).

### 5. Module boundaries

| File | Change |
|---|---|
| `src/lib/components/SiteNav.svelte` | label "Chat demo" → "Ask Rokkit" |
| `src/routes/chat/+page.svelte` | becomes the picker — renders `<ModePicker/>` (chat UI moves to `[mode]`) |
| `src/routes/chat/[mode]/+page.svelte` (new) | validate mode (else redirect `/chat`); set engine from route + `?model=`; render the mode-scoped chat |
| `src/lib/chat-demo/components/ModePicker.svelte` (new) | the three cards + WebGPU check + example chips |
| `src/lib/chat-demo/components/ChatSurface.svelte` (new, extracted) | the shell/composer/history/stream + model dropdown, minus the mode Toggle — rendered by `[mode]` |
| `src/lib/chat-demo/modes.ts` (new) | the `MODES` descriptor (labels, blurbs, capabilities, examples, default models) + route↔engine map |
| `src/lib/chat-demo/store.svelte.ts` | drop `setMode` toggle usage; add `pendingPrompt` one-shot; set engine from route; keep submit flow |
| `src/lib/chat-demo/llm.svelte.ts` | expose a "set engine for mode+model" helper; unchanged inference |
| `src/lib/koan/conversations.svelte.ts` | `mode` tag on chat conversations; `summarizeTitle` + `refineChatTitle`; rail mode-filter |

## Testing

- **Unit** (`summarizeTitle`): filler stripping, whitespace collapse, length cap, casing;
  component-type label mapping for `refineChatTitle`.
- **Unit** (`conversations`): chat `startNew` records `mode`; rail filter returns only the
  requested mode's chat conversations; `/app` conversations unaffected; no chat dedup.
- **E2E:** nav shows "Ask Rokkit" (no "Chat demo"); `/chat` shows the three picker cards;
  clicking the Simulated card → `/chat/simulated` and the chat surface (no mode toggle);
  clicking an example chip enters the mode and a response appears (Simulated is
  deterministic/offline — safe in CI); an unknown mode (`/chat/bogus`) redirects to `/chat`.
  (OpenRouter/Web-LLM responses are not asserted in CI — no network/WebGPU.)
- **Gate:** `bun run check` + `theme-contrast.e2e.ts` (layout/routing change; new picker
  cards use the ink/paper token scale — no new theme tokens).

## Out of scope

- The block/inline-component renderer and the three engines' actual inference (unchanged).
- Any change to `/app` (Koan) or its conversation behavior.
- LLM-generated titles (heuristic only) and cross-mode history (kept separate).
