# Ask Rokkit — AI Demo Evolution — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/chat` ("Chat demo") into **Ask Rokkit** — a mode-picker hub with three separate engine routes (`/chat/simulated`, `/chat/openrouter?model=…`, `/chat/webllm?model=…`), mode-scoped history, heuristic chat summary titles — while decomposing the 1107-line `/chat/+page.svelte` monolith (functions separated from presentation, reusing the existing chat components).

**Architecture:** SvelteKit + Svelte 5 runes. `/chat` renders a picker; each engine is its own route rendering the existing chat UI (reused `@rokkit/ui` `ChatTimeline`/`ChatComposer`/`ChatMessage`, `$lib/chat` `ChatHistory`, `chat-demo` `BlockList`/`InlineComponent`) driven by a new logic module. The engine is fixed by the route (no in-chat toggle); the model is a `?model=` query param. The shared conversation store gains a `mode` tag + a title-summary helper.

**Tech Stack:** Svelte 5 runes, SvelteKit, TypeScript, Vitest (run-once), Playwright.

**Conventions:**
- Run tests only with run-once commands: `cd apps/learn && bunx vitest run <file>` (never watch).
- `apps/learn` Svelte/types are validated by `bun run build` (svelte-check does NOT cover it).
- TAB indentation; match surrounding style. If an Edit fails to match, `sed -n 'N,Mp' file | cat -te` to see exact tabs.
- Commit trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`. Stay on `develop`.

**Design decisions (from the spec, refined):**
- **Reuse** existing chat components — do NOT create new stream/composer/history components.
- **Separate functions from presentation** — page logic lives in `chat-controller.svelte.ts`; route pages are thin.
- `/chat/[mode]` is a single param route; `[mode]/+page.ts` validates + redirects unknown modes.
- "Scripted" is relabelled **Simulated** in UI + route; internally the engine stays `scripted` (`llm.enabled=false`) — no data migration. Route `simulated` ↔ provider `scripted`.

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `src/lib/chat-demo/modes.ts` | Mode descriptor + guard + engine setter data | **Create** |
| `src/lib/chat-demo/llm.svelte.ts` | LLM engine state | add `setEngine(mode, model?)` |
| `src/lib/koan/conversations.svelte.ts` | Shared conversation store | `mode` tag, `summarizeTitle`, chat title, `renameConversation`, rail mode-filter |
| `src/lib/chat-demo/store.svelte.ts` | Chat submit API | `pendingPrompt` one-shot, mode-tagged create, title refine |
| `src/lib/chat-demo/chat-controller.svelte.ts` | `/chat/[mode]` page logic (functions) | **Create** (extracted from `+page.svelte`) |
| `src/routes/chat/[mode]/+page.ts` | Route guard | **Create** |
| `src/routes/chat/[mode]/+page.svelte` | Mode chat (thin presentation) | **Create** (moved + trimmed from `chat/+page.svelte`) |
| `src/routes/chat/+page.svelte` | The picker (thin) | **Replace** monolith → renders `<ModePicker/>` |
| `src/lib/chat-demo/components/ModePicker.svelte` | Three engine cards | **Create** |
| `src/lib/components/SiteNav.svelte` | Nav label | "Chat demo" → "Ask Rokkit" |

**Reused unchanged:** `@rokkit/ui` `ChatTimeline`/`ChatComposer`/`ChatMessage`, `$lib/chat` `ChatHistory`/`configureWho`, `chat-demo/components/BlockList.svelte` + `InlineComponent.svelte`, `chat-demo/llm.svelte.ts` inference, `chat-demo/router.ts`/`infer.ts`.

---

## Task 1: `modes.ts` descriptor + guard + `setEngine`

**Files:**
- Create: `src/lib/chat-demo/modes.ts`
- Modify: `src/lib/chat-demo/llm.svelte.ts` (add `setEngine`)
- Create: `src/lib/chat-demo/modes.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/chat-demo/modes.spec.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { isChatMode, MODES, CHAT_MODES } from './modes'
import { setEngine } from './llm.svelte'
import { llm, DEFAULT_OPENROUTER_MODEL, DEFAULT_WEBLLM_MODEL } from './llm.svelte'

describe('modes descriptor', () => {
	it('CHAT_MODES lists the three engines', () => {
		expect(CHAT_MODES).toEqual(['simulated', 'openrouter', 'webllm'])
	})
	it('isChatMode guards valid/invalid', () => {
		expect(isChatMode('simulated')).toBe(true)
		expect(isChatMode('webllm')).toBe(true)
		expect(isChatMode('bogus')).toBe(false)
		expect(isChatMode(undefined)).toBe(false)
	})
	it('each mode has a card descriptor with examples', () => {
		for (const m of CHAT_MODES) {
			const card = MODES.find((c) => c.mode === m)
			expect(card).toBeTruthy()
			expect(card!.examples.length).toBeGreaterThan(0)
		}
	})
})

describe('setEngine', () => {
	beforeEach(() => {
		llm.enabled = true
		llm.provider = 'openrouter'
	})
	it('simulated disables the LLM', () => {
		setEngine('simulated')
		expect(llm.enabled).toBe(false)
	})
	it('openrouter enables + sets provider + model (default when omitted)', () => {
		setEngine('openrouter')
		expect(llm.enabled).toBe(true)
		expect(llm.provider).toBe('openrouter')
		expect(llm.openRouterModel).toBe(DEFAULT_OPENROUTER_MODEL)
		setEngine('openrouter', 'meta-llama/llama-3.3-70b-instruct:free')
		expect(llm.openRouterModel).toBe('meta-llama/llama-3.3-70b-instruct:free')
	})
	it('webllm enables + sets provider + model', () => {
		setEngine('webllm', 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC')
		expect(llm.enabled).toBe(true)
		expect(llm.provider).toBe('webllm')
		expect(llm.webllmModel).toBe('Qwen2.5-1.5B-Instruct-q4f16_1-MLC')
	})
})
```

- [ ] **Step 2: Run it — verify FAIL** (`cd apps/learn && bunx vitest run src/lib/chat-demo/modes.spec.ts`) — fails: `modes` / `setEngine` not found.

- [ ] **Step 3: Create `src/lib/chat-demo/modes.ts`**

```ts
/**
 * The three Ask Rokkit engines as a single descriptor — one source for the
 * picker cards, route validation, and route↔provider mapping. Model defaults
 * come from llm.svelte.ts; the actual inference lives there and in router.ts.
 */
import { DEFAULT_OPENROUTER_MODEL, DEFAULT_WEBLLM_MODEL } from './llm.svelte'

export type ChatMode = 'simulated' | 'openrouter' | 'webllm'
export const CHAT_MODES: ChatMode[] = ['simulated', 'openrouter', 'webllm']

export function isChatMode(x: unknown): x is ChatMode {
	return typeof x === 'string' && (CHAT_MODES as string[]).includes(x)
}

export interface ModeCard {
	mode: ChatMode
	label: string
	icon: string
	blurb: string
	capabilities: string
	examples: string[]
	needsModel: boolean
	defaultModel?: string
}

export const MODES: ModeCard[] = [
	{
		mode: 'simulated',
		label: 'Simulated',
		icon: 'i-mdi:script-text-outline',
		blurb: 'Instant canned demos — no AI, works offline.',
		capabilities: 'A fixed set of chart, table, form and list examples rendered from scripted data.',
		examples: [
			'Show me a bar chart of quarterly revenue',
			'Show me a sortable table of products',
			'Build a sign-up form'
		],
		needsModel: false
	},
	{
		mode: 'openrouter',
		label: 'OpenRouter',
		icon: 'i-mdi:cloud-outline',
		blurb: 'A hosted LLM builds live components from any prompt.',
		capabilities: 'Any prompt → live charts / tables / forms / lists. Needs network; the API key stays server-side. Pick a free model.',
		examples: [
			'Generate a Q3 sales scenario and chart it',
			'Make a table of the top 5 EVs by range'
		],
		needsModel: true,
		defaultModel: DEFAULT_OPENROUTER_MODEL
	},
	{
		mode: 'webllm',
		label: 'Web LLM',
		icon: 'i-mdi:laptop',
		blurb: 'A model runs in your browser — fully private.',
		capabilities: 'Same generation as OpenRouter, but the model runs locally via WebGPU. One-time ~0.7–2 GB download, then offline.',
		examples: [
			'Invent a startup’s monthly burn and plot it',
			'Build a newsletter signup form'
		],
		needsModel: true,
		defaultModel: DEFAULT_WEBLLM_MODEL
	}
]

export function cardFor(mode: ChatMode): ModeCard {
	return MODES.find((c) => c.mode === mode)!
}
```

- [ ] **Step 4: Add `setEngine` to `src/lib/chat-demo/llm.svelte.ts`**

Append this exported function (after the `llm` state declaration, ~line 116). It imports nothing new — `llm`, `DEFAULT_OPENROUTER_MODEL`, `DEFAULT_WEBLLM_MODEL` are already in the module:
```ts
/**
 * Point the engine at a route mode + optional model. Simulated disables the
 * LLM (scripted router); openrouter/webllm enable it and set the model
 * (falling back to the mode default). Called by the /chat/[mode] page.
 */
export function setEngine(mode: 'simulated' | 'openrouter' | 'webllm', model?: string): void {
	if (mode === 'simulated') {
		llm.enabled = false
		return
	}
	llm.enabled = true
	if (mode === 'webllm') {
		llm.provider = 'webllm'
		llm.webllmModel = model || DEFAULT_WEBLLM_MODEL
	} else {
		llm.provider = 'openrouter'
		llm.openRouterModel = model || DEFAULT_OPENROUTER_MODEL
	}
}
```
(Note: `modes.ts` uses `setEngine`'s literal mode type; keeping it inline avoids a circular import with `modes.ts`.)

- [ ] **Step 5: Run the test — verify PASS** (`bunx vitest run src/lib/chat-demo/modes.spec.ts`) — 7 tests pass.

- [ ] **Step 6: Commit**
```bash
git add apps/learn/src/lib/chat-demo/modes.ts apps/learn/src/lib/chat-demo/modes.spec.ts apps/learn/src/lib/chat-demo/llm.svelte.ts
git commit -m "feat(learn): chat modes descriptor + setEngine(mode,model)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Conversation `mode` tag + summary titles + rail filter

**Files:**
- Modify: `src/lib/koan/conversations.svelte.ts`
- Modify: `apps/learn/spec/koan/conversations.spec.svelte.ts` (extend the SP1 spec)

- [ ] **Step 1: Write failing tests** — append to `apps/learn/spec/koan/conversations.spec.svelte.ts`:
```ts
import { summarizeTitle, bucketByRecency } from '../../src/lib/koan/conversations.svelte'

describe('summarizeTitle', () => {
	it('strips leading filler + article and caps length', () => {
		expect(summarizeTitle('show me a bar chart of quarterly revenue')).toBe('Bar chart of quarterly revenue')
		expect(summarizeTitle('Can you build me a sign-up form')).toBe('Sign-up form')
		expect(summarizeTitle('generate a Q3 sales scenario and chart it')).toBe('Q3 sales scenario and chart it')
	})
	it('collapses whitespace and capitalizes', () => {
		expect(summarizeTitle('  line   chart  ')).toBe('Line chart')
	})
	it('falls back for empty/filler-only input', () => {
		expect(summarizeTitle('   ')).toBe('New chat')
	})
})

describe('chat conversations — mode tag + rail filter', () => {
	beforeEach(() => clearAll())
	it('startNew records mode + summary title for chat surface', () => {
		startNew('chat', 'show me a bar chart', 'openrouter')
		expect(conversations[0].mode).toBe('openrouter')
		expect(conversations[0].title).toBe('Bar chart')
	})
	it('bucketByRecency filters chat by mode', () => {
		startNew('chat', 'a', 'simulated')
		startNew('chat', 'b', 'openrouter')
		const sim = bucketByRecency('chat', 'simulated')
		const all = [...sim.today, ...sim.yesterday, ...sim.earlier]
		expect(all.every((c) => c.mode === 'simulated')).toBe(true)
		expect(all.length).toBe(1)
	})
	it('app conversations are unaffected by the mode filter', () => {
		startNew('app', 'Tabs')
		expect(conversations[0].mode).toBeUndefined()
	})
})
```
(The SP1 spec already imports `conversations, startNew, clearAll, getCurrentId`; add `summarizeTitle`, `bucketByRecency` to imports if not present.)

- [ ] **Step 2: Run — verify FAIL** (`bunx vitest run spec/koan/conversations.spec.svelte.ts`).

- [ ] **Step 3: Implement.** In `src/lib/koan/conversations.svelte.ts`:

(a) Add `mode` to the `Conversation` interface (after `surface`):
```ts
export interface Conversation {
	id: ConversationId
	title: string
	surface: ConversationSurface
	mode?: string
	createdAt: string
	updatedAt: string
	turns: Turn[]
}
```

(b) Add `summarizeTitle` (near the other helpers, before `startNew`):
```ts
const TITLE_LEAD =
	/^(?:please|can you|could you|show me|show|give me|make(?: me)?|build(?: me)?|generate|create|draw|render|plot|display|i want(?: to see)?|i'?d like(?: to see)?|let'?s see)\b[\s,:-]*/i
const TITLE_ARTICLE = /^(?:a|an|the)\s+/i

/** Tidy a chat prompt into a short history label. */
export function summarizeTitle(query: string): string {
	let t = query.trim().replace(/\s+/g, ' ')
	let prev = ''
	while (t !== prev) {
		prev = t
		t = t.replace(TITLE_LEAD, '').trim()
	}
	t = t.replace(TITLE_ARTICLE, '').trim()
	if (!t) return 'New chat'
	if (t.length > 40) t = t.slice(0, 40).replace(/\s+\S*$/, '').trim() + '…'
	return t.charAt(0).toUpperCase() + t.slice(1)
}
```

(c) Change `startNew` signature + chat branch. Current signature is `startNew(surface, query)`. New:
```ts
export function startNew(surface: ConversationSurface, query: string, mode?: string): ConversationId {
	const at = nowIso()
	const title = surface === 'chat' ? summarizeTitle(query) : (query.trim().slice(0, 80) || 'New conversation')
	const userTurn: UserTurn = { kind: 'user', id: makeId('t'), at, text: query }
	// (app-surface upsert-by-title block from SP1 stays here, unchanged)
	...
	const conv: Conversation = { id, title, surface, mode: surface === 'chat' ? mode : undefined, createdAt: at, updatedAt: at, turns: [userTurn] }
	...
}
```
(Keep the SP1 `app`-surface upsert block exactly; only add the `title` mode-branch, the `mode` param, and `mode` on the created `Conversation`. The app upsert path does not set `mode`.)

(d) Add `renameConversation`:
```ts
/** Rename a conversation (used to refine a chat title after the first render). */
export function renameConversation(id: ConversationId, title: string): void {
	const idx = findIndexById(id)
	if (idx >= 0) {
		conversations[idx].title = title
		persist()
	}
}
```

(e) Add an optional `mode` filter to `bucketByRecency`:
```ts
export function bucketByRecency(surface?: ConversationSurface, mode?: string): ConversationBuckets {
	const pool = conversations.filter(
		(c) => (surface ? c.surface === surface : true) && (mode ? c.mode === mode : true)
	)
	// (rest of the existing sort/bucket logic unchanged, operating on `pool`)
	...
}
```

- [ ] **Step 4: Run — verify PASS** (all conversations spec tests, incl. SP1's).

- [ ] **Step 5: Commit**
```bash
git add apps/learn/src/lib/koan/conversations.svelte.ts apps/learn/spec/koan/conversations.spec.svelte.ts
git commit -m "feat(learn): tag chat conversations with mode + summary titles + rail mode-filter

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Store — one-shot pending prompt, mode-tagged create, title refine

**Files:**
- Modify: `src/lib/chat-demo/store.svelte.ts`
- Create: `src/lib/chat-demo/store.spec.ts`

- [ ] **Step 1: Write failing test** — `src/lib/chat-demo/store.spec.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { setPendingPrompt, takePendingPrompt } from './store.svelte'

describe('pending prompt one-shot', () => {
	it('returns the set value once, then null', () => {
		setPendingPrompt('Bar chart please')
		expect(takePendingPrompt()).toBe('Bar chart please')
		expect(takePendingPrompt()).toBeNull()
	})
})
```

- [ ] **Step 2: Run — verify FAIL.**

- [ ] **Step 3: Implement in `store.svelte.ts`:**

(a) One-shot pending prompt (module top-level):
```ts
let _pending = $state<string | null>(null)
/** Seed a prompt from the picker; the mode page consumes it once on mount. */
export function setPendingPrompt(text: string): void {
	_pending = text
}
export function takePendingPrompt(): string | null {
	const p = _pending
	_pending = null
	return p
}
```

(b) Tag new chat conversations with the current ROUTE mode — `simulated` (not the internal `scripted` provider) so the rail filter + resume route match `/chat/[mode]`. Add `currentMode` and use it in `pushUser`:
```ts
import type { ChatMode } from './modes'

/** Active route mode from engine state (scripted engine → 'simulated'). */
function currentMode(): ChatMode {
	return !llm.enabled ? 'simulated' : llm.provider // llm.provider is 'openrouter' | 'webllm'
}

function pushUser(text: string): void {
	const cur = getCurrentConversation()
	if (!cur || cur.surface !== 'chat') {
		startNew('chat', text, currentMode())
		return
	}
	sharedAppendUser(text)
}
```

(c) Refine the title after the first assistant turn yields a single component. Add a helper + call it from `pushAssistant`:
```ts
import { renameConversation, getCurrentId } from '$lib/koan/conversations.svelte'

const COMPONENT_TITLES: Record<string, string> = {
	mount_bar_chart: 'Bar chart',
	mount_table: 'Products table',
	mount_form: 'Form',
	mount_list: 'List'
}

function pushAssistant(blocks: Block[]): void {
	const conv = getCurrentConversation()
	const firstAssistant = !!conv && !conv.turns.some((t) => t.kind === 'assistant')
	const stamp = currentProviderStamp()
	sharedAppendAssistant({ kind: 'blocks', blocks, ...stamp })
	// A+B titling: if the opening response is exactly one known component, prefer its type.
	if (firstAssistant && blocks.length === 1 && blocks[0].kind === 'component') {
		const label = COMPONENT_TITLES[(blocks[0] as { tool: string }).tool]
		const id = getCurrentId()
		if (label && id) renameConversation(id, label)
	}
}
```
(`getCurrentConversation` is already imported; add `renameConversation`, `getCurrentId` to the existing conversations import.)

- [ ] **Step 4: Run — verify PASS.**

- [ ] **Step 5: Commit**
```bash
git add apps/learn/src/lib/chat-demo/store.svelte.ts apps/learn/src/lib/chat-demo/store.spec.ts
git commit -m "feat(learn): chat pending-prompt one-shot + mode-tagged create + component title refine

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Extract page logic → `chat-controller.svelte.ts`

Separate functions from presentation: move the non-DOM logic out of the current `src/routes/chat/+page.svelte` script into a reusable controller module. **Read `src/routes/chat/+page.svelte` (script lines 1–304) first.**

**Files:**
- Create: `src/lib/chat-demo/chat-controller.svelte.ts`
- (the `+page.svelte` script is emptied of this logic in Task 5)

- [ ] **Step 1: Create the controller** with the page's pure logic moved verbatim (adapting component-local `$state` → module `$state`). Move these declarations from `+page.svelte`'s script into `chat-controller.svelte.ts` and `export` them:
  - `composerValue` (`$state('')`), `send(text?)`, `handleSuggestion(query)`
  - `messages` (`$derived` mapping `conversation.turns` → `ChatMessageData[]`)
  - `SAMPLE_SALES`, `SAMPLE_USER`, `seedSuggestions` **→ import these from `modes.ts` instead** (they are card data now; re-export `seedSuggestions` from the controller only if still referenced). Prefer `MODES[*].examples`.
  - history helpers: `collapsed` (`$state`), `convIcon(conv)`, `resumeConversation(conv)`, `startNewChat()`, and a **mode-scoped** `bucketsFor(mode)` wrapper: `export function bucketsFor(mode: ChatMode) { return bucketByRecency('chat', mode) }`
  - file/data helpers: the parsing parts of `handleFile(file)`, `onFileChange`, `onDrop` (the drag/parse logic; the `dragOver`/`fileInputRef`/`streamRef` DOM refs stay in the component in Task 5).
  Keep imports (`conversation`, `submitText`, `submitData`, `bucketByRecency`, `recencyLabel`, `loadConversation`, `resetConversation`, etc.) pointing at the same modules.
  `resumeConversation` must route to the conversation's own mode: `goto('/chat/' + (conv.mode ?? 'simulated'))` then `loadConversation(conv.id)` + `syncLLMFromCurrentConversation()`.

- [ ] **Step 2: Build to verify the module compiles** (`cd apps/learn && bun run build 2>&1 | tail -4`). At this point `+page.svelte` still has its own copy; the controller just needs to type-check. Expected: `✓ built`.

- [ ] **Step 3: Commit**
```bash
git add apps/learn/src/lib/chat-demo/chat-controller.svelte.ts
git commit -m "refactor(learn): extract /chat page logic into chat-controller.svelte.ts

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: `/chat/[mode]` route — thin chat page + guard

Move the current chat UI to the mode route, trimmed (no welcome hero, no mode toggle) and wired to the controller + route.

**Files:**
- Create: `src/routes/chat/[mode]/+page.ts`
- Create: `src/routes/chat/[mode]/+page.svelte` (moved from `chat/+page.svelte`, trimmed)

- [ ] **Step 1: Route guard** — `src/routes/chat/[mode]/+page.ts`:
```ts
import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'
import { isChatMode } from '$lib/chat-demo/modes'

export const load: PageLoad = ({ params }) => {
	if (!isChatMode(params.mode)) redirect(308, '/chat')
	return { mode: params.mode }
}
```

- [ ] **Step 2: Create `[mode]/+page.svelte`** by moving the current `chat/+page.svelte` template + `<style>` there, then:
  - **Import the controller** (`import * as chat from '$lib/chat-demo/chat-controller.svelte'`) and use its `send`/`messages`/`bucketsFor`/`convIcon`/`resumeConversation`/`startNewChat`/`composerValue`. Keep DOM-ref state (`streamRef`, `fileInputRef`, `dragOver`, scroll handler) local.
  - **Remove** the mode `Toggle` block + `mode`/`setMode`/`modeOptions`/`modeLabel` (delete the `.chat-subtoolbar` toggle; keep the model dropdown + Web-LLM progress).
  - **Remove** the welcome-hero block (welcome now lives in the picker).
  - **Set the engine from the route** on mount + when `?model=` changes:
    ```svelte
    import { page } from '$app/state'
    import { setEngine } from '$lib/chat-demo/llm.svelte'
    import { takePendingPrompt } from '$lib/chat-demo/store.svelte'
    const { data } = $props()
    $effect(() => { setEngine(data.mode, page.url.searchParams.get('model') ?? undefined) })
    onMount(() => { const p = takePendingPrompt(); if (p) chat.send(p) })
    ```
  - **Model dropdown syncs `?model=`**: on change, `goto(`/chat/${data.mode}?model=${encodeURIComponent(id)}`, { replaceState: true, keepFocus: true, noScroll: true })` (Web-LLM change also calls `resetWebLLMEngine()`).
  - **History rail scoped to mode**: use `chat.bucketsFor(data.mode)` for the `ChatHistory` buckets.
  - Add an **"Ask Rokkit ›" eyebrow** linking back to `/chat` (the picker) where the toggle used to be.
  - `<title>` uses the mode label: `{cardFor(data.mode).label} · Ask Rokkit` (import `cardFor` from modes).

- [ ] **Step 3: Build** (`bun run build 2>&1 | tail -6`). Expected `✓ built`, no unused-`Toggle` / missing-import errors. Then dev-check `/chat/simulated` renders and a Simulated prompt returns a component.

- [ ] **Step 4: Commit**
```bash
git add apps/learn/src/routes/chat/[mode]/
git commit -m "feat(learn): /chat/[mode] route — engine from route, model via ?model=, mode-scoped history

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: `/chat` picker + `ModePicker.svelte`

**Files:**
- Replace: `src/routes/chat/+page.svelte` (monolith → thin picker)
- Create: `src/lib/chat-demo/components/ModePicker.svelte`

- [ ] **Step 1: `ModePicker.svelte`** — render the three cards from `MODES`; card click enters the mode, example chips seed + enter:
```svelte
<script lang="ts">
	import { goto } from '$app/navigation'
	import { MODES, type ChatMode } from '$lib/chat-demo/modes'
	import { setPendingPrompt } from '$lib/chat-demo/store.svelte'

	// Web-LLM needs WebGPU; disable its card when unavailable.
	let webgpu = $state(true)
	$effect(() => { webgpu = typeof navigator !== 'undefined' && 'gpu' in navigator })

	function routeFor(mode: ChatMode): string {
		const card = MODES.find((c) => c.mode === mode)!
		return card.needsModel && card.defaultModel
			? `/chat/${mode}?model=${encodeURIComponent(card.defaultModel)}`
			: `/chat/${mode}`
	}
	function enter(mode: ChatMode) { goto(routeFor(mode)) }
	function enterWith(mode: ChatMode, prompt: string) { setPendingPrompt(prompt); goto(routeFor(mode)) }
	const disabled = (mode: ChatMode) => mode === 'webllm' && !webgpu
</script>

<div data-mode-picker>
	{#each MODES as card (card.mode)}
		<section data-mode-card class:disabled={disabled(card.mode)}>
			<header>
				<span class={card.icon} aria-hidden="true"></span>
				<h2>{card.label}</h2>
			</header>
			<p data-mode-blurb>{card.blurb}</p>
			<p data-mode-caps>{card.capabilities}</p>
			{#if disabled(card.mode)}
				<p data-mode-note>Needs WebGPU — try Chrome or Edge.</p>
			{:else}
				<button type="button" data-mode-enter onclick={() => enter(card.mode)}>Open {card.label} ›</button>
				<ul data-mode-examples>
					{#each card.examples as ex (ex)}
						<li><button type="button" onclick={() => enterWith(card.mode, ex)}>{ex}</button></li>
					{/each}
				</ul>
			{/if}
		</section>
	{/each}
</div>

<style>
	/* three responsive cards; use the ink/paper token scale (color: var(--ink),
	   var(--ink-mute); border: 1px solid var(--paper-edge); background var(--paper)).
	   [data-mode-card]:hover border-color: var(--paper-edge-hover). */
	[data-mode-picker] { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); padding: 32px; max-width: 1060px; margin: 0 auto; }
	[data-mode-card] { display: flex; flex-direction: column; gap: 8px; padding: 20px; border: 1px solid var(--paper-edge); border-radius: 12px; background: var(--paper); }
	[data-mode-card].disabled { opacity: 0.55; }
	[data-mode-card] h2 { font: 600 16px var(--font-ui); color: var(--ink); margin: 0; }
	[data-mode-blurb] { color: var(--ink); font-size: 14px; }
	[data-mode-caps], [data-mode-note] { color: var(--ink-mute); font-size: 12.5px; line-height: 1.5; }
	[data-mode-examples] { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
	[data-mode-examples] button { text-align: left; color: var(--ink-mute); font-size: 12px; background: var(--paper-soft); border: 1px solid var(--paper-edge); border-radius: 6px; padding: 6px 10px; cursor: pointer; width: 100%; }
	[data-mode-examples] button:hover { color: var(--ink); border-color: var(--paper-edge-hover); }
</style>
```

- [ ] **Step 2: Replace `src/routes/chat/+page.svelte`** with the thin picker:
```svelte
<script lang="ts">
	import ModePicker from '$lib/chat-demo/components/ModePicker.svelte'
</script>

<svelte:head><title>Ask Rokkit</title></svelte:head>

<section data-ask-rokkit-hero>
	<h1>Ask Rokkit</h1>
	<p>Describe what you want — a chart, a table, a form — and pick an engine to build it.</p>
</section>
<ModePicker />

<style>
	[data-ask-rokkit-hero] { text-align: center; padding: 40px 32px 0; max-width: 1060px; margin: 0 auto; }
	[data-ask-rokkit-hero] h1 { font: 300 34px var(--font-display); color: var(--ink); margin: 0 0 6px; }
	[data-ask-rokkit-hero] p { color: var(--ink-mute); font-size: 14px; }
</style>
```

- [ ] **Step 3: Build + dev-verify** the picker at `/chat` shows three cards; the Web-LLM card disables without WebGPU. `bun run build 2>&1 | tail -4` → `✓ built`.

- [ ] **Step 4: Commit**
```bash
git add apps/learn/src/routes/chat/+page.svelte apps/learn/src/lib/chat-demo/components/ModePicker.svelte
git commit -m "feat(learn): /chat mode picker (Ask Rokkit) with per-engine cards + example prompts

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Rename "Chat demo" → "Ask Rokkit"

**Files:**
- Modify: `src/lib/components/SiteNav.svelte`

- [ ] **Step 1:** In `src/lib/components/SiteNav.svelte`, change the nav entry label:
```ts
{ label: 'Ask Rokkit', href: '/chat', match: (p: string) => p.startsWith('/chat') },
```
(The `/chat` picker page + `/chat/[mode]` pages set their own `<title>` in Tasks 5–6.)

- [ ] **Step 2:** Grep for any other user-facing "Chat demo" string and update:
```bash
cd apps/learn && grep -rn "Chat demo" src
```
Update any remaining matches to "Ask Rokkit".

- [ ] **Step 3: Build + commit**
```bash
cd apps/learn && bun run build 2>&1 | tail -3
cd /Users/Jerry/Developer/rokkit
git add apps/learn/src/lib/components/SiteNav.svelte
git commit -m "feat(learn): rename Chat demo -> Ask Rokkit in nav

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: E2E + final gate + journal

**Files:**
- Create: `apps/learn/e2e/ask-rokkit.e2e.ts`
- Modify: `agents/journal.md`

- [ ] **Step 1: E2E** — `apps/learn/e2e/ask-rokkit.e2e.ts` (Simulated is deterministic/offline — safe in CI; OpenRouter/Web-LLM are not asserted):
```ts
import { test, expect } from '@playwright/test'

test('nav says Ask Rokkit, not Chat demo', async ({ page }) => {
	await page.goto('/chat')
	const nav = page.locator('[data-site-nav]')
	await expect(nav.getByText('Ask Rokkit', { exact: true })).toBeVisible()
	await expect(nav.getByText('Chat demo', { exact: true })).toHaveCount(0)
})

test('/chat shows the three engine cards', async ({ page }) => {
	await page.goto('/chat')
	await expect(page.locator('[data-mode-card]')).toHaveCount(3)
})

test('an unknown mode redirects to the picker', async ({ page }) => {
	await page.goto('/chat/bogus')
	await expect(page).toHaveURL(/\/chat$/)
	await expect(page.locator('[data-mode-card]')).toHaveCount(3)
})

test('entering Simulated via an example chip yields a response', async ({ page }) => {
	await page.goto('/chat')
	const simCard = page.locator('[data-mode-card]', { hasText: 'Simulated' })
	await simCard.locator('[data-mode-examples] button').first().click()
	await expect(page).toHaveURL(/\/chat\/simulated/)
	// the composer + a rendered response block appear (scripted router is instant-ish)
	await expect(page.locator('[data-block-kind], [data-inline-component], canvas, table').first()).toBeVisible({ timeout: 5000 })
})
```
(If the response-block selector doesn't match the actual rendered markup, adjust to a stable hook in `BlockList`/`InlineComponent` — inspect those files.)

- [ ] **Step 2: Run e2e** (`cd apps/learn && npx playwright test ask-rokkit`). Expected: 4 passed.

- [ ] **Step 3: Full gate** — `bun run check` (lint + types + svelte-check + tests, incl. the new modes/store/conversations tests) and `cd apps/learn && npx playwright test theme-contrast` (no new failures beyond baseline).

- [ ] **Step 4: Journal** — append a dated entry to `agents/journal.md` summarizing Ask Rokkit (picker hub, per-mode routes + `?model=`, mode-scoped history, summary titles, monolith decomposed) with commit hashes; link `[[project_demo_app]]` and `[[project_koan_interactive_mode]]`.

- [ ] **Step 5: Commit**
```bash
git add apps/learn/e2e/ask-rokkit.e2e.ts agents/journal.md
git commit -m "test(learn): e2e for Ask Rokkit + journal

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Notes / Risks

- **Big move (Task 5):** relocating ~800 lines of template+style from `chat/+page.svelte` to `[mode]/+page.svelte` is mechanical but large — do it as a move first, then trim (remove toggle + welcome) and wire the controller. Verify with `bun run build` + a manual `/chat/simulated` smoke test.
- **`$lib/chat` vs `@rokkit/ui`:** keep the current import sources (`ChatHistory`/`configureWho` from `$lib/chat`; `ChatTimeline`/`ChatComposer`/`ChatMessage` from `@rokkit/ui`). Do not "fix" these here.
- **Model default in URL:** the picker links openrouter/webllm cards with `?model=<default>` so the URL is always explicit; the mode page still tolerates an absent `?model=`.
- **Out of scope:** the block/inline renderer, the engines' inference internals, `/app`, LLM-generated titles, cross-mode history.
```
