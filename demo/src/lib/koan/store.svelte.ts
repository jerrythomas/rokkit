import type { TimelineEntry } from './types'
import { read, write } from './persistence'

const HISTORY_KEY = 'koan.history'

function loadHistory(): TimelineEntry[] {
	return (
		read<TimelineEntry[]>(HISTORY_KEY, (v) =>
			Array.isArray(v) && v.every((e: unknown) => typeof (e as TimelineEntry)?.demoId === 'string')
		) ?? []
	)
}

export const koan = $state({
	query: '',
	activeDemoId: null as string | null,
	history: loadHistory(),
	visitedThisSession: new Set<string>()
})

export function recordVisit(demoId: string, query: string) {
	koan.activeDemoId = demoId
	koan.visitedThisSession.add(demoId)
	const entry: TimelineEntry = {
		demoId,
		mountedAt: new Date().toISOString(),
		query
	}
	const filtered = koan.history.filter((e) => e.demoId !== demoId)
	koan.history = [entry, ...filtered]
	write(HISTORY_KEY, koan.history)
}

export function resetSession() {
	koan.query = ''
	koan.activeDemoId = null
	koan.history = []
	koan.visitedThisSession.clear()
	write(HISTORY_KEY, [])
}
