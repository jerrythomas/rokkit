# 26 — Ask Rokkit: a chat that follows up

Status: **built** (2026-10-02). Plan and slice history: `docs/plans/2026-10-02-chat-intents.md`.
Code: `apps/learn/src/lib/chat-demo/intent/`, `apps/learn/src/routes/api/chat/interpret/`.

The owner's ask: *"follow up chat questions can actually be implemented as actions (interpret
user request and identify most suitable demo/example). this will avoid getting stuck at a fixed
demo."* Before this, simulated mode answered from 12 regexes, each with hand-written chips that
fed back into the same regexes. The LLM modes saw only the current message, and could only
produce seven fence types; they never saw the catalogue.

## One loop, every mode

```text
message + screen ──interpret──► Interpretation ──validate──► act (intents table) ──► blocks
```

- **The catalogue is the action space.** The 56 Koan demos, with their variants, prop schemas
  and `docs.md`. Anything the catalogue has, the chat can show, change or explain. Nothing is
  written per demo.
- **`Interpretation`** has an intent, one of show / modify / reshape / explain / clarify, plus
  a demo, variant, props, view, topic, data, a confidence and options.
- **`validate`** checks a reading against the catalogue: real demos and variants, and props
  through the demo's schema. Show data is bounded to 200 flat rows for a data demo. A reading
  that does not survive, or is below `CLARIFY_BELOW` (0.5), becomes a question back offering
  its runners-up. Every interpreter's reading goes through it.
- **`act`** returns the reply. A reply that changes the screen carries a `demo` block. **The
  screen is the last `demo` block** (`screenFrom`), so it is never stored separately and a
  resumed chat knows what is showing.
- **`renderPlan`** draws a demo block in one of four ways: the inline table, list or form; a
  plot (the chart kinds are variants of `chart`); the demo's own live component (the 44 that
  `/app` mounts standalone); or a card linking to its page.

## Follow-ups

- **Chips come from data.** They are the screen demo's variants, the values of its prop schema
  (deduplicated against variants), the other views its data can take, and "how does it work?".
  Each carries an `Interpretation`, so clicking one goes straight to `act`.
- **Selection feeds the chat.** A clicked row or item gets its own chips ("Edit “Phone”",
  "Open “General”"). "edit this row" means the selection while its demo is the screen; the
  selection is keyed by the block's content.
- **Live controls.** The screen demo shows its prop schema as controls (Koan's `Tweaks`). A
  change rewrites the block in place (`updateLastAssistantBlocks`), so it adds no turn and the
  next turn sees it.
- **Pasted data** goes through the same engine: its shape is inferred, and it becomes the screen.

## Interpreters

| Backend | Where | Enabled by | Notes |
| --- | --- | --- | --- |
| Local | browser | always | cue words, plus catalogue search, plus the screen demo's prop schema. Confidence is the top hit's lead over the next. |
| System One | server → Ollama `/v1/systemone` | `OLLAMA_URL`, plus `SYSTEMONE_MODEL` (default `nimble`) | local-only in Ollama, no cloud |
| OpenRouter | server → a curated free model | `OPENROUTER_API_KEY` | server-owned prompt, json_object |
| Web-LLM | browser (WebGPU) | the mode | the same prompt as OpenRouter |

**The hybrid** (`interpretWith`) answers a direct local reading at once: a named demo, a prop
or variant word, a reshape or explain cue, or a reference to the selection. Only the rest go
to the backend. An LLM is still asked about every `show`, because it can bring data. A failed
backend falls back to the local reading, and the reply says why.

**Measured** on 22 messages, scored after validation (`spec/chat-demo/interpreter-eval.spec.ts`,
opt-in with `CHAT_EVAL_URL`):

| | Score | Average time |
| --- | --- | --- |
| Local alone | 18/22 | instant |
| System One alone | 16/22 | |
| System One hybrid | 20/22 | about 0.5 s |
| OpenRouter hybrid (Nemotron 3 Super, free) | 21/22 | about 1.6 s |

Local and System One fail on different messages, which is why the hybrid works. Two prompt
findings were also measured:
- **Prop and variant questions.** Asking *"what should it become?"* read "smaller" as
  `lineStyle = none`. The questions now ask *"does the message change it?"* with the leave-it
  answer first, and keep only sure answers that change something.
- **A sharper `show` description** scored lower (19/22) and was reverted.

## Trust boundary

- The browser sends `{ message, screen summary, recent }` and never the screen's data;
  `interpretRequest` drops it if sent.
- The server builds every prompt and every set of System One questions. Nothing the browser
  sends is a prompt.
- Models are the curated free list only (owner decision, 2026-10-02).
- Upstream errors pass on a status and a one-line message, never account details
  (`upstreamProblem`).
- A reading is a proposal: the browser validates it against the catalogue before acting.

## The Koan `/app` shell

The shell renders its own conversation, so a reading becomes a shell action
(`lib/koan/shell-intent.ts`), not chat blocks:
- **show** opens any catalogue demo or `?variant=`. Before, it reached 14 and opened Tabs for the
  rest, including no match.
- **modify** sets props in place (TweakTurns), or switches to a variant.
- **explain** opens the Docs view.
- **anything unplaced** goes back to the landing with the message kept, where its closest demos
  are suggested.

The old tweak grammar (`tweak-parser.ts`) was removed. A parity spec runs its phrasings over
every enum and boolean prop in the catalogue.

## Fixed after the first build

- **Duplicate points on line and area charts.** Generated data often has several rows per x per
  series, which drew a sawtooth. The line and area kinds now sum y by x and series.
- **Negation.** "remove the stripes" no longer switches on the "Striped rows" variant before
  turning the prop off.
