# Chat components as first-class `@rokkit/ui`

**Date:** 2026-06-24
**Status:** Design approved, pending spec review
**Area:** `@rokkit/ui` (new `ChatMessage` / `ChatTimeline` / `ChatComposer` / `ChatHistory` / `ChatShell`), `apps/learn` (migrate `/chat` then Koan `/app`, delete duplicates)

---

## Problem

The learn app has **two parallel, app-local chat implementations**, neither reusable:

1. **Koan `/app`** — `components/{ChatPanel, TimelineList, ConversationList}.svelte`. `ChatPanel` (composer) and `TimelineList` are already presentation-only, but live in the app; assistant responses are text + demo-id links (no inline component rendering).
2. **`/chat`** — a local `$lib/chat` lib (`ChatComposer` / `ChatStream` / `ChatMessage` / `ChatHistory`) plus `chat-demo`'s `BlockList` → `InlineComponent`, which **already renders inline charts/forms/tables/lists** via a hardcoded `switch` on a `tool` string, and a block data model (`prose | markdown | code | component | suggestions | error`).

The capabilities the user wants — a chat timeline that renders charts/forms inline, a composer that emits `change` (for predictions) and `submit` (to send), and a conversation history — already exist in prototype across these two surfaces. The work is to **consolidate them into one generic, dumb, event-driven set of first-class `@rokkit/ui` components** and migrate both surfaces onto it (so no duplication remains).

## Goals

- First-class, **presentation-only** chat components in `@rokkit/ui`: dumb, composable, event-driven, themeable.
- `@rokkit/ui` stays **dependency-pure** — no dependency on `@rokkit/chart`/`@rokkit/forms`. Rich/inline content is rendered by a **consumer-supplied snippet**.
- Three independent components (**history / timeline / interaction**) usable standalone **or** combined via a `ChatShell` wrapper.
- Preserve everything `/chat` renders today (interleaved prose → chart → prose, suggestions, code, errors) via the consumer snippet.
- Migrate both learn surfaces onto the shared components; delete the duplicated app-local components.

## Non-goals

- No network/transport in the components or this effort. Client-side API orchestration stays an **in-app example** for now (see Orchestration). A headless `createChat` store is a **future extraction** (deferred, not built here).
- No LLM/provider integration changes; the existing `chat-demo` store/transport is reused as the reference wiring.
- No built-in inline chart/form renderers in `@rokkit/ui`.

---

## Components (all in `@rokkit/ui`)

### Data model (`packages/ui/src/types/chat.ts`)

```ts
export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage<T = unknown> {
  id: string
  role: ChatRole
  /** Default body, rendered as markdown by the built-in body snippet. */
  text?: string
  timestamp?: string
  /** Drives the optional typing/error affordance; consumer sets it. */
  status?: 'streaming' | 'error' | 'done'
  /** Arbitrary payload (parts/blocks/chart spec/form schema) the consumer's `message` snippet reads. */
  data?: T
}

export interface ConversationSummary {
  id: string
  title: string
  timestamp?: string
}
```

### `ChatMessage.svelte`
One message; used by `ChatTimeline`, exported standalone.
- **Props:** `message: ChatMessage`, `relativeTime?: boolean`.
- **Snippets:** `body(message)` — default renders `message.text` via `MarkdownRenderer`; `avatar(message)`, `label(message)` optional.
- **Renders:** role-based alignment + bubble + label/avatar/timestamp chrome; reflects `status` (e.g. streaming caret, error styling) on the default body.
- Data-attribute hooks: `data-chat-message`, `data-role`, `data-status`.

### `ChatTimeline.svelte`
The timeline (message list).
- **Props:** `messages: ChatMessage[]`, `relativeTime?`, `autoscroll = true`.
- **Snippets:** `message(msg)` — override the whole bubble body (this is where consumers render charts/forms/interleaved parts; default delegates to `ChatMessage`); `empty`.
- **Interactions:** elements inside a bubble (suggestion chips, an inline form submit) are rendered by the consumer's `message` snippet and wire their own handlers directly — the timeline exposes no `onaction`; it stays a pure renderer. (Add a specific event later only if a *built-in* affordance like retry/copy is introduced.)
- **Behavior:** auto-scrolls to the newest message when `messages` grows or the last message's content changes (streaming); respects `autoscroll=false`.

### `ChatComposer.svelte`
The interaction/composer.
- **Props:** `value = $bindable('')`, `placeholder?`, `disabled?`, `busy?` (e.g. while awaiting a response).
- **Events:** `onsubmit(text)` (Enter, when non-empty + not busy; Shift+Enter inserts newline), `onchange(value)` (every keystroke → consumer drives predictions/autocomplete).
- **Snippets:** `suggestions`, `toolbar`, `leading` (e.g. brand mark).
- **Exported:** `focus()`.
- Data-attribute hooks: `data-chat-composer`.

### `ChatHistory.svelte`
The conversation history.
- **Props:** `conversations: ConversationSummary[]`, `activeId?: string | null`, `relativeTime?`.
- **Events:** `onselect(id)`, optional `onnew()`, `ondelete(id)`.
- **Snippets:** `item(conversation)` (override row render), `empty`, `header`.

### `ChatShell.svelte`
Composed convenience wrapper — pure layout over the three primitives (no store).
- **Props:** `messages`, `conversations?`, `activeConversationId?`, `value = $bindable('')`, `placeholder?`, `busy?`.
- **Events:** forwards `onsubmit`, `onchange`, `onselectConversation`, `onnew`, `onaction`.
- **Snippets:** pass-through `message`, `suggestions`, `toolbar`, `leading`, `historyItem`, `empty`.
- **Layout:** optional history rail (rendered only if `conversations` provided) + `ChatTimeline` (fills) + `ChatComposer` (docked bottom). Themed via data attributes; layout-only CSS in `base/`, visual CSS per style (matches the theme/layout separation convention).

Components are independent: a consumer can use `ChatTimeline` + `ChatComposer` without history, or drop in `ChatShell` for the standard arrangement.

---

## Inline rendering (the dumb seam)

`@rokkit/ui` renders only `text` (markdown). For an assistant message carrying a chart/form/parts in `message.data`, the consumer provides the `message` snippet and switches on `data` — owning the `@rokkit/chart` / `@rokkit/forms` imports. The existing `InlineComponent` switch (`mount_bar_chart`/`mount_table`/`mount_form`/`mount_list`) **moves into the learn app's consumer snippet**, unchanged in behavior. This keeps `@rokkit/ui` decoupled and the inline catalog an app concern.

## Orchestration (example-only for now — decision C)

The components are transport-free. The wiring `onsubmit → append user message → call API → (stream) → append/mutate assistant message → reflect status` lives in the **learn app** (the existing `chat-demo` store is reused as the reference orchestration). Streaming = the store mutates a message's `text`/`data` reactively and sets `status:'streaming'`; `ChatTimeline` auto-scrolls; the body shows a caret. A headless `createChat({ transport })` store in `@rokkit/states` is a **documented future extraction**, not built here.

---

## Migration (both surfaces — avoid duplication)

**Phase order in the plan:**
1. Build the 5 components + `types/chat.ts` + unit tests + a live doc page (`apps/learn`), exported from `@rokkit/ui` barrels.
2. **Migrate `/chat`:** replace the app-local `$lib/chat` lib with the `@rokkit/ui` components; move `BlockList`/`InlineComponent`'s chart/form switch into the consumer `message` snippet; keep the `chat-demo` store as orchestration. Delete `$lib/chat`.
3. **Migrate Koan `/app`:** replace `ChatPanel`/`TimelineList`/`ConversationList` with the shared components (or `ChatShell`); delete the duplicates. (Koan's text+demo-link responses become a simple `message` snippet.)

Both surfaces end on the shared components — no duplicated chat UI remains.

## Testing

- **Unit** (`vitest-browser-svelte`): role rendering + alignment; `ChatComposer` submit-on-Enter vs Shift+Enter newline; `onchange` fires per keystroke; `busy`/`disabled` blocks submit; `message` snippet override; `ChatTimeline` autoscroll on append; `ChatHistory` select. Export-manifest update.
- **E2e** (`apps/learn`, `/chat`): type → submit → assistant message with an inline chart renders via the snippet; history select switches conversation.
- Live doc page demonstrating standalone primitives **and** `ChatShell`.

## Decisions log

- Inline render: **consumer-supplied snippet** (no chart/forms dependency in `@rokkit/ui`).
- Body model: **whole-body snippet** (`ChatMessage<T>` with `text` + `data`); consumer snippet reproduces interleaved parts.
- Orchestration: **example-only now**, `createChat` store deferred.
- Names: `ChatMessage` / `ChatTimeline` / **`ChatComposer`** / `ChatHistory` / `ChatShell`.
- Composed wrapper **`ChatShell`** ships alongside the independent primitives.
- Migrate **both** `/chat` (first) and Koan `/app` to avoid duplication.
