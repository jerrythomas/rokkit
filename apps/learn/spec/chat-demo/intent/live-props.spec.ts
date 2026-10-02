/* A demo the chat mounts live gets its variant and props as component props — so the chat may
 * offer to change only the demos whose component declares `$props()`. FIXED_LIVE lists the
 * rest; this reads every live demo's source so the list cannot drift from the code.
 */
import { describe, it, expect } from 'vitest'
import { catalog } from '../../../src/lib/koan/catalog'
import { FIXED_LIVE } from '../../../src/lib/chat-demo/intent/demos'
import { renderPlan } from '../../../src/lib/chat-demo/intent/render-plan'

const sources = import.meta.glob('../../../src/lib/koan/demos/*/*.svelte', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

/** The source file a demo's `load()` imports, by its meta. */
const metas = import.meta.glob('../../../src/lib/koan/demos/*/meta.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
function componentSource(id: string): string | undefined {
	const metaPath = Object.keys(metas).find((p) => p.includes(`/demos/${id}/meta.ts`))
	const file = metaPath && metas[metaPath].match(/load: \(\) => import\('\.\/([^']+)'\)/)?.[1]
	return file ? sources[metaPath.replace('meta.ts', file)] : undefined
}

describe('FIXED_LIVE', () => {
	const live = catalog.filter((d) => renderPlan({ kind: 'demo', demo: d.id, props: {} }).kind === 'live')

	it.each(live.map((d) => d.id))('%s: offered changes only if its component takes props', (id) => {
		const takesProps = /\$props\(\)/.test(componentSource(id) ?? '')
		expect(FIXED_LIVE.has(id)).toBe(!takesProps)
	})
})
