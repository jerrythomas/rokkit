## Presentation-only chat components

The chat family in `@rokkit/ui` is **dumb on purpose**. None of the five
components — `ChatMessage`, `ChatComposer`, `ChatHistory`, `ChatTimeline`,
`ChatShell` — know how to talk to an LLM, persist a conversation, or stream
tokens. They render data you hand them and emit callbacks when the user acts.
State, transport, and persistence stay in your app.

```svelte
<script>
  import { ChatShell } from '@rokkit/ui'
  import type { ChatMessage } from '@rokkit/ui'

  let messages = $state<ChatMessage[]>([])
  let value = $state('')

  function handleSubmit(text) {
    messages.push({ id: crypto.randomUUID(), role: 'user', text })
    // …call your backend, push an assistant message back
  }
</script>

<ChatShell bind:value {messages} onsubmit={handleSubmit} />
```

## The primitives

- **`ChatMessage`** — one bubble. Reads `role`, optional `text` (rendered as
  markdown), `timestamp`, and `status`. Slots for `avatar` / `label` / `body`.
- **`ChatComposer`** — the input. Bindable `value`, `onsubmit` on Enter (Shift+Enter
  for newline), `busy` to lock during a response, `leading` / `toolbar` / `suggestions` slots.
- **`ChatHistory`** — the conversation sidebar. Takes `conversations`, marks
  `activeId`, emits `onselect` / `onnew` / `ondelete`.
- **`ChatTimeline`** — the scrolling message list (auto-scrolls to newest).
- **`ChatShell`** — composes History + Timeline + Composer into the full layout.

## The `message` snippet seam

`ChatTimeline` (and therefore `ChatShell`) renders each message with the
built-in `ChatMessage` markdown body by default. Supply a `message` snippet and
**you** decide how each turn renders. Because every message carries an arbitrary
`data` payload, the consumer can switch on `data.kind` to render rich content —
a chart, a form, a table — without the chat components ever importing those
libraries. The chat layer stays presentation-only; the rich rendering lives in
your app.

```svelte
<ChatShell {messages} bind:value onsubmit={handleSubmit}>
  {#snippet message(msg)}
    {#if msg.data?.kind === 'chart'}
      <!-- your app mounts @rokkit/chart here -->
      <div class="chart-card">📊 chart renders here</div>
    {:else}
      <ChatMessage message={msg} />
    {/if}
  {/snippet}
</ChatShell>
```

This is the dumb-component seam: the chat components own layout, scrolling, and
the composer; your app owns what a message *means*.
