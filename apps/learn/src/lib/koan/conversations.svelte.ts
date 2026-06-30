/**
 * Shared conversation history for the /app and /chat surfaces.
 *
 * Each Conversation is a record of "what the user asked + what Rokkit
 * showed." The sidebar reads {title, surface, updatedAt} for the row,
 * the active route reads turns[] for rendering. Persisted to
 * localStorage (cap 20, oldest pruned on append) so the sidebar
 * survives reloads.
 */

import type { ShellDemoType } from './shell.svelte'
import { SvelteDate } from 'svelte/reactivity'

const STORAGE_KEY = 'rokkit-conversations'
const CURRENT_KEY = 'rokkit-current-conversation'
const MAX_CONVERSATIONS = 20

export type ConversationId = string
export type ConversationSurface = 'app' | 'chat'

export interface UserTurn {
	kind: 'user'
	id: string
	at: string
	text: string
}

/**
 * A live prop tweak the user applied to the canvas component. Persisted
 * with the conversation so the canvas restores to the same values on
 * reload + resume — replayed by the layout on mount into the in-memory
 * `tweaksByDemo` map. No longer surfaced as a chat-stream row (felt
 * noisy when clicking through enum values); the canvas's own tweak
 * strip shows the live count instead. `demoType` scopes rows to the
 * currently mounted demo when one conversation spans multiple demos.
 */
export interface TweakTurn {
	kind: 'tweak'
	id: string
	at: string
	demoType: string
	name: string
	from: unknown
	to: unknown
}

export type ChatProvider = 'scripted' | 'openrouter' | 'webllm'

export type AssistantBody =
	| { kind: 'demo'; demoType: ShellDemoType; variant: string | null }
	| {
			kind: 'blocks'
			blocks: unknown[]
			provider?: ChatProvider
			model?: string
	  }
	| { kind: 'markdown'; text: string }
	| { kind: 'component'; component: string; props: unknown }
	| { kind: 'error'; message: string }

export interface AssistantTurn {
	kind: 'assistant'
	id: string
	at: string
	body: AssistantBody
}

export type Turn = UserTurn | AssistantTurn | TweakTurn

export interface Conversation {
	id: ConversationId
	title: string
	surface: ConversationSurface
	createdAt: string
	updatedAt: string
	turns: Turn[]
}

// ── State ────────────────────────────────────────────────────────────────

function loadFromStorage(): Conversation[] {
	if (typeof localStorage === 'undefined') return []
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return []
		const parsed = JSON.parse(raw)
		if (!Array.isArray(parsed)) return []
		return parsed.filter(isValidConversation)
	} catch {
		return []
	}
}

function isValidConversation(c: unknown): c is Conversation {
	if (!c || typeof c !== 'object') return false
	const o = c as Record<string, unknown>
	return (
		typeof o.id === 'string' &&
		typeof o.title === 'string' &&
		(o.surface === 'app' || o.surface === 'chat') &&
		typeof o.createdAt === 'string' &&
		typeof o.updatedAt === 'string' &&
		Array.isArray(o.turns)
	)
}

function loadCurrentIdFromStorage(): ConversationId | null {
	if (typeof localStorage === 'undefined') return null
	try {
		return localStorage.getItem(CURRENT_KEY)
	} catch {
		return null
	}
}

export const conversations = $state<Conversation[]>(loadFromStorage())
// Restore the previously-active conversation id only if it still
// exists in storage — protects against an orphaned id pointing at a
// conversation that was pruned or cleared.
const initialCurrent = (() => {
	const stored = loadCurrentIdFromStorage()
	if (stored && conversations.some((c) => c.id === stored)) return stored
	return null
})()
const currentRef = $state<{ id: ConversationId | null }>({ id: initialCurrent })

export function getCurrentId(): ConversationId | null {
	return currentRef.id
}

export function setCurrentId(id: ConversationId | null): void {
	currentRef.id = id
	persistCurrentId()
}

/** Returns the active conversation by current id, or null. */
export function getCurrentConversation(): Conversation | null {
	if (!currentRef.id) return null
	return conversations.find((c) => c.id === currentRef.id) ?? null
}

// ── Persistence ──────────────────────────────────────────────────────────

function persist(): void {
	if (typeof localStorage === 'undefined') return
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
	} catch (e) {
		// eslint-disable-next-line no-console
		console.warn('Failed to persist conversations', e)
	}
}

function persistCurrentId(): void {
	if (typeof localStorage === 'undefined') return
	try {
		if (currentRef.id) localStorage.setItem(CURRENT_KEY, currentRef.id)
		else localStorage.removeItem(CURRENT_KEY)
	} catch {
		// Quota / private-mode failures — current-id is a UX nicety, not load-bearing.
	}
}

// ── Helpers ──────────────────────────────────────────────────────────────

function nowIso(): string {
	return new Date().toISOString()
}

function makeId(prefix: string): string {
	const r = Math.random().toString(36).slice(2, 8)
	return `${prefix}_${Date.now()}_${r}`
}

function pruneOldest(): void {
	if (conversations.length <= MAX_CONVERSATIONS) return
	// Sort by updatedAt asc, drop the oldest.
	const sorted = [...conversations].sort(
		(a, b) => Date.parse(a.updatedAt) - Date.parse(b.updatedAt)
	)
	const toRemove = sorted.slice(0, conversations.length - MAX_CONVERSATIONS)
	for (const stale of toRemove) {
		const idx = conversations.findIndex((c) => c.id === stale.id)
		if (idx >= 0) conversations.splice(idx, 1)
	}
}

function findIndexById(id: ConversationId): number {
	return conversations.findIndex((c) => c.id === id)
}

function touch(id: ConversationId): void {
	const idx = findIndexById(id)
	if (idx >= 0) conversations[idx].updatedAt = nowIso()
}

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Start a new conversation, set it as current, and append the user's
 * initial query. Returns the conversation id — the existing row's id
 * when an `app` title matched, otherwise a new one.
 */
export function startNew(surface: ConversationSurface, query: string): ConversationId {
	const at = nowIso()
	const title = query.trim().slice(0, 80) || 'New conversation'
	const userTurn: UserTurn = { kind: 'user', id: makeId('t'), at, text: query }

	// Upsert by title for the `app` surface: re-exploring the same component
	// reuses its existing row (turns reset, moved to top) instead of stacking
	// duplicate-titled entries. The `chat` surface always appends.
	if (surface === 'app') {
		const existingIdx = conversations.findIndex(
			(c) => c.surface === 'app' && c.title === title
		)
		if (existingIdx >= 0) {
			const [existing] = conversations.splice(existingIdx, 1)
			existing.updatedAt = at
			existing.turns = [userTurn]
			conversations.unshift(existing)
			currentRef.id = existing.id
			persist()
			persistCurrentId()
			return existing.id
		}
	}

	const id = makeId('conv')
	const conv: Conversation = {
		id,
		title,
		surface,
		createdAt: at,
		updatedAt: at,
		turns: [userTurn]
	}
	conversations.unshift(conv)
	pruneOldest()
	currentRef.id = id
	persist()
	persistCurrentId()
	return id
}

/** Append a user turn to the current conversation. */
export function appendUser(text: string): void {
	if (!currentRef.id) return
	const idx = findIndexById(currentRef.id)
	if (idx < 0) return
	const turn: UserTurn = { kind: 'user', id: makeId('t'), at: nowIso(), text }
	conversations[idx].turns.push(turn)
	conversations[idx].updatedAt = turn.at
	persist()
}

/** Append a tweak turn (live prop edit) to the current conversation. */
export function appendTweak(
	demoType: string,
	name: string,
	from: unknown,
	to: unknown
): void {
	if (!currentRef.id) return
	const idx = findIndexById(currentRef.id)
	if (idx < 0) return
	const turn: TweakTurn = {
		kind: 'tweak',
		id: makeId('t'),
		at: nowIso(),
		demoType,
		name,
		from,
		to
	}
	conversations[idx].turns.push(turn)
	conversations[idx].updatedAt = turn.at
	persist()
}

/**
 * Drop all tweak turns for a given demoType from the current
 * conversation — backs the Tweaks slab's "Reset to defaults" button.
 */
export function clearTweaksFor(demoType: string): void {
	if (!currentRef.id) return
	const idx = findIndexById(currentRef.id)
	if (idx < 0) return
	const turns = conversations[idx].turns
	const filtered = turns.filter((t) => !(t.kind === 'tweak' && t.demoType === demoType))
	if (filtered.length === turns.length) return
	conversations[idx].turns = filtered
	conversations[idx].updatedAt = nowIso()
	persist()
}

/** Append an assistant turn to the current conversation. */
export function appendAssistant(body: AssistantBody): void {
	if (!currentRef.id) return
	const idx = findIndexById(currentRef.id)
	if (idx < 0) return
	const turn: AssistantTurn = { kind: 'assistant', id: makeId('t'), at: nowIso(), body }
	conversations[idx].turns.push(turn)
	conversations[idx].updatedAt = turn.at
	persist()
}

/**
 * Update the last assistant turn's component props in place — used by
 * /chat editable artifacts so edits persist without flooding the
 * history with one turn per keystroke.
 */
export function updateLastAssistantProps(props: unknown): void {
	if (!currentRef.id) return
	const idx = findIndexById(currentRef.id)
	if (idx < 0) return
	const turns = conversations[idx].turns
	for (let i = turns.length - 1; i >= 0; i--) {
		const t = turns[i]
		if (t.kind === 'assistant' && t.body.kind === 'component') {
			t.body = { ...t.body, props }
			conversations[idx].updatedAt = nowIso()
			persist()
			return
		}
	}
}

/** Resume an existing conversation by id. */
export function loadConversation(id: ConversationId): Conversation | null {
	const conv = conversations.find((c) => c.id === id)
	if (!conv) return null
	currentRef.id = id
	touch(id)
	persist()
	persistCurrentId()
	return conv
}

/** Returns the most-recent conversation for a surface, or null. */
export function mostRecent(surface?: ConversationSurface): Conversation | null {
	const pool = surface ? conversations.filter((c) => c.surface === surface) : conversations
	if (pool.length === 0) return null
	return [...pool].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0]
}

/** Delete a conversation. */
export function removeConversation(id: ConversationId): void {
	const idx = findIndexById(id)
	if (idx < 0) return
	conversations.splice(idx, 1)
	if (currentRef.id === id) {
		currentRef.id = null
		persistCurrentId()
	}
	persist()
}

/** Drop everything. */
export function clearAll(): void {
	conversations.splice(0, conversations.length)
	currentRef.id = null
	persist()
	persistCurrentId()
}

// ── Bucketing (today / yesterday / earlier) ──────────────────────────────

export interface ConversationBuckets {
	today: Conversation[]
	yesterday: Conversation[]
	earlier: Conversation[]
}

function startOfDay(d: Date): number {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

export function bucketByRecency(surface?: ConversationSurface): ConversationBuckets {
	const pool = surface ? conversations.filter((c) => c.surface === surface) : conversations
	const sorted = [...pool].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
	const now = new SvelteDate()
	const todayStart = startOfDay(now)
	const yesterdayStart = todayStart - 24 * 60 * 60 * 1000

	const buckets: ConversationBuckets = { today: [], yesterday: [], earlier: [] }
	for (const c of sorted) {
		const t = Date.parse(c.updatedAt)
		if (t >= todayStart) buckets.today.push(c)
		else if (t >= yesterdayStart) buckets.yesterday.push(c)
		else buckets.earlier.push(c)
	}
	return buckets
}

/** Relative "12m / 2h / yest / Mon / Sun" label for a conversation. */
export function recencyLabel(c: Conversation): string {
	const now = Date.now()
	const t = Date.parse(c.updatedAt)
	const diffMs = now - t
	const min = Math.floor(diffMs / (60 * 1000))
	if (min < 60) return `${Math.max(1, min)}m`
	const hr = Math.floor(diffMs / (60 * 60 * 1000))
	if (hr < 24) return `${hr}h`
	const days = Math.floor(diffMs / (24 * 60 * 60 * 1000))
	if (days === 1) return 'yest'
	if (days < 7) {
		const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
		return weekdays[new SvelteDate(t).getDay()]
	}
	return new SvelteDate(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
