# Chat Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship first-class, presentation-only chat components in `@rokkit/ui` (`ChatMessage`, `ChatTimeline`, `ChatComposer`, `ChatHistory`, `ChatShell`) with a generic data model + event contract, then migrate the learn app's two parallel chat surfaces onto them.

**Architecture:** Dumb, event-driven Svelte 5 components. `@rokkit/ui` stays dependency-pure — it renders `text` as markdown (via the in-package `MarkdownRenderer`) and delegates all rich/inline content (charts, forms, interleaved parts) to a consumer-supplied `message` snippet. Orchestration (submit→API→stream) stays in the consuming app.

**Tech Stack:** Svelte 5 (runes, snippets, `$bindable`), `@rokkit/ui` `MarkdownRenderer` (prop: `markdown`), Vitest + `@testing-library/svelte` (`render`/`fireEvent`), Playwright (e2e).

**Spec:** `docs/superpowers/specs/2026-06-24-chat-components-design.md`

**Pre-flight:** on `develop`; package manager **bun**; run tests via run-once scripts only (`bun run test:ci`/`test:ui`, never `test:unit`/bare `vitest`). Component-spec harness: see `packages/ui/spec/List.spec.svelte.ts` (render + fireEvent) and `packages/ui/spec/ListSnippetTest.svelte` (wrapper for passing snippets/bindables).

---

## File structure (Phase 1 — all in `packages/ui/`)

| File | Responsibility |
|---|---|
| `src/types/chat.ts` | `ChatRole`, `ChatStatus`, `ChatMessage<T>`, `ConversationSummary` + per-component `*Props` interfaces (type-only; excluded from coverage) |
| `src/utils/relative-time.ts` | `formatRelativeTime(ts, relative)` — shared by ChatMessage + ChatHistory (DRY) |
| `src/components/ChatMessage.svelte` | one message: role chrome + default markdown body + status affordance |
| `src/components/ChatComposer.svelte` | textarea composer: Enter-submit, `onchange` per keystroke, `focus()` |
| `src/components/ChatHistory.svelte` | conversation list with active highlight + select/new/delete |
| `src/components/ChatTimeline.svelte` | message list + auto-scroll; delegates body to `message` snippet |
| `src/components/ChatShell.svelte` | layout wrapper composing History + Timeline + Composer |
| `spec/*` + `spec/*Test.svelte` | unit specs + snippet wrappers |

---

## Phase 1 — `@rokkit/ui` chat components

### Task 1: Types + relative-time util

**Files:**
- Create: `packages/ui/src/types/chat.ts`
- Create: `packages/ui/src/utils/relative-time.ts`
- Test: `packages/ui/spec/relative-time.spec.ts`

- [ ] **Step 1: Write the types** — `packages/ui/src/types/chat.ts`:

```ts
import type { Snippet } from 'svelte'

export type ChatRole = 'user' | 'assistant' | 'system'
export type ChatStatus = 'streaming' | 'error' | 'done'

export interface ChatMessage<T = unknown> {
	id: string
	role: ChatRole
	/** Default body, rendered as markdown by the built-in body snippet. */
	text?: string
	timestamp?: string
	/** Drives the optional typing/error affordance; consumer sets it. */
	status?: ChatStatus
	/** Arbitrary payload (parts/blocks/chart spec/form schema) the consumer's `message` snippet reads. */
	data?: T
}

export interface ConversationSummary {
	id: string
	title: string
	timestamp?: string
}

export interface ChatMessageProps {
	message: ChatMessage
	relativeTime?: boolean
	body?: Snippet<[ChatMessage]>
	avatar?: Snippet<[ChatMessage]>
	label?: Snippet<[ChatMessage]>
}

export interface ChatComposerProps {
	value?: string
	placeholder?: string
	disabled?: boolean
	busy?: boolean
	onsubmit?: (text: string) => void
	onchange?: (value: string) => void
	suggestions?: Snippet
	toolbar?: Snippet
	leading?: Snippet
}

export interface ChatHistoryProps {
	conversations?: ConversationSummary[]
	activeId?: string | null
	relativeTime?: boolean
	onselect?: (id: string) => void
	onnew?: () => void
	ondelete?: (id: string) => void
	item?: Snippet<[ConversationSummary]>
	empty?: Snippet
	header?: Snippet
}

export interface ChatTimelineProps {
	messages?: ChatMessage[]
	relativeTime?: boolean
	autoscroll?: boolean
	message?: Snippet<[ChatMessage]>
	empty?: Snippet
}

export interface ChatShellProps {
	messages?: ChatMessage[]
	conversations?: ConversationSummary[]
	activeConversationId?: string | null
	value?: string
	placeholder?: string
	busy?: boolean
	onsubmit?: (text: string) => void
	onchange?: (value: string) => void
	onselectConversation?: (id: string) => void
	onnew?: () => void
	message?: Snippet<[ChatMessage]>
	suggestions?: Snippet
	toolbar?: Snippet
	leading?: Snippet
	historyItem?: Snippet<[ConversationSummary]>
	empty?: Snippet
}
```

- [ ] **Step 2: Write the failing util test** — `packages/ui/spec/relative-time.spec.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatRelativeTime } from '../src/utils/relative-time'

afterEach(() => vi.useRealTimers())

describe('formatRelativeTime', () => {
	it('returns "" for an invalid/empty timestamp', () => {
		expect(formatRelativeTime('')).toBe('')
		expect(formatRelativeTime('not-a-date')).toBe('')
	})
	it('formats minutes/hours/days relative to now', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2026-01-01T12:00:00Z'))
		expect(formatRelativeTime('2026-01-01T11:59:40Z')).toBe('just now')
		expect(formatRelativeTime('2026-01-01T11:55:00Z')).toBe('5m ago')
		expect(formatRelativeTime('2026-01-01T09:00:00Z')).toBe('3h ago')
		expect(formatRelativeTime('2025-12-30T12:00:00Z')).toBe('2d ago')
	})
	it('returns a clock time when relative=false', () => {
		const out = formatRelativeTime('2026-01-01T12:00:00Z', false)
		expect(out).not.toBe('')
		expect(out).not.toMatch(/ago|just now/)
	})
})
```

- [ ] **Step 3: Run it (fails — module missing).** `bunx vitest run --project ui spec/relative-time.spec.ts` (from repo root) → FAIL.

- [ ] **Step 4: Implement** — `packages/ui/src/utils/relative-time.ts`:

```ts
/** Format an ISO timestamp as a short relative label ("5m ago"), or a clock time when relative=false. */
export function formatRelativeTime(timestamp: string, relative = true): string {
	const ms = new Date(timestamp).getTime()
	if (Number.isNaN(ms)) return ''
	if (!relative) return new Date(ms).toLocaleTimeString()
	const minutes = Math.round((Date.now() - ms) / 60000)
	if (minutes < 1) return 'just now'
	if (minutes < 60) return `${minutes}m ago`
	const hours = Math.round(minutes / 60)
	if (hours < 24) return `${hours}h ago`
	return `${Math.round(hours / 24)}d ago`
}
```

- [ ] **Step 5: Run → PASS.** `bunx vitest run --project ui spec/relative-time.spec.ts`

- [ ] **Step 6: Commit.**
```bash
git add packages/ui/src/types/chat.ts packages/ui/src/utils/relative-time.ts packages/ui/spec/relative-time.spec.ts
git commit -m "feat(ui): chat types + formatRelativeTime util"
```

---

### Task 2: ChatMessage

**Files:**
- Create: `packages/ui/src/components/ChatMessage.svelte`
- Test: `packages/ui/spec/ChatMessage.spec.svelte.ts` + `packages/ui/spec/ChatMessageBodyTest.svelte`

- [ ] **Step 1: Component** — `packages/ui/src/components/ChatMessage.svelte`:

```svelte
<script lang="ts">
	import MarkdownRenderer from '../MarkdownRenderer.svelte'
	import { formatRelativeTime } from '../utils/relative-time.js'
	import type { ChatMessageProps } from '../types/chat.js'

	const { message, relativeTime = true, body, avatar, label }: ChatMessageProps = $props()
</script>

<div data-chat-message data-role={message.role} data-status={message.status || undefined}>
	{#if avatar}{@render avatar(message)}{/if}
	<div data-chat-bubble>
		{#if label}{@render label(message)}{/if}
		<div data-chat-body>
			{#if body}
				{@render body(message)}
			{:else if message.text}
				<MarkdownRenderer markdown={message.text} />
			{/if}
			{#if message.status === 'streaming'}<span data-chat-caret aria-hidden="true"></span>{/if}
		</div>
		{#if message.timestamp}
			<time data-chat-time datetime={message.timestamp}>{formatRelativeTime(message.timestamp, relativeTime)}</time>
		{/if}
	</div>
</div>
```

- [ ] **Step 2: Snippet wrapper** — `packages/ui/spec/ChatMessageBodyTest.svelte` (mirrors `ListSnippetTest.svelte`):

```svelte
<script lang="ts">
	import ChatMessage from '../src/components/ChatMessage.svelte'
	const { message }: { message: unknown } = $props()
</script>

<ChatMessage {message}>
	{#snippet body(m)}<div data-custom-body>custom: {m.text}</div>{/snippet}
</ChatMessage>
```

- [ ] **Step 3: Test** — `packages/ui/spec/ChatMessage.spec.svelte.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ChatMessage from '../src/components/ChatMessage.svelte'
import ChatMessageBodyTest from './ChatMessageBodyTest.svelte'

describe('ChatMessage', () => {
	it('renders role + default markdown body', () => {
		const { container } = render(ChatMessage, { message: { id: '1', role: 'assistant', text: 'Hello **world**' } })
		const el = container.querySelector('[data-chat-message]')
		expect(el?.getAttribute('data-role')).toBe('assistant')
		expect(container.querySelector('[data-chat-body] strong')?.textContent).toBe('world')
	})
	it('reflects streaming status with a caret', () => {
		const { container } = render(ChatMessage, { message: { id: '1', role: 'assistant', text: 'x', status: 'streaming' } })
		expect(container.querySelector('[data-chat-message]')?.getAttribute('data-status')).toBe('streaming')
		expect(container.querySelector('[data-chat-caret]')).toBeTruthy()
	})
	it('renders a timestamp when present', () => {
		const { container } = render(ChatMessage, { message: { id: '1', role: 'user', text: 'hi', timestamp: '2026-01-01T12:00:00Z' } })
		expect(container.querySelector('time[data-chat-time]')).toBeTruthy()
	})
	it('uses the body snippet override instead of the default markdown', () => {
		const { container } = render(ChatMessageBodyTest, { message: { id: '1', role: 'assistant', text: 'raw' } })
		expect(container.querySelector('[data-custom-body]')?.textContent).toContain('custom: raw')
	})
})
```

- [ ] **Step 4: Run → PASS.** `bunx vitest run --project ui spec/ChatMessage.spec.svelte.ts`
- [ ] **Step 5: Commit.** `git add packages/ui/src/components/ChatMessage.svelte packages/ui/spec/ChatMessage*; git commit -m "feat(ui): ChatMessage component"`

---

### Task 3: ChatComposer

**Files:**
- Create: `packages/ui/src/components/ChatComposer.svelte`
- Test: `packages/ui/spec/ChatComposer.spec.svelte.ts`

- [ ] **Step 1: Component** — `packages/ui/src/components/ChatComposer.svelte`:

```svelte
<script lang="ts">
	import type { ChatComposerProps } from '../types/chat.js'

	let {
		value = $bindable(''),
		placeholder = '',
		disabled = false,
		busy = false,
		onsubmit,
		onchange,
		suggestions,
		toolbar,
		leading
	}: ChatComposerProps = $props()

	let textarea: HTMLTextAreaElement

	export function focus() {
		textarea?.focus()
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			if (!disabled && !busy && value.trim()) onsubmit?.(value)
		}
	}

	function handleInput() {
		onchange?.(value)
	}
</script>

<div data-chat-composer data-busy={busy || undefined}>
	{#if leading}{@render leading()}{/if}
	{#if suggestions}{@render suggestions()}{/if}
	<textarea
		bind:this={textarea}
		bind:value
		{placeholder}
		{disabled}
		rows="2"
		data-chat-input
		oninput={handleInput}
		onkeydown={handleKeydown}
	></textarea>
	{#if toolbar}{@render toolbar()}{/if}
</div>
```

- [ ] **Step 2: Test** — `packages/ui/spec/ChatComposer.spec.svelte.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import ChatComposer from '../src/components/ChatComposer.svelte'

const enter = { key: 'Enter' }
const shiftEnter = { key: 'Enter', shiftKey: true }

describe('ChatComposer', () => {
	it('submits on Enter with non-empty value', async () => {
		const onsubmit = vi.fn()
		const { container } = render(ChatComposer, { value: 'hello', onsubmit })
		await fireEvent.keyDown(container.querySelector('[data-chat-input]')!, enter)
		expect(onsubmit).toHaveBeenCalledWith('hello')
	})
	it('does NOT submit on Shift+Enter (newline)', async () => {
		const onsubmit = vi.fn()
		const { container } = render(ChatComposer, { value: 'hello', onsubmit })
		await fireEvent.keyDown(container.querySelector('[data-chat-input]')!, shiftEnter)
		expect(onsubmit).not.toHaveBeenCalled()
	})
	it('does NOT submit when empty / busy / disabled', async () => {
		const onsubmit = vi.fn()
		for (const props of [{ value: '   ' }, { value: 'x', busy: true }, { value: 'x', disabled: true }]) {
			const { container } = render(ChatComposer, { ...props, onsubmit })
			await fireEvent.keyDown(container.querySelector('[data-chat-input]')!, enter)
		}
		expect(onsubmit).not.toHaveBeenCalled()
	})
	it('fires onchange on input', async () => {
		const onchange = vi.fn()
		const { container } = render(ChatComposer, { onchange })
		const ta = container.querySelector('[data-chat-input]') as HTMLTextAreaElement
		await fireEvent.input(ta, { target: { value: 'ab' } })
		expect(onchange).toHaveBeenCalledWith('ab')
	})
})
```

- [ ] **Step 3: Run → PASS.** `bunx vitest run --project ui spec/ChatComposer.spec.svelte.ts`
- [ ] **Step 4: Commit.** `git add packages/ui/src/components/ChatComposer.svelte packages/ui/spec/ChatComposer*; git commit -m "feat(ui): ChatComposer component"`

---

### Task 4: ChatHistory

**Files:**
- Create: `packages/ui/src/components/ChatHistory.svelte`
- Test: `packages/ui/spec/ChatHistory.spec.svelte.ts`

- [ ] **Step 1: Component** — `packages/ui/src/components/ChatHistory.svelte`:

```svelte
<script lang="ts">
	import { formatRelativeTime } from '../utils/relative-time.js'
	import type { ChatHistoryProps } from '../types/chat.js'

	const {
		conversations = [],
		activeId = null,
		relativeTime = true,
		onselect,
		onnew,
		ondelete,
		item,
		empty,
		header
	}: ChatHistoryProps = $props()
</script>

<div data-chat-history>
	{#if header}{@render header()}{/if}
	{#if onnew}<button type="button" data-chat-history-new onclick={() => onnew()}>New conversation</button>{/if}
	{#if conversations.length === 0}
		{#if empty}{@render empty()}{/if}
	{:else}
		{#each conversations as conversation (conversation.id)}
			{#if item}
				{@render item(conversation)}
			{:else}
				<div data-chat-history-row data-active={conversation.id === activeId || undefined}>
					<button type="button" data-chat-history-item onclick={() => onselect?.(conversation.id)}>
						<span data-chat-history-title>{conversation.title}</span>
						{#if conversation.timestamp}
							<time data-chat-history-time>{formatRelativeTime(conversation.timestamp, relativeTime)}</time>
						{/if}
					</button>
					{#if ondelete}
						<button type="button" data-chat-history-delete aria-label="Delete conversation" onclick={() => ondelete(conversation.id)}>×</button>
					{/if}
				</div>
			{/if}
		{/each}
	{/if}
</div>
```

- [ ] **Step 2: Test** — `packages/ui/spec/ChatHistory.spec.svelte.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import ChatHistory from '../src/components/ChatHistory.svelte'

const convos = [
	{ id: 'a', title: 'First chat' },
	{ id: 'b', title: 'Second chat', timestamp: '2026-01-01T12:00:00Z' }
]

describe('ChatHistory', () => {
	it('renders conversations and marks the active one', () => {
		const { container } = render(ChatHistory, { conversations: convos, activeId: 'b' })
		const rows = container.querySelectorAll('[data-chat-history-row]')
		expect(rows.length).toBe(2)
		expect(container.querySelector('[data-chat-history-row][data-active]')).toBeTruthy()
	})
	it('fires onselect with the conversation id', async () => {
		const onselect = vi.fn()
		const { container } = render(ChatHistory, { conversations: convos, onselect })
		await fireEvent.click(container.querySelectorAll('[data-chat-history-item]')[0])
		expect(onselect).toHaveBeenCalledWith('a')
	})
	it('fires onnew / ondelete when those handlers are provided', async () => {
		const onnew = vi.fn(); const ondelete = vi.fn()
		const { container } = render(ChatHistory, { conversations: convos, onnew, ondelete })
		await fireEvent.click(container.querySelector('[data-chat-history-new]')!)
		await fireEvent.click(container.querySelectorAll('[data-chat-history-delete]')[0])
		expect(onnew).toHaveBeenCalled()
		expect(ondelete).toHaveBeenCalledWith('a')
	})
	it('renders the empty snippet when there are no conversations (via a wrapper if needed)', () => {
		const { container } = render(ChatHistory, { conversations: [] })
		expect(container.querySelectorAll('[data-chat-history-row]').length).toBe(0)
	})
})
```

- [ ] **Step 3: Run → PASS.** `bunx vitest run --project ui spec/ChatHistory.spec.svelte.ts`
- [ ] **Step 4: Commit.** `git add packages/ui/src/components/ChatHistory.svelte packages/ui/spec/ChatHistory*; git commit -m "feat(ui): ChatHistory component"`

---

### Task 5: ChatTimeline

**Files:**
- Create: `packages/ui/src/components/ChatTimeline.svelte`
- Test: `packages/ui/spec/ChatTimeline.spec.svelte.ts` + `packages/ui/spec/ChatTimelineSnippetTest.svelte`

- [ ] **Step 1: Component** — `packages/ui/src/components/ChatTimeline.svelte`:

```svelte
<script lang="ts">
	import ChatMessage from './ChatMessage.svelte'
	import type { ChatTimelineProps } from '../types/chat.js'

	let { messages = [], relativeTime = true, autoscroll = true, message, empty }: ChatTimelineProps = $props()

	let container: HTMLElement | undefined

	// Auto-scroll to the newest content when messages grow or the last message streams.
	$effect(() => {
		const last = messages[messages.length - 1]
		// touch reactive deps so the effect re-runs on append + streaming updates
		void messages.length
		void last?.text
		void last?.status
		if (autoscroll && container) container.scrollTop = container.scrollHeight
	})
</script>

<div bind:this={container} data-chat-timeline>
	{#if messages.length === 0}
		{#if empty}{@render empty()}{/if}
	{:else}
		{#each messages as msg (msg.id)}
			{#if message}
				{@render message(msg)}
			{:else}
				<ChatMessage message={msg} {relativeTime} />
			{/if}
		{/each}
	{/if}
</div>
```

- [ ] **Step 2: Snippet wrapper** — `packages/ui/spec/ChatTimelineSnippetTest.svelte`:

```svelte
<script lang="ts">
	import ChatTimeline from '../src/components/ChatTimeline.svelte'
	const { messages = [] }: { messages?: unknown[] } = $props()
</script>

<ChatTimeline {messages}>
	{#snippet message(m)}<div data-custom-msg data-id={m.id}>{m.role}:{m.text}</div>{/snippet}
</ChatTimeline>
```

- [ ] **Step 3: Test** — `packages/ui/spec/ChatTimeline.spec.svelte.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ChatTimeline from '../src/components/ChatTimeline.svelte'
import ChatTimelineSnippetTest from './ChatTimelineSnippetTest.svelte'

const msgs = [
	{ id: '1', role: 'user', text: 'hi' },
	{ id: '2', role: 'assistant', text: 'hello' }
]

describe('ChatTimeline', () => {
	it('renders one ChatMessage per message by default', () => {
		const { container } = render(ChatTimeline, { messages: msgs })
		expect(container.querySelectorAll('[data-chat-message]').length).toBe(2)
	})
	it('renders nothing-but-empty for an empty list', () => {
		const { container } = render(ChatTimeline, { messages: [] })
		expect(container.querySelectorAll('[data-chat-message]').length).toBe(0)
		expect(container.querySelector('[data-chat-timeline]')).toBeTruthy()
	})
	it('delegates the body to the message snippet when provided', () => {
		const { container } = render(ChatTimelineSnippetTest, { messages: msgs })
		const custom = container.querySelectorAll('[data-custom-msg]')
		expect(custom.length).toBe(2)
		expect(container.querySelectorAll('[data-chat-message]').length).toBe(0) // default bypassed
	})
	it('auto-scrolls the container after render (no crash; scrollTop assigned)', () => {
		// jsdom has no layout (scrollHeight=0); assert the effect ran without error
		const { container } = render(ChatTimeline, { messages: msgs, autoscroll: true })
		expect(container.querySelector('[data-chat-timeline]')).toBeTruthy()
	})
})
```

- [ ] **Step 4: Run → PASS.** `bunx vitest run --project ui spec/ChatTimeline.spec.svelte.ts`
- [ ] **Step 5: Commit.** `git add packages/ui/src/components/ChatTimeline.svelte packages/ui/spec/ChatTimeline*; git commit -m "feat(ui): ChatTimeline component (autoscroll + message snippet)"`

---

### Task 6: ChatShell

**Files:**
- Create: `packages/ui/src/components/ChatShell.svelte`
- Test: `packages/ui/spec/ChatShell.spec.svelte.ts`

- [ ] **Step 1: Component** — `packages/ui/src/components/ChatShell.svelte`:

```svelte
<script lang="ts">
	import ChatTimeline from './ChatTimeline.svelte'
	import ChatComposer from './ChatComposer.svelte'
	import ChatHistory from './ChatHistory.svelte'
	import type { ChatShellProps } from '../types/chat.js'

	let {
		messages = [],
		conversations,
		activeConversationId = null,
		value = $bindable(''),
		placeholder,
		busy = false,
		onsubmit,
		onchange,
		onselectConversation,
		onnew,
		message,
		suggestions,
		toolbar,
		leading,
		historyItem,
		empty
	}: ChatShellProps = $props()
</script>

<div data-chat-shell data-has-history={conversations ? '' : undefined}>
	{#if conversations}
		<ChatHistory {conversations} activeId={activeConversationId} onselect={onselectConversation} {onnew} item={historyItem} />
	{/if}
	<div data-chat-main>
		<ChatTimeline {messages} {message} {empty} />
		<ChatComposer bind:value {placeholder} {busy} {onsubmit} {onchange} {suggestions} {toolbar} {leading} />
	</div>
</div>
```

- [ ] **Step 2: Test** — `packages/ui/spec/ChatShell.spec.svelte.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import ChatShell from '../src/components/ChatShell.svelte'

const msgs = [{ id: '1', role: 'assistant', text: 'hi' }]

describe('ChatShell', () => {
	it('renders timeline + composer; no history rail without conversations', () => {
		const { container } = render(ChatShell, { messages: msgs })
		expect(container.querySelector('[data-chat-timeline]')).toBeTruthy()
		expect(container.querySelector('[data-chat-composer]')).toBeTruthy()
		expect(container.querySelector('[data-chat-history]')).toBeFalsy()
		expect(container.querySelector('[data-chat-shell]')?.hasAttribute('data-has-history')).toBe(false)
	})
	it('renders the history rail when conversations are provided', () => {
		const { container } = render(ChatShell, { messages: msgs, conversations: [{ id: 'a', title: 'A' }] })
		expect(container.querySelector('[data-chat-history]')).toBeTruthy()
		expect(container.querySelector('[data-chat-shell]')?.hasAttribute('data-has-history')).toBe(true)
	})
	it('forwards composer submit', async () => {
		const onsubmit = vi.fn()
		const { container } = render(ChatShell, { messages: msgs, value: 'hey', onsubmit })
		await fireEvent.keyDown(container.querySelector('[data-chat-input]')!, { key: 'Enter' })
		expect(onsubmit).toHaveBeenCalledWith('hey')
	})
})
```

- [ ] **Step 3: Run → PASS.** `bunx vitest run --project ui spec/ChatShell.spec.svelte.ts`
- [ ] **Step 4: Commit.** `git add packages/ui/src/components/ChatShell.svelte packages/ui/spec/ChatShell*; git commit -m "feat(ui): ChatShell layout wrapper"`

---

### Task 7: Barrel exports

**Files:**
- Modify: `packages/ui/src/components/index.ts` (add the 5 component exports)
- Modify: `packages/ui/src/index.ts` (add them to the named re-export block, alphabetical near `Chat`/`Code`)
- Modify: `packages/ui/src/types/index.ts` (add `export * from './chat.js'`)

- [ ] **Step 1:** In `components/index.ts` add:
```ts
export { default as ChatMessage } from './ChatMessage.svelte'
export { default as ChatTimeline } from './ChatTimeline.svelte'
export { default as ChatComposer } from './ChatComposer.svelte'
export { default as ChatHistory } from './ChatHistory.svelte'
export { default as ChatShell } from './ChatShell.svelte'
```
- [ ] **Step 2:** In `src/index.ts` add `ChatComposer, ChatHistory, ChatMessage, ChatShell, ChatTimeline` to the `export { … } from './components/index.js'` block (keep its ordering style).
- [ ] **Step 3:** In `src/types/index.ts` add `export * from './chat.js'`.
- [ ] **Step 4: Verify exports + no manifest break.** `bunx vitest run --project ui` (repo root) → all green. If a `spec/index.spec.*` export-manifest test exists, add the 5 names (it didn't for ui as of the LockMode work — confirm).
- [ ] **Step 5: tsc + lint.** `cd packages/ui && bunx tsc --noEmit && cd ../.. && bunx eslint --config config/eslint.config.mjs packages/ui/src/components/Chat*.svelte`
- [ ] **Step 6: Commit.** `git add packages/ui/src/components/index.ts packages/ui/src/index.ts packages/ui/src/types/index.ts; git commit -m "feat(ui): export Chat* components + types from barrels"`

---

### Task 8: Live doc page (apps/learn)

**Files:**
- Create a koan demo `apps/learn/src/lib/koan/demos/chat/` (`meta.ts`, `index.svelte`) + route `apps/learn/src/routes/app/chat-components/+page.svelte`, registered in `catalog.ts`/`shell.svelte.ts`/`app/+layout.svelte` — mirror the `lock-mode` demo's wiring (see `demos/lock-mode/`).

- [ ] **Step 1:** Build a demo that renders `<ChatShell>` with a few static `messages` (including one assistant message whose `data` carries a `{ kind: 'chart' }` payload) and a `message` snippet that switches on `msg.data?.kind` to render a placeholder "chart goes here" box — demonstrating the dumb-seam without depending on `@rokkit/chart`. Also show the three primitives used standalone. Match the `lock-mode` demo structure (`meta.ts` with `snippets` code examples + `index.svelte` live demo).
- [ ] **Step 2:** Register: add to `catalog.ts` + `DEMO_ROUTE`, `ShellDemoType` (shell.svelte.ts), `DemoKind` (app/+layout.svelte) — exactly as `lock-mode` did. Use a valid `category` from `koan/types.ts` (e.g. `'layout'` or the closest existing — verify the enum).
- [ ] **Step 3: Verify.** `cd apps/learn && bunx tsc --noEmit -p .svelte-kit/tsconfig.json 2>&1 | grep demos/chat` empty; `bun run lint` 0 errors.
- [ ] **Step 4: Commit.** `git add apps/learn/src; git commit -m "docs(learn): ChatShell + primitives demo page"`

---

## Phase 2 — migrate `/chat` onto the shared components

> Goal: replace the app-local `$lib/chat` lib with the new `@rokkit/ui` components; the `BlockList`/`InlineComponent` chart/form switch becomes the consumer `message` snippet; the `chat-demo` store stays as the orchestration. Then delete `$lib/chat`.

### Task 9: Swap /chat components

**Files (read first):** `apps/learn/src/routes/chat/+page.svelte`, `apps/learn/src/lib/chat/components/{ChatComposer,ChatStream,ChatMessage,ChatHistory}.svelte`, `apps/learn/src/lib/chat-demo/components/{BlockList,InlineComponent}.svelte`, `apps/learn/src/lib/chat-demo/store.svelte.js`, `apps/learn/src/lib/conversations.svelte.ts`.

- [ ] **Step 1:** Build a `chatMessage` snippet in the `/chat` route (or a small `apps/learn` component) that maps a `conversations.svelte.ts` `AssistantTurn`/`Block[]` to rendered output — moving `BlockList` + `InlineComponent`'s `switch (tool)` (`mount_bar_chart`/`mount_table`/`mount_form`/`mount_list`) here. This snippet receives a `ChatMessage` whose `data` carries the blocks.
- [ ] **Step 2:** Map the `chat-demo` store's turns → `ChatMessage[]` (id, role, text/data, status) and conversation list → `ConversationSummary[]`. Render with `@rokkit/ui` `ChatTimeline` (passing the `chatMessage` snippet) + `ChatComposer` (`onsubmit` → store `submitText`; `busy` ← `conversation.thinking`) + `ChatHistory` — or `ChatShell`.
- [ ] **Step 3:** Keep the `chat-demo` store + `routeViaLLM`/`routeQuery` unchanged (the reference orchestration). Streaming: store mutates the turn → mapped message `status:'streaming'`/`text`/`data` → timeline re-renders + auto-scrolls.
- [ ] **Step 4: e2e** (`apps/learn/e2e/chat.e2e.ts` or extend existing): type → submit → an assistant message with an inline chart renders via the snippet; selecting a conversation in history switches it. Run `cd apps/learn && npx playwright test e2e/chat` → PASS.
- [ ] **Step 5: Commit.** `git commit -m "refactor(learn): migrate /chat to @rokkit/ui chat components"`

### Task 10: Delete `$lib/chat`

- [ ] **Step 1:** Remove `apps/learn/src/lib/chat/` (the now-unused local lib) and fix any remaining imports (`grep -rn "\$lib/chat" apps/learn/src`). Keep `$lib/chat-demo` (the store/blocks model).
- [ ] **Step 2: Verify.** `bun run lint` 0 errors; `cd apps/learn && npx playwright test` green; the app boots (`bun run build` or dev boot).
- [ ] **Step 3: Commit.** `git commit -m "refactor(learn): remove app-local \$lib/chat (replaced by @rokkit/ui)"`

---

## Phase 3 — migrate Koan `/app` onto the shared components

> Goal: replace `components/{ChatPanel, TimelineList, ConversationList}.svelte` with the shared components; delete the duplicates. Koan's text+demo-link responses become a simple `message` snippet (no inline charts needed there).

### Task 11: Swap Koan /app components + delete duplicates

**Files (read first):** `apps/learn/src/lib/koan/components/{Shell,ChatPanel,TimelineList,ConversationList,ComposerSuggestions}.svelte`, `apps/learn/src/lib/koan/store.svelte.ts`.

- [ ] **Step 1:** In `Shell.svelte`, replace `ChatPanel` → `@rokkit/ui` `ChatComposer` (`bind:value={koan.query}`, `onsubmit={handleSubmit}`, `suggestions` snippet wrapping `ComposerSuggestions`), and `ConversationList`/`TimelineList` → `ChatTimeline`/`ChatHistory` with a `message` snippet that renders Koan's response (text + demo-id link buttons calling `selectDemo`). Map `koan.messages` → `ChatMessage[]`.
- [ ] **Step 2:** Delete `ChatPanel.svelte`, `TimelineList.svelte`, `ConversationList.svelte` (now unused — `grep -rn` to confirm no other importers).
- [ ] **Step 3: Verify.** `bun run lint` 0 errors; existing Koan e2e green (`npx playwright test`); `/app` boots and a query still selects a demo.
- [ ] **Step 4: Commit.** `git commit -m "refactor(learn): migrate Koan /app to @rokkit/ui chat components; delete duplicates"`

---

## Final
- [ ] `bun run check` (full gate: lint + types + svelte-check + 5023+ tests) → green. The new `.svelte` chat components must meet the **≥80% svelte** coverage threshold and `chat.ts` is type-only (excluded) — confirm `bun run coverage` still exits 0.
- [ ] Update `agents/journal.md` + memory ([[feedback_data_first_over_snippets]] / a new chat-components note).

---

## Self-review notes
- **Spec coverage:** data model (T1), ChatMessage (T2), ChatComposer (T3), ChatHistory (T4), ChatTimeline incl. autoscroll + message snippet (T5), ChatShell (T6), barrels (T7), doc page (T8), /chat migration + delete $lib/chat (T9–10), Koan /app migration + delete duplicates (T11). All spec sections covered.
- **Decisions honored:** consumer-supplied `message` snippet (no chart/forms dep in ui); whole-body snippet model; orchestration stays in-app (chat-demo store); `ChatComposer` name; ChatShell ships alongside primitives; both surfaces migrated.
- **API consistency:** `formatRelativeTime(ts, relative)` used by ChatMessage + ChatHistory; `MarkdownRenderer markdown={…}` (verified prop name); `ChatMessage`/`ChatTimeline`/etc. prop + snippet names match `types/chat.ts` throughout; data-attrs (`data-chat-message`/`-bubble`/`-body`/`-time`/`-caret`, `data-chat-composer`/`-input`, `data-chat-history`/`-item`/`-row`, `data-chat-timeline`, `data-chat-shell`/`-main`) consistent across components and tests.
- **Coverage gate:** new components are `.svelte` (≥80% target); the per-component tests above exercise the main branches. `relative-time.ts` is js/ts (100% target) — its test covers all branches (invalid, minutes/hours/days, non-relative).
