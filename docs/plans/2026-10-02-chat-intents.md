# Chat that understands follow-ups: interpret → act → render

**Status:** IN PROGRESS. Agreed 2026-10-02. Done so far:
- slice 1, the intent core (`4fb8a53df`);
- slice 2, simulated mode on the local interpreter, with the regex routes removed
  (`f30b85b5a`);
- selection feeding the chat (`4e16acb7d`).

Order agreed with the owner: slices 1–2, then selection, then inline prop controls, then
slices 3–4.

**App:** `apps/learn` (chat demo `/chat/[mode]`, Koan catalogue)
**Supersedes:** the regex `ROUTES` table in `lib/chat-demo/router.ts`, and the client-built LLM
prompt (`prompt.ts`) and `/api/llm/openrouter` for chat turns.
**Builds on:** `docs/backlog/2026-05-23-interactive-koan-mode.md` (show / how-to / refine).

## Problem

A conversation can only follow paths that were written in advance.

- **Simulated mode** matches the first regex out of 12 `ROUTES`, and each route hardcodes its
  chips. A chip's query goes back through the same regexes: "Same table with custom column
  labels" matches `table` again and shows the same products table.
- **The LLM modes** send only the system prompt and the current message, so the model never sees
  earlier turns. It also never sees the 56-demo catalogue: it can only produce one of 7 block
  types.
- **There is no conversation state.** Nothing records which demo is on screen, with what data
  and props. Only pasted data gets real action chips.

## Design

Each turn has three parts, the same shape as the graph interactions (an intent from state, with
`act` going through a table of handlers):

```text
message + ChatSession state ──interpret──► Interpretation ──act (intents table)──► Block[] + next state
```

### 1. Conversation state: read back from the conversation (as built)

- **The screen** (`{ demo, variant?, props, data?, selected? }`) is not stored separately. It is
  the last `demo` block in the conversation (`screenFrom`), so a resumed chat knows what is
  showing. The user's selection is added while its block is the screen.
- **Every chip carries a ready-made `Interpretation`**, so clicking one goes straight to
  `act`; a chip is never text to match again.
- *Planned and not built:* a `ChatSession` class and a `recent` turn summary. Slice 3 sends
  `recent` to the server interpreter, derived from the turns in the same way.

### 2. `Interpretation`: the only thing an interpreter returns

```ts
type Interpretation = {
	intent: 'show' | 'modify' | 'reshape' | 'explain' | 'clarify'
	demo?: string // a catalogue id, validated
	variant?: string // one of that demo's variants
	props?: Record<string, unknown> // validated against the demo's `props` schema
	view?: 'table' | 'chart' | 'list' | 'form' // for reshape
	topic?: string // for explain
	confidence: number // 0–1; below CLARIFY_BELOW → clarify
	options?: Interpretation[] // for clarify: the candidates, rendered as chips
}
```

### 3. The intents table (`act`)

| Intent | Renders | Next state |
| --- | --- | --- |
| `show` | inline component when `InlineComponent` supports the tool; otherwise a new `demo` block (title, description, link to `/app/<id>`), plus chips for its variants and props | `screen` = that demo |
| `modify` | the demo on screen remounted with merged props | `screen.props` merged |
| `reshape` | `screen.data` (or the demo's sample, or the selected part) through `inferShape(force: view)` | `screen` = new view |
| `explain` | the best-matching section of that demo's `docs.md` (MiniSearch over sections), as markdown: real docs, nothing generated | unchanged |
| `clarify` | one line plus the `options` as chips | unchanged |

Chips are generated from data, not written per route:
- the screen demo's `variants`;
- its `props` schema (an enum → one chip per option, a boolean → a toggle);
- "as a table / chart" for reshapeable data;
- "how does it work?" for `explain`.

### 4. Interpreters: three backends, one contract

All three return an `Interpretation`, and the server checks it against the catalogue
(`validate`): an unknown demo, variant or prop is dropped, and an empty result becomes
`clarify`.

1. **Local** (`interpret/local.ts`, client, no network). This is simulated mode and the fallback
   for every other mode.
   - A MiniSearch shortlist over the catalogue (the index `koan/catalog.ts` already builds).
   - Verb cues pick the intent: "how / why" → explain; "as a / same data" → reshape; a prop
     word for the screen demo → modify.
   - Prop values come from the demo's `props` schema (enum options and boolean labels).
   - This replaces `ROUTES`.
2. **System One** (server, `POST /api/chat/interpret`, enabled when `OLLAMA_URL` is set).
   - One `/v1/systemone` request asks several questions at once:
     - `intent` (a choice of 5);
     - `demo` (a choice over the shortlist plus the screen demo, max 26 options);
     - one question per prop on the screen demo's schema (enum → choice, boolean → noul).
   - Measured locally on 2026-10-02 with `nimble` on Ollama 0.35:
     - correct on the four follow-ups tried;
     - about 0.7 s warm and 8.4 s cold;
     - "hmm" scored 0.23 confidence.
   - **System One is local-only (no Ollama cloud)**, so this backend serves dev and self-hosted
     setups. The deployed Worker doesn't use it.
3. **LLM classifier** (server, same endpoint, OpenRouter free models only).
   - The server owns the prompt: the compact shortlist, the screen state and the recent turns
     go in, and one JSON `Interpretation` comes back (json_object mode).
   - It may also fill `props` that a schema can't enumerate, such as chart data. These are still
     validated against the demo's tool `parameters`.
   - WebLLM runs the same prompt in the browser.

`GET /api/chat/interpret` reports which backends the server has. The mode picker offers
System One only when it is available.

### Security and cost

- The browser sends only `{ message, screen, recent }`. The server builds the prompt or the
  questions, so there is no client-supplied prompt.
- Bounds: message ≤ 2,000 chars, at most 6 `recent` entries, `screen.demo` must be a catalogue
  id. Requests are capped at 64 KiB (the System One limit).
- Free models only (owner decision, 2026-10-02). There is no paid classifier, and `jev-router`
  is out.
- Upstream errors go through `upstreamProblem` (no account details).

## What is removed (superseded)

- `router.ts`, done in slice 2: `ROUTES`, `FALLBACK`, `routeQuery`, and also `routeData`, since
  pasted data now goes through `pastedBlocks` and `act`. The shape inference (`infer.ts`) stays,
  because `reshape` uses it.
- The hand-written chips per route.
- The chat's use of `prompt.ts`/`parse.ts` fences and `/api/llm/openrouter`, once slice 4 has
  moved every chat mode onto `/api/chat/interpret`. If nothing else calls the old endpoint,
  slice 4 deletes it, together with its `upstreamRequest` allowlist.

**Decision recorded here:** free-form LLM compositions (a model inventing a plot fence with
made-up data) are dropped in favour of chosen demos. The LLM classifier can still pass `data`
props, validated, so "plot sales by month" can still mount a chart with data.

## Slices (each test-first: red, then green)

1. **Intent core.**
   - `Interpretation` type, `validate` against the catalogue, `ChatSession` and the intents
     table for all five intents.
   - The `demo` block, and chips generated from variants, props and reshape.
   - Unit specs only. Nothing is wired yet.
2. **Local interpreter**, then wire simulated mode to `ChatSession` and remove `ROUTES` and
   `routeQuery`.
   - A spec of follow-up sequences that today's routes get wrong (the "custom column labels"
     case, "show the same data as a table" after a chart).
   - E2e: a three-turn conversation in simulated mode.
3. **`/api/chat/interpret` with System One.**
   - Request bounds, building the questions from the shortlist and the prop schema, mapping the
     answers to an `Interpretation`, the confidence threshold, and capabilities.
   - Spec with a mocked Ollama, plus one live check against local `nimble`.
4. **The LLM-classifier backend** (OpenRouter free and WebLLM) on the same contract.
   - Move the openrouter mode onto it, then delete `/api/llm/openrouter`, `prompt.ts` and
     `parse.ts` if nothing else uses them.
5. **Docs and close-out.** The design doc entry, journal, `12-priority.md`, and the chat page's
   mode picker copy.

### Added after agreement

- **Selection feeds the chat (done).** A clicked row or item gives the reply its own chips
  ("Edit “Phone”", "Open “General”"). A typed reference ("edit this row") means the selection
  while its demo is on screen.
- **Inline prop controls (next).** The demo's prop schema rendered as controls under it, so a
  change can be made directly as well as by typing or a chip.

## Open questions

- `CLARIFY_BELOW`: proposed 0.5, to be tuned from slice-3 measurements.
- Koan's `/app` shell uses the same catalogue with `runMatch`. Once slice 2 works, it could use
  the local interpreter too. Not in scope here.
