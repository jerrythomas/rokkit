/* `explain` answers from a demo's own `docs.md` — real documentation, nothing generated. The
 * docs are split at their `## ` headings and the section that best matches the topic wins.
 */
import MiniSearch from 'minisearch'

export type DocSection = { id: number; heading: string; body: string }

export function docSections(markdown: string): DocSection[] {
	return markdown
		.split(/^(?=## )/m)
		.map((chunk) => chunk.trim())
		.filter((chunk) => chunk.startsWith('## '))
		.map((chunk, id) => ({ id, heading: chunk.slice(3, chunk.indexOf('\n') === -1 ? undefined : chunk.indexOf('\n')).trim(), body: chunk }))
}

/** The section about `topic`, or the opening section when there is no topic or no match. */
export function bestSection(markdown: string, topic: string): DocSection | null {
	const sections = docSections(markdown)
	if (sections.length === 0) return null
	if (!topic.trim()) return sections[0]
	const index = new MiniSearch<DocSection>({
		fields: ['heading', 'body'],
		searchOptions: { boost: { heading: 3 }, fuzzy: 0.2, prefix: true }
	})
	index.addAll(sections)
	const [hit] = index.search(topic)
	return hit ? sections[hit.id] : sections[0]
}
