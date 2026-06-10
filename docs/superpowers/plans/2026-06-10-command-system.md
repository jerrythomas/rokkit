# Command System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a public command/shortcut system — `commands` registry (`@rokkit/states`), `shortcuts` action (`@rokkit/actions`), `CommandPalette` (`@rokkit/ui`) — wired into `apps/learn`, with a skill + guide; and consolidate the legacy `kbd.js`/`navigable` keyboard path.

**Architecture:** A singleton `CommandRegistry` (private `$state`, like `vibe`) owns commands + a normalized-shortcut index and resolves `KeyboardEvent`→`Command`. A `shortcuts` action (structural `{resolve, execute}` param — no states dependency) installs a window keydown listener that dispatches matches. `CommandPalette` (in `@rokkit/ui`, which already depends on states/actions) reads `commands.all`, fuzzy-filters, and runs on select. `apps/learn` is the first consumer + demo.

**Tech Stack:** Svelte 5 runes, `@rokkit/states`/`@rokkit/actions`/`@rokkit/ui`/`@rokkit/themes`/`@rokkit/cli`, Vitest (`.spec.svelte.js`/`.spec.svelte.ts`).

**Design:** `docs/design/19-command-system.md`.

**Conventions (read first):**
- Singleton store: `packages/states/src/vibe.svelte.js` (`#field = $state(...)` + `export const x = new X()`).
- Messages namespace: `packages/states/src/messages.svelte.js` (`field = $state({ ...defaultMessages.field })`).
- Action: `packages/actions/src/dismissable.svelte.js` (`export function f(node){ $effect(() => { const c = on(...); return () => c() }) }`).
- Component: `packages/ui/src/components/Pill.svelte` (`$props()`, `data-x={cond || undefined}`); labels via `messages` (`SearchFilter.svelte`: `const labels = $derived({...})`).
- Themes: base = structure only; `[data-style='X'] [data-part]` per style; add `@import` to all 5 style indexes + `base/index.css`; coverage guard `packages/themes/spec/coverage.spec.js`.
- Tests: `bunx vitest run --project {states|actions|ui|themes|cli}`; lint `bunx eslint --config config/eslint.config.mjs <files>`. Action specs use `$effect.root(() => action(node))` + `flushSync()`.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `packages/states/src/commands.svelte.js` (create) | `CommandRegistry` + `commands` singleton + `Command` typedef + `normalizeShortcut`/`eventToShortcut` |
| `packages/states/src/index.js` (modify) | export `commands` |
| `packages/states/src/messages.svelte.js` (modify) | add `command` messages namespace |
| `packages/states/spec/commands.spec.svelte.js` (create) | registry tests |
| `packages/actions/src/shortcuts.svelte.js` (create) | `shortcuts` action |
| `packages/actions/src/index.js` (modify) | export `shortcuts` |
| `packages/actions/spec/shortcuts.spec.svelte.js` (create) | action tests |
| `packages/ui/src/components/CommandPalette.svelte` (create) | palette overlay |
| `packages/ui/src/components/index.ts` (modify) | export `CommandPalette` |
| `packages/ui/spec/CommandPalette.spec.svelte.ts` (create) | palette tests |
| `packages/themes/src/base/command-palette.css` (create) + 5 style files + index imports | theming |
| `packages/themes/spec/coverage.spec.js` (modify) | palette coverage guard |
| `apps/learn/src/routes/app/+layout.svelte` (modify) | register commands, `use:shortcuts`, render palette |
| `packages/app/src/components/TableOfContents.svelte` (modify) | migrate off `navigable` |
| `packages/actions/src/navigable.svelte.js`, `kbd.js`, `kbd.spec.js` (delete) | legacy removal |
| `packages/actions/src/index.js`, `types.js`, `utils.js` (modify) | drop navigable export/types/dead comments |
| `packages/cli/skills/command-system-rokkit/SKILL.md` (create) | skill |
| `packages/cli/spec/skills.spec.js` (modify) | catalog now 3 skills |
| `docs/llms/guides/commands.txt`, `docs/llms/components/command-palette.txt` (create); `docs/llms/packages/{states,actions,ui}.txt` (modify); `apps/learn/src/lib/guides/commands/content.md` (create) | docs |

---

## Task 1: `commands` registry + shortcut normalization (`@rokkit/states`)

**Files:** Create `packages/states/src/commands.svelte.js`, `packages/states/spec/commands.spec.svelte.js`; modify `packages/states/src/index.js`.

- [ ] **Step 1: Write the failing test** — `packages/states/spec/commands.spec.svelte.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { commands, normalizeShortcut, eventToShortcut } from '../src/commands.svelte.js'

function keydown(props) {
	return { key: props.key, ctrlKey: !!props.ctrl, metaKey: !!props.meta, altKey: !!props.alt, shiftKey: !!props.shift, preventDefault() {} }
}

describe('shortcut normalization', () => {
	it('normalizes modifier order and case (non-mac: mod→ctrl)', () => {
		// jsdom navigator is non-mac → mod = ctrl
		expect(normalizeShortcut('mod+K')).toBe('ctrl+k')
		expect(normalizeShortcut('shift+mod+p')).toBe('ctrl+shift+p')
		expect(normalizeShortcut('?')).toBe('?')
	})
	it('builds the same canonical string from an event', () => {
		expect(eventToShortcut(keydown({ key: 'k', ctrl: true }))).toBe('ctrl+k')
		expect(eventToShortcut(keydown({ key: 'P', ctrl: true, shift: true }))).toBe('ctrl+shift+p')
	})
})

describe('CommandRegistry', () => {
	beforeEach(() => {
		// clear any commands registered by earlier tests
		for (const c of [...commands.all]) commands.unregister(c.id)
	})

	it('register adds to all and returns an unregister fn', () => {
		const off = commands.register({ id: 'a', label: 'A', run: () => {} })
		expect(commands.all.map((c) => c.id)).toContain('a')
		off()
		expect(commands.all.map((c) => c.id)).not.toContain('a')
	})

	it('resolve maps a keydown to the matching command', () => {
		commands.register({ id: 'palette', label: 'Palette', shortcut: 'mod+k', run: () => {} })
		expect(commands.resolve(keydown({ key: 'k', ctrl: true }))?.id).toBe('palette')
		expect(commands.resolve(keydown({ key: 'j', ctrl: true }))).toBeNull()
	})

	it('execute runs the command; unknown id is a safe no-op', () => {
		const run = vi.fn()
		commands.register({ id: 'run-me', label: 'Run', run })
		commands.execute('run-me')
		expect(run).toHaveBeenCalledOnce()
		expect(() => commands.execute('nope')).not.toThrow()
	})

	it('disabled commands do not resolve or run', () => {
		const run = vi.fn()
		commands.register({ id: 'gated', label: 'Gated', shortcut: 'mod+g', run, enabled: () => false })
		expect(commands.resolve(keydown({ key: 'g', ctrl: true }))).toBeNull()
		commands.execute('gated')
		expect(run).not.toHaveBeenCalled()
	})

	it('warns on a duplicate shortcut and keeps the first binding', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const first = vi.fn(), second = vi.fn()
		commands.register({ id: 'first', label: 'First', shortcut: 'mod+d', run: first })
		commands.register({ id: 'second', label: 'Second', shortcut: 'mod+d', run: second })
		expect(warn).toHaveBeenCalled()
		commands.resolve(keydown({ key: 'd', ctrl: true }))?.run()
		expect(first).toHaveBeenCalledOnce()
		expect(second).not.toHaveBeenCalled()
		warn.mockRestore()
	})

	it('registerMany returns one unregister for the batch', () => {
		const off = commands.registerMany([
			{ id: 'm1', label: 'M1', run: () => {} },
			{ id: 'm2', label: 'M2', run: () => {} }
		])
		expect(commands.all.map((c) => c.id)).toEqual(expect.arrayContaining(['m1', 'm2']))
		off()
		expect(commands.all.map((c) => c.id)).not.toContain('m1')
		expect(commands.all.map((c) => c.id)).not.toContain('m2')
	})
})
```

- [ ] **Step 2: Run to verify it fails** — `bunx vitest run --project states packages/states/spec/commands.spec.svelte.js` → FAIL (cannot resolve `../src/commands.svelte.js`).

- [ ] **Step 3: Implement** — `packages/states/src/commands.svelte.js`:

```js
/**
 * App command registry — keyboard shortcuts + actions in one place.
 * Singleton, like `vibe`/`messages`. See docs/design/19-command-system.md.
 *
 * @typedef {Object} Command
 * @property {string}        id        Unique id; re-registering the same id replaces (warns).
 * @property {string}        label     Display text (consumer-localized).
 * @property {() => void}    run       Executed on shortcut match or palette select.
 * @property {string}        [shortcut] e.g. 'mod+k' | 'mod+shift+p' | '?'. `mod` = Cmd on macOS / Ctrl elsewhere.
 * @property {string}        [group]   Palette category.
 * @property {boolean}       [global]  Fire even while a text input is focused (default false).
 * @property {() => boolean} [enabled] Optional dynamic gate.
 * @property {string[]}      [keywords] Extra palette search terms.
 */

const MOD_ORDER = ['ctrl', 'meta', 'alt', 'shift']

function isMac() {
	if (typeof navigator === 'undefined') return false
	return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '')
}

/** Canonicalize a shortcut string: resolve `mod`, sort modifiers, lowercase the key. */
export function normalizeShortcut(shortcut) {
	const mods = new Set()
	let key = ''
	for (const raw of String(shortcut).toLowerCase().split('+')) {
		const p = raw.trim()
		if (!p) continue
		if (p === 'mod') mods.add(isMac() ? 'meta' : 'ctrl')
		else if (p === 'cmd' || p === 'meta') mods.add('meta')
		else if (p === 'ctrl' || p === 'control') mods.add('ctrl')
		else if (p === 'shift') mods.add('shift')
		else if (p === 'alt' || p === 'option') mods.add('alt')
		else key = p
	}
	return [...MOD_ORDER.filter((m) => mods.has(m)), key].join('+')
}

/** Build the canonical shortcut string from a KeyboardEvent. */
export function eventToShortcut(event) {
	const mods = []
	if (event.ctrlKey) mods.push('ctrl')
	if (event.metaKey) mods.push('meta')
	if (event.altKey) mods.push('alt')
	if (event.shiftKey) mods.push('shift')
	return [...MOD_ORDER.filter((m) => mods.includes(m)), String(event.key).toLowerCase()].join('+')
}

class CommandRegistry {
	#commands = $state(/** @type {Command[]} */ ([]))
	#byShortcut = new Map() // normalized shortcut → id (first registrant wins)

	/** @returns {Command[]} */
	get all() {
		return this.#commands
	}

	/** @param {Command} cmd @returns {() => void} unregister */
	register(cmd) {
		const idx = this.#commands.findIndex((c) => c.id === cmd.id)
		if (idx >= 0) {
			console.warn(`[commands] duplicate id "${cmd.id}" — replacing existing registration`)
			this.#commands[idx] = cmd
		} else {
			this.#commands = [...this.#commands, cmd]
		}
		if (cmd.shortcut) {
			const norm = normalizeShortcut(cmd.shortcut)
			const owner = this.#byShortcut.get(norm)
			if (owner && owner !== cmd.id) {
				console.warn(
					`[commands] shortcut "${cmd.shortcut}" already bound to "${owner}"; "${cmd.id}" will not receive it`
				)
			} else {
				this.#byShortcut.set(norm, cmd.id)
			}
		}
		return () => this.unregister(cmd.id)
	}

	/** @param {Command[]} cmds @returns {() => void} */
	registerMany(cmds) {
		const offs = cmds.map((c) => this.register(c))
		return () => offs.forEach((off) => off())
	}

	/** @param {string} id */
	unregister(id) {
		this.#commands = this.#commands.filter((c) => c.id !== id)
		for (const [shortcut, owner] of this.#byShortcut) {
			if (owner === id) this.#byShortcut.delete(shortcut)
		}
	}

	/** @param {string} id */
	execute(id) {
		const cmd = this.#commands.find((c) => c.id === id)
		if (!cmd) {
			console.warn(`[commands] unknown command "${id}"`)
			return
		}
		if (cmd.enabled && !cmd.enabled()) return
		cmd.run()
	}

	/** @param {KeyboardEvent} event @returns {Command | null} */
	resolve(event) {
		const id = this.#byShortcut.get(eventToShortcut(event))
		if (!id) return null
		const cmd = this.#commands.find((c) => c.id === id)
		if (!cmd || (cmd.enabled && !cmd.enabled())) return null
		return cmd
	}
}

export const commands = new CommandRegistry()
```

- [ ] **Step 4: Export** — add to `packages/states/src/index.js` (after the `messages` line):

```js
export { commands, normalizeShortcut, eventToShortcut } from './commands.svelte.js'
```

- [ ] **Step 5: Run to verify it passes** — `bunx vitest run --project states packages/states/spec/commands.spec.svelte.js` → PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/states/src/commands.svelte.js packages/states/src/index.js packages/states/spec/commands.spec.svelte.js
git commit -m "feat(states): command registry + shortcut normalization"
```

---

## Task 2: `command` messages namespace (`@rokkit/states`)

**Files:** Modify `packages/states/src/messages.svelte.js`.

The palette chrome (placeholder, no-results, label) is library i18n. Add a `command` namespace mirroring `search_`/`filter`.

- [ ] **Step 1: Write the failing test** — append to `packages/states/spec/commands.spec.svelte.js`:

```js
import { messages } from '../src/messages.svelte.js'
describe('command messages namespace', () => {
	it('exposes default palette chrome strings', () => {
		expect(typeof messages.command.placeholder).toBe('string')
		expect(messages.command.placeholder.length).toBeGreaterThan(0)
		expect(typeof messages.command.noResults).toBe('string')
		expect(typeof messages.command.label).toBe('string')
	})
})
```

- [ ] **Step 2: Run to verify it fails** — `bunx vitest run --project states packages/states/spec/commands.spec.svelte.js` → FAIL (`messages.command` is undefined).

- [ ] **Step 3: Implement** — in `packages/states/src/messages.svelte.js`: (a) add to the `defaultMessages` object (alongside `search_`/`filter`):

```js
	command: {
		placeholder: 'Run a command…',
		noResults: 'No commands found',
		label: 'Command palette'
	},
```

(b) add the public reactive field to the `MessagesStore` class (alongside `search_ = $state(...)`):

```js
	command = $state({ ...defaultMessages.command })
```

- [ ] **Step 4: Run to verify it passes** — `bunx vitest run --project states packages/states/spec/commands.spec.svelte.js` → PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/states/src/messages.svelte.js packages/states/spec/commands.spec.svelte.js
git commit -m "feat(states): add command messages namespace"
```

---

## Task 3: `shortcuts` action (`@rokkit/actions`)

**Files:** Create `packages/actions/src/shortcuts.svelte.js`, `packages/actions/spec/shortcuts.spec.svelte.js`; modify `packages/actions/src/index.js`.

The action takes the **registry** as its parameter (structural `{ resolve, execute }`) so `@rokkit/actions` does NOT import `@rokkit/states`.

- [ ] **Step 1: Write the failing test** — `packages/actions/spec/shortcuts.spec.svelte.js`:

```js
import { describe, it, expect, vi, afterEach } from 'vitest'
import { flushSync } from 'svelte'
import { shortcuts } from '../src/shortcuts.svelte.js'

function fakeRegistry(map) {
	// map: canonical 'ctrl+k' → { id, global? }
	return {
		execute: vi.fn(),
		resolve: (e) => {
			const parts = []
			if (e.ctrlKey) parts.push('ctrl')
			if (e.metaKey) parts.push('meta')
			if (e.shiftKey) parts.push('shift')
			parts.push(e.key.toLowerCase())
			return map[parts.join('+')] ?? null
		}
	}
}

afterEach(() => {
	document.body.replaceChildren()
})

function mount(registry) {
	const node = document.createElement('div')
	document.body.appendChild(node)
	const cleanup = $effect.root(() => shortcuts(node, registry))
	flushSync()
	return { node, cleanup }
}

describe('shortcuts action', () => {
	it('executes the resolved command on keydown', () => {
		const reg = fakeRegistry({ 'ctrl+k': { id: 'palette', global: true } })
		mount(reg)
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true }))
		flushSync()
		expect(reg.execute).toHaveBeenCalledWith('palette')
	})

	it('ignores a non-global command while a text input is focused', () => {
		const reg = fakeRegistry({ 'ctrl+j': { id: 'next', global: false } })
		mount(reg)
		const input = document.createElement('input')
		document.body.appendChild(input)
		input.focus()
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', ctrlKey: true, cancelable: true }))
		flushSync()
		expect(reg.execute).not.toHaveBeenCalled()
	})

	it('still fires a global command while a text input is focused', () => {
		const reg = fakeRegistry({ 'ctrl+k': { id: 'palette', global: true } })
		mount(reg)
		const input = document.createElement('input')
		document.body.appendChild(input)
		input.focus()
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true }))
		flushSync()
		expect(reg.execute).toHaveBeenCalledWith('palette')
	})

	it('removes the listener on destroy', () => {
		const reg = fakeRegistry({ 'ctrl+k': { id: 'palette', global: true } })
		const { cleanup } = mount(reg)
		cleanup()
		flushSync()
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true }))
		expect(reg.execute).not.toHaveBeenCalled()
	})
})
```

- [ ] **Step 2: Run to verify it fails** — `bunx vitest run --project actions packages/actions/spec/shortcuts.spec.svelte.js` → FAIL (cannot resolve).

- [ ] **Step 3: Implement** — `packages/actions/src/shortcuts.svelte.js`:

```js
import { on } from 'svelte/events'

const TYPEABLE = /^(input|textarea|select)$/i

function inEditable() {
	const el = document.activeElement
	if (!el) return false
	if (el.isContentEditable) return true
	return TYPEABLE.test(el.tagName)
}

/**
 * Global keyboard-shortcut capture. Resolves each keydown against a command
 * registry and dispatches the match. Takes the registry as its parameter so
 * `@rokkit/actions` stays independent of `@rokkit/states`.
 *
 * @param {HTMLElement} node
 * @param {{ resolve: (e: KeyboardEvent) => (null | { id: string, global?: boolean }), execute: (id: string) => void }} registry
 */
export function shortcuts(node, registry) {
	let current = registry

	const handleKeydown = (event) => {
		if (!current?.resolve) return
		const cmd = current.resolve(event)
		if (!cmd) return
		if (inEditable() && !cmd.global) return
		event.preventDefault()
		current.execute(cmd.id)
	}

	$effect(() => {
		current = registry
		const cleanup = on(window, 'keydown', handleKeydown)
		return () => cleanup()
	})
}
```

- [ ] **Step 4: Export** — add to `packages/actions/src/index.js` (after the `dismissable` line):

```js
export { shortcuts } from './shortcuts.svelte.js'
```

- [ ] **Step 5: Run to verify it passes** — `bunx vitest run --project actions packages/actions/spec/shortcuts.spec.svelte.js` → PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/actions/src/shortcuts.svelte.js packages/actions/src/index.js packages/actions/spec/shortcuts.spec.svelte.js
git commit -m "feat(actions): shortcuts action for global command dispatch"
```

---

## Task 4: `CommandPalette` component (`@rokkit/ui`)

**Files:** Create `packages/ui/src/components/CommandPalette.svelte`, `packages/ui/spec/CommandPalette.spec.svelte.ts`; modify `packages/ui/src/components/index.ts`.

- [ ] **Step 1: Write the failing test** — `packages/ui/spec/CommandPalette.spec.svelte.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { commands } from '@rokkit/states'
import CommandPalette from '../src/components/CommandPalette.svelte'

afterEach(() => {
	for (const c of [...commands.all]) commands.unregister(c.id)
})

describe('CommandPalette', () => {
	it('renders the overlay when open and lists registered commands', () => {
		commands.register({ id: 'new', label: 'New conversation', run: () => {} })
		commands.register({ id: 'theme', label: 'Toggle theme', run: () => {} })
		const { container } = render(CommandPalette, { props: { open: true } })
		expect(container.querySelector('[data-command-palette]')).toBeTruthy()
		expect(container.querySelectorAll('[data-command-item]').length).toBe(2)
	})

	it('filters the list by the search query', async () => {
		commands.register({ id: 'new', label: 'New conversation', run: () => {} })
		commands.register({ id: 'theme', label: 'Toggle theme', run: () => {} })
		const { container } = render(CommandPalette, { props: { open: true } })
		const input = container.querySelector('[data-command-input]') as HTMLInputElement
		await fireEvent.input(input, { target: { value: 'theme' } })
		const items = container.querySelectorAll('[data-command-item]')
		expect(items.length).toBe(1)
		expect(items[0].textContent).toContain('Toggle theme')
	})

	it('runs the selected command and closes', async () => {
		const run = vi.fn()
		commands.register({ id: 'new', label: 'New conversation', run })
		const { container } = render(CommandPalette, { props: { open: true } })
		await fireEvent.click(container.querySelector('[data-command-item]')!)
		expect(run).toHaveBeenCalledOnce()
		// closed: overlay gone
		expect(container.querySelector('[data-command-palette]')).toBeFalsy()
	})

	it('shows the no-results message when nothing matches', async () => {
		commands.register({ id: 'new', label: 'New conversation', run: () => {} })
		const { container } = render(CommandPalette, { props: { open: true } })
		const input = container.querySelector('[data-command-input]') as HTMLInputElement
		await fireEvent.input(input, { target: { value: 'zzzz' } })
		expect(container.querySelector('[data-command-empty]')).toBeTruthy()
	})
})
```

- [ ] **Step 2: Run to verify it fails** — `bunx vitest run --project ui packages/ui/spec/CommandPalette.spec.svelte.ts` → FAIL (cannot resolve).

- [ ] **Step 3: Implement** — `packages/ui/src/components/CommandPalette.svelte`. Minimal, dependency-light (local substring matcher; `dismissable` for outside/Escape; roving focus via a simple keyed list + Enter/Arrow handling — no Navigator needed for a transient list):

```svelte
<script>
	import { commands, messages } from '@rokkit/states'
	import { dismissable } from '@rokkit/actions'

	/** @type {{ open?: boolean, placeholder?: string }} */
	let { open = $bindable(false), placeholder } = $props()

	let query = $state('')
	let activeIndex = $state(0)

	const labels = $derived({
		placeholder: placeholder ?? messages.command.placeholder,
		noResults: messages.command.noResults,
		label: messages.command.label
	})

	function score(cmd, q) {
		const hay = `${cmd.label} ${cmd.id} ${(cmd.keywords ?? []).join(' ')}`.toLowerCase()
		return hay.includes(q)
	}

	const results = $derived.by(() => {
		const q = query.trim().toLowerCase()
		return q ? commands.all.filter((c) => score(c, q)) : commands.all
	})

	function close() {
		open = false
		query = ''
		activeIndex = 0
	}

	function runAt(index) {
		const cmd = results[index]
		if (!cmd) return
		close()
		commands.execute(cmd.id)
	}

	function onkeydown(event) {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			activeIndex = Math.min(activeIndex + 1, results.length - 1)
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			activeIndex = Math.max(activeIndex - 1, 0)
		} else if (event.key === 'Enter') {
			event.preventDefault()
			runAt(activeIndex)
		} else if (event.key === 'Escape') {
			close()
		}
	}
</script>

{#if open}
	<div data-command-backdrop>
		<div
			data-command-palette
			role="dialog"
			aria-modal="true"
			aria-label={labels.label}
			use:dismissable
			ondismiss={close}
		>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				data-command-input
				type="text"
				autofocus
				placeholder={labels.placeholder}
				bind:value={query}
				{onkeydown}
				oninput={() => (activeIndex = 0)}
			/>
			{#if results.length === 0}
				<p data-command-empty>{labels.noResults}</p>
			{:else}
				<ul data-command-list role="listbox">
					{#each results as cmd, i (cmd.id)}
						<li
							data-command-item
							data-active={i === activeIndex || undefined}
							role="option"
							aria-selected={i === activeIndex}
							onclick={() => runAt(i)}
							onmousemove={() => (activeIndex = i)}
						>
							<span data-command-label>{cmd.label}</span>
							{#if cmd.shortcut}<span data-command-shortcut>{cmd.shortcut}</span>{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
{/if}
```

> Note: validate this `.svelte` file with the Svelte MCP `svelte-autofixer` after writing (project convention for `.svelte` files), and fix anything it flags before committing.

- [ ] **Step 4: Export** — add to `packages/ui/src/components/index.ts` (alphabetically, near `Pill`):

```ts
export { default as CommandPalette } from './CommandPalette.svelte'
```

- [ ] **Step 5: Run to verify it passes** — `bunx vitest run --project ui packages/ui/spec/CommandPalette.spec.svelte.ts` → PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/CommandPalette.svelte packages/ui/src/components/index.ts packages/ui/spec/CommandPalette.spec.svelte.ts
git commit -m "feat(ui): CommandPalette component"
```

---

## Task 5: Theme the palette (`@rokkit/themes`)

**Files:** Create `packages/themes/src/base/command-palette.css` + `packages/themes/src/{rokkit,minimal,material,frosted,zen-sumi}/command-palette.css`; modify the six `index.css` files + `packages/themes/spec/coverage.spec.js`.

- [ ] **Step 1: Write the failing coverage test** — add to `packages/themes/spec/coverage.spec.js` (in the per-style section):

```js
describe('command palette is themed across styles', () => {
	it('base gives the palette structural layout', () => {
		expect(css('base', 'command-palette')).toContain('[data-command-palette]')
	})
	it.each(STYLES)('%s colors the command palette + active item', (style) => {
		const c = css(style, 'command-palette')
		expect(c).toContain('[data-command-palette]')
		expect(c).toMatch(/data-command-item\]\[data-active\][\s\S]*?bg-/)
	})
})
```

- [ ] **Step 2: Run to verify it fails** — `bunx vitest run --project themes packages/themes/spec/coverage.spec.js` → FAIL (files absent).

- [ ] **Step 3: Implement base** — `packages/themes/src/base/command-palette.css` (structure only, no color):

```css
[data-command-backdrop] {
	@apply fixed inset-0 z-50 flex items-start justify-center;
	padding-top: 12vh;
}
[data-command-palette] {
	@apply flex w-full max-w-xl flex-col gap-1 rounded-lg p-2 shadow-lg;
}
[data-command-input] {
	@apply w-full bg-transparent px-3 py-2 outline-none;
}
[data-command-list] {
	@apply m-0 flex max-h-80 list-none flex-col gap-0.5 overflow-y-auto p-0;
}
[data-command-item] {
	@apply flex cursor-pointer items-center justify-between rounded-md px-3 py-2;
}
[data-command-empty] {
	@apply px-3 py-6 text-center text-sm;
}
[data-command-shortcut] {
	@apply ml-auto text-xs;
}
```

- [ ] **Step 4: Implement each style** — create `packages/themes/src/<style>/command-palette.css` for each of `rokkit`, `minimal`, `material`, `frosted`, `zen-sumi`, color only, e.g. for `rokkit`:

```css
[data-style='rokkit'] [data-command-backdrop] {
	background: rgb(0 0 0 / 0.4);
}
[data-style='rokkit'] [data-command-palette] {
	@apply bg-paper-soft border-paper-edge border;
}
[data-style='rokkit'] [data-command-input] {
	@apply text-ink placeholder:text-ink-faint;
}
[data-style='rokkit'] [data-command-item] {
	@apply text-ink;
}
[data-style='rokkit'] [data-command-item][data-active] {
	@apply bg-primary text-on-primary;
}
[data-style='rokkit'] [data-command-shortcut] {
	@apply text-ink-mute;
}
[data-style='rokkit'] [data-command-empty] {
	@apply text-ink-mute;
}
```

Adapt the surface/active tokens per style to match that style's existing look (compare each style's `search-filter.css`/`menu.css`). Every style MUST include `[data-command-item][data-active] { @apply bg-…; }` (the coverage test asserts a `bg-` on the active item).

- [ ] **Step 5: Wire imports** — add `@import './command-palette.css';` to `packages/themes/src/base/index.css` and to each of the five `packages/themes/src/<style>/index.css`.

- [ ] **Step 6: Run to verify it passes** — `bunx vitest run --project themes packages/themes/spec/coverage.spec.js` → PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/themes/src
git commit -m "feat(themes): theme the command palette across all styles"
```

---

## Task 6: Wire the command system into `apps/learn` + demo

**Files:** Modify `apps/learn/src/routes/app/+layout.svelte`; (optional demo entry per existing koan demo pattern).

- [ ] **Step 1: Register global commands + install the action + render the palette.** In `apps/learn/src/routes/app/+layout.svelte`:
  - Import `{ commands, vibe } from '@rokkit/states'`, `{ shortcuts } from '@rokkit/actions'`, `{ CommandPalette } from '@rokkit/ui'`, plus the koan store actions used.
  - Add `let paletteOpen = $state(false)`.
  - In an `onMount`, `registerMany` the v1 commands and return the unregister:

```svelte
<script>
	import { onMount } from 'svelte'
	import { commands, vibe } from '@rokkit/states'
	import { shortcuts } from '@rokkit/actions'
	import { CommandPalette } from '@rokkit/ui'
	// ...existing layout imports + koan store actions (e.g. newConversation, goToDemo)

	let paletteOpen = $state(false)

	onMount(() =>
		commands.registerMany([
			{ id: 'palette.open', label: 'Open command palette', shortcut: 'mod+k', global: true, group: 'general', run: () => (paletteOpen = true) },
			{ id: 'theme.toggle', label: 'Toggle light / dark', shortcut: 'mod+shift+l', group: 'theme', run: () => (vibe.mode = vibe.mode === 'dark' ? 'light' : 'dark') }
			// + 'new-conversation', 'jump-to-demo' wired to the real koan store actions
		])
	)
</script>

<svelte:body use:shortcuts={commands} />

<!-- existing layout markup -->

<CommandPalette bind:open={paletteOpen} />
```

  - Wire `new-conversation` / `jump-to-demo` to the actual koan store functions (check `apps/learn/src/lib/koan/store.svelte.ts` for the real action names; use what exists). Validate the `.svelte` file with the Svelte MCP autofixer.

- [ ] **Step 2: Manual smoke test** — `cd apps/learn && bun run dev`, open `/app`, press Cmd/Ctrl+K → palette opens; type to filter; Enter runs (e.g. theme toggles). Esc closes. (Confirm the decorative `⌘K` badge now does something.)

- [ ] **Step 3: Commit**

```bash
git add apps/learn/src/routes/app/+layout.svelte
git commit -m "feat(learn): wire command palette into the app shell"
```

---

## Task 7: Consolidate legacy keyboard nav (migrate ToC, remove `navigable` + `kbd.js`)

**Files:** Modify `packages/app/src/components/TableOfContents.svelte`, `packages/actions/src/index.js`, `packages/actions/src/types.js`, `packages/actions/src/utils.js`; delete `packages/actions/src/navigable.svelte.js`, `packages/actions/src/kbd.js`, `packages/actions/spec/kbd.spec.js`.

- [ ] **Step 1: Migrate `TableOfContents` off `navigable`** — preserve exact behavior (prev/next/select) with a minimal inline keydown handler. In `TableOfContents.svelte`:
  - Remove `import { navigable } from '@rokkit/actions'`.
  - Replace the `<nav … use:navigable onprevious={handlePrevious} onnext={handleNext} onselect={handleSelect}>` with `<nav … onkeydown={handleKeydown}>`.
  - Add the handler (maps the same keys `navigable` mapped — Arrow/Enter):

```svelte
	function handleKeydown(event) {
		if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
			event.preventDefault()
			handlePrevious()
		} else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
			event.preventDefault()
			handleNext()
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			handleSelect()
		}
	}
```

  - Keep `handlePrevious`/`handleNext`/`handleSelect`, `focusedIndex`, roving `tabindex`, `onfocusin` as-is. Validate with the Svelte MCP autofixer.

- [ ] **Step 2: Verify ToC + actions suites still pass** — `bunx vitest run --project app` and `bunx vitest run --project actions` (the latter still has `navigable`/`kbd` present at this point) → PASS.

- [ ] **Step 3: Remove `navigable`** — delete `packages/actions/src/navigable.svelte.js`; remove its `export { navigable } …` line from `packages/actions/src/index.js`; remove `NavigableOptions`/`NavigableHandlers` from `packages/actions/src/types.js` if present.

- [ ] **Step 4: Remove `kbd.js`** — delete `packages/actions/src/kbd.js` and `packages/actions/spec/kbd.spec.js`. Remove the dead "moved to kbd.js" comments in `packages/actions/src/utils.js`.

- [ ] **Step 5: Verify nothing references the removed symbols** — run:

```bash
grep -rn "navigable\|kbd\.js\|getKeyboardAction\|defaultNavigationOptions\|createKeyboardActionMap" packages/ apps/ --include=*.js --include=*.ts --include=*.svelte | grep -v node_modules | grep -v '/dist/'
```
Expected: no `import`/`use:` hits (only the design doc / unrelated comments). Then `bunx vitest run --project actions` and `bunx vitest run --project app` → PASS.

- [ ] **Step 6: Update actions docs** — remove `navigable`/`kbd` references in `packages/actions/README.md` and `docs/llms/packages/actions.txt`.

- [ ] **Step 7: Commit**

```bash
git add -A packages/app/src/components/TableOfContents.svelte packages/actions packages/actions/README.md docs/llms/packages/actions.txt
git commit -m "refactor(actions): remove legacy kbd.js + navigable; migrate TableOfContents to inline keydown"
```

---

## Task 8: `command-system-rokkit` skill

**Files:** Create `packages/cli/skills/command-system-rokkit/SKILL.md`; modify `packages/cli/spec/skills.spec.js`.

- [ ] **Step 1: Update the catalog test first** — in `packages/cli/spec/skills.spec.js`, the `listSkills` test that asserts the catalog now expects three skills:

```js
		expect(names).toContain('semantic-styles-rokkit')
		expect(names).toContain('rokkit-components')
		expect(names).toContain('command-system-rokkit')
```

- [ ] **Step 2: Run to verify it fails** — `bunx vitest run --project cli packages/cli/spec/skills.spec.js` → FAIL (catalog lacks `command-system-rokkit`).

- [ ] **Step 3: Author the skill** — `packages/cli/skills/command-system-rokkit/SKILL.md`, beginning with EXACTLY:

```
---
name: command-system-rokkit
description: Use when adding keyboard shortcuts, a command palette, or app-level commands to a Rokkit (Svelte 5) app — the commands registry (@rokkit/states), the shortcuts action (@rokkit/actions), the CommandPalette component (@rokkit/ui), the 'mod+k' shortcut grammar, command scope/lifecycle, conflict detection, and i18n.
---
```

Body (match the voice/structure of `semantic-styles-rokkit`; ~150–250 lines, runnable Svelte 5 snippets verified against the code from Tasks 1–6):
- `# Rokkit Command System`
- `## The three pieces` — `commands` (states), `shortcuts` (actions), `CommandPalette` (ui), parallel to vibe/themable/ThemeSwitcherToggle.
- `## Defining commands` — the `Command` shape (`id`/`label`/`run`/`shortcut`/`group`/`global`/`enabled`); a runnable `commands.registerMany([...])`.
- `## Wiring it up` — `<svelte:body use:shortcuts={commands} />` + `<CommandPalette bind:open />` + a `palette.open` command at the app root.
- `## Scope & lifecycle` — global vs route/component-scoped; `register() → unregister()` in `onMount`/`$effect` cleanup.
- `## Shortcut grammar` — `'mod+k'` (`mod` = Cmd/Ctrl), `shift`/`alt`/plain keys; conflict detection warning.
- `## i18n` — palette chrome via `messages.command`; command labels are consumer strings.
- `## Common mistakes` — table (e.g. registering at module scope instead of onMount; forgetting `global: true` for Cmd+K; hand-rolling a window keydown listener instead of `shortcuts`).

- [ ] **Step 4: Verify** — `head -3 packages/cli/skills/command-system-rokkit/SKILL.md` shows the exact frontmatter; `bunx vitest run --project cli packages/cli/spec/skills.spec.js` → PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/skills/command-system-rokkit/SKILL.md packages/cli/spec/skills.spec.js
git commit -m "feat(cli): add command-system-rokkit skill"
```

---

## Task 9: Guides + reference docs

**Files:** Create `docs/llms/guides/commands.txt`, `docs/llms/components/command-palette.txt`, `apps/learn/src/lib/guides/commands/content.md`; modify `docs/llms/packages/{states,actions,ui}.txt` and the guide index/registration the learn site uses.

- [ ] **Step 1: llms guide** — `docs/llms/guides/commands.txt`: a "Commands & shortcuts" guide mirroring the structure of `docs/llms/guides/theming.txt` — the three pieces, defining commands, wiring (`use:shortcuts` + `CommandPalette`), the `'mod+k'` grammar, scope/lifecycle, i18n. Runnable snippets matching the shipped API.

- [ ] **Step 2: component doc** — `docs/llms/components/command-palette.txt`: props (`open` bindable, `placeholder`), data-attributes (`data-command-palette`/`-backdrop`/`-input`/`-list`/`-item`/`[data-active]`/`-shortcut`/`-empty`), and how it reads `commands.all` + `messages.command`. Match the format of other `components/*.txt`.

- [ ] **Step 3: package docs** — add the new exports: `commands` (+ `normalizeShortcut`/`eventToShortcut`) to `docs/llms/packages/states.txt`; `shortcuts` to `docs/llms/packages/actions.txt`; `CommandPalette` to `docs/llms/packages/ui.txt`.

- [ ] **Step 4: learn-site guide page** — `apps/learn/src/lib/guides/commands/content.md` (match the existing `apps/learn/src/lib/guides/theming/content.md` shape), and register it wherever the learn site lists guides (check how `theming`/`toolkit` guides are registered and add `commands` the same way).

- [ ] **Step 5: Verify fences balanced** — for each created/edited `.txt`/`.md`, confirm an even count of ``` fences.

- [ ] **Step 6: Commit**

```bash
git add docs/llms apps/learn/src/lib/guides
git commit -m "docs: command system guide + reference (llms + learn)"
```

---

## Task 10: Full verification

- [ ] **Step 1: Run the full suite** — `bun run test:ci` → all projects pass (states/actions/ui/themes/cli + others), including the new specs.
- [ ] **Step 2: Lint** — `bun run lint` → 0 errors (warnings acceptable per CLAUDE.md).
- [ ] **Step 3: Types** — for packages with tsconfig (`app`, `ui`): `cd packages/ui && bunx tsc --noEmit` (or rely on `bun run check:types`) → no new errors.
- [ ] **Step 4: Skills catalog end-to-end** — `node packages/cli/src/index.js skills list` lists three skills including `command-system-rokkit`.
- [ ] **Step 5: Svelte validation** — confirm every new/modified `.svelte` file (`CommandPalette.svelte`, the `+layout.svelte`, `TableOfContents.svelte`) passed the Svelte MCP `svelte-autofixer` with no outstanding issues.

---

## Release (after plan completion — only when the user authorizes)

Coordinated patch release via `bun run bump patch --yes` (runs `check`, bumps all packages, tags, pushes; CI publishes), then merge `develop → main`. **Breaking note:** the `navigable` export is removed from `@rokkit/actions` (only consumer was `TableOfContents`, migrated here) — call it out in the release notes. After publish, the `command-system-rokkit` skill is installable via `rokkit skills add command-system-rokkit`.
