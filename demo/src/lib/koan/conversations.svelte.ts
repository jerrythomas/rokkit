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

const STORAGE_KEY = 'rokkit-conversations'
const MAX_CONVERSATIONS = 20

export type ConversationId = string
export type ConversationSurface = 'app' | 'chat'

export interface UserTurn {
	kind: 'user'
	id: string
	at: string
	text: string
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

export type Turn = UserTurn | AssistantTurn

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

export const conversations = $state<Conversation[]>(loadFromStorage())
const currentRef = $state<{ id: ConversationId | null }>({ id: null })

export function getCurrentId(): ConversationId | null {
	return currentRef.id
}

export function setCurrentId(id: ConversationId | null): void {
	currentRef.id = id
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
 * initial query. Returns the new conversation id.
 */
export function startNew(surface: ConversationSurface, query: string): ConversationId {
	const id = makeId('conv')
	const at = nowIso()
	const userTurn: UserTurn = { kind: 'user', id: makeId('t'), at, text: query }
	const conv: Conversation = {
		id,
		title: query.trim().slice(0, 80) || 'New conversation',
		surface,
		createdAt: at,
		updatedAt: at,
		turns: [userTurn]
	}
	conversations.unshift(conv)
	pruneOldest()
	currentRef.id = id
	persist()
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
	if (currentRef.id === id) currentRef.id = null
	persist()
}

/** Drop everything. */
export function clearAll(): void {
	conversations.splice(0, conversations.length)
	currentRef.id = null
	persist()
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
	const now = new Date()
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
		return weekdays[new Date(t).getDay()]
	}
	return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
