/* Minimal note renderer for DDL comments: paragraphs, bullet lists, and `inline code`.
   Shared by EntitiesView and EntityView so they format comments identically. Returns a
   structured tree the components render.

   Deliberately NOT a markdown library. It recognises backticks and bullets and nothing
   else, so no tag is ever interpreted — the segment text carries any markup verbatim and
   Svelte's text interpolation escapes it at render time. That is what lets this package
   ship with no markdown parser and no sanitiser, which are exactly the dependencies
   @rokkit/ui's MarkdownRenderer would have dragged in. */

export type Seg = { code: boolean; text: string }
export type Block = { type: 'p' | 'ul'; lines: Seg[][] }

const BULLET = /^[-•]\s/

/** Split a line into plain / `code` segments. */
export function inlineSegs(text: string): Seg[] {
	const segs: Seg[] = []
	let last = 0

	for (const m of text.matchAll(/`([^`]+)`/g)) {
		const idx = m.index ?? 0
		if (idx > last) segs.push({ code: false, text: text.slice(last, idx) })
		segs.push({ code: true, text: m[1] })
		last = idx + m[0].length
	}

	if (last < text.length) segs.push({ code: false, text: text.slice(last) })

	return segs
}

/** Consume a run of bullet lines starting at `i`, returning the block and the next index. */
function takeList(lines: string[], start: number): { block: Block; next: number } {
	const items: Seg[][] = []
	let i = start

	while (i < lines.length && BULLET.test(lines[i].trim())) {
		items.push(inlineSegs(lines[i].trim().replace(BULLET, '')))
		i++
	}

	return { block: { type: 'ul', lines: items }, next: i }
}

/** Consume a run of non-blank, non-bullet lines as one paragraph. */
function takeParagraph(lines: string[], start: number): { block: Block; next: number } {
	const para: string[] = []
	let i = start

	while (i < lines.length && lines[i].trim() && !BULLET.test(lines[i].trim())) {
		para.push(lines[i].trim())
		i++
	}

	return { block: { type: 'p', lines: [inlineSegs(para.join(' '))] }, next: i }
}

/** Parse a note string into paragraph / bullet-list blocks. */
export function noteBlocks(src?: string): Block[] {
	if (!src) return []

	const out: Block[] = []
	const lines = src.split('\n')
	let i = 0

	while (i < lines.length) {
		if (!lines[i].trim()) {
			i++
			continue
		}

		const { block, next } = BULLET.test(lines[i].trim())
			? takeList(lines, i)
			: takeParagraph(lines, i)

		out.push(block)
		i = next
	}

	return out
}
