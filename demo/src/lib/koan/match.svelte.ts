import { catalog, miniIndex, findById } from './catalog'
import type { DemoMeta } from './types'

const MAX_RESULTS = 6

export function runMatch(query: string): DemoMeta[] {
	const q = query.trim()
	if (!q) return []
	const results = miniIndex.search(q)
	return results
		.slice(0, MAX_RESULTS)
		.map((r) => findById(r.id as string))
		.filter((d): d is DemoMeta => d !== undefined)
}

export function isStrongMatch(query: string, results: DemoMeta[]): boolean {
	if (results.length === 0) return false
	if (results.length === 1) return true
	const q = query.trim().toLowerCase()
	return results[0].title.toLowerCase() === q || results[0].id === q
}

export function nextSuggestions(visited: Set<string>): DemoMeta[] {
	const candidates = catalog.filter((d) => !visited.has(d.id))
	return candidates.slice(0, 3)
}
