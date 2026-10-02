/* Measures the interpreters on the same messages, scored after validation — the evidence for
 * how `interpretWith` picks one (journal 2026-10-02: local 18/22, System One 16/22, the hybrid
 * 20/22). It needs a running app with OLLAMA_URL, so it runs only when CHAT_EVAL_URL is set:
 *
 *   OLLAMA_URL=http://localhost:11434 bunx vite dev --port 5199   (in apps/learn)
 *   CHAT_EVAL_URL=http://localhost:5199 bunx vitest run --project learn apps/learn/spec/chat-demo/interpreter-eval.spec.ts
 */
import { it, expect } from 'vitest'
import { interpretLocally } from '../../src/lib/chat-demo/intent/local'
import { validate } from '../../src/lib/chat-demo/intent/validate'
import { interpretWith } from '../../src/lib/chat-demo/intent/interpret'
import type { Interpretation, Screen } from '../../src/lib/chat-demo/intent/types'
import { PRODUCTS } from '../../src/lib/chat-demo/intent/samples'

const table: Screen = { demo: 'table', props: {}, data: PRODUCTS }
const chart: Screen = { demo: 'chart', variant: 'bar', props: { x: 'name', y: 'price' }, data: PRODUCTS }
const S = (demo: string, props = {}): Screen => ({ demo, props })
type Want = (i: Interpretation) => boolean
const cases: [string, Screen | null, Want][] = [
	['show me a sortable table', null, (i) => i.intent === 'show' && i.demo === 'table'],
	['something with nested folders', null, (i) => i.intent === 'show' && i.demo === 'tree'],
	['pick a date', null, (i) => i.intent === 'show' && i.demo === 'date-picker'],
	['i need to let users upload files', null, (i) => i.intent === 'show' && /upload/.test(i.demo ?? '')],
	['notifications that pop up', null, (i) => i.intent === 'show' && i.demo === 'toasts'],
	['a section that stays dark', null, (i) => i.intent === 'show' && i.demo === 'lock-mode'],
	['let me pick several colours', null, (i) => i.intent === 'show' && i.demo === 'multi-select'],
	['make the rows striped', table, (i) => i.intent === 'modify' && i.props?.striped === true],
	['remove the stripes', { ...table, props: { striped: true } }, (i) => i.intent === 'modify' && i.props?.striped === false],
	['make it vertical', S('tabs'), (i) => i.intent === 'modify' && (i.props?.orientation === 'vertical' || i.variant === 'vertical')],
	['center the tabs', S('tabs'), (i) => i.intent === 'modify' && i.props?.align === 'center'],
	['use dotted lines', S('tree'), (i) => i.intent === 'modify' && (i.props?.lineStyle === 'dotted' || i.variant === 'dotted-lines')],
	['bigger rows please', S('list'), (i) => i.intent === 'modify' && i.props?.size === 'lg'],
	['smaller', S('tree'), (i) => i.intent === 'modify' && i.props?.size === 'sm'],
	['turn it into a pie', chart, (i) => i.intent === 'modify' && i.variant === 'pie'],
	['show the same data as a bar chart', table, (i) => i.intent === 'reshape' && i.view === 'chart'],
	['can I see this as a table', chart, (i) => i.intent === 'reshape' && i.view === 'table'],
	['how do I sort the columns?', table, (i) => i.intent === 'explain' && i.demo === 'table'],
	['how does the tree work?', table, (i) => i.intent === 'explain' && i.demo === 'tree'],
	['what is a stepper for', null, (i) => i.intent === 'explain' && i.demo === 'stepper'],
	['now show me some tabs', table, (i) => i.intent === 'show' && i.demo === 'tabs'],
	['hmm', null, (i) => i.intent === 'clarify']
]
const summary = (s: Screen | null) => (s ? { demo: s.demo, variant: s.variant, props: s.props } : null)
const BASE = process.env.CHAT_EVAL_URL

it.skipIf(!BASE)('the hybrid scores at least the local interpreter', async () => {
	const rows: string[] = []
	let local = 0, s1 = 0, ms = 0
	for (const [m, screen, want] of cases) {
		const l = validate(interpretLocally(m, screen), screen)
		const t = Date.now()
		const r = validate(await interpretWith('systemone', m, { screen, fetcher: ((u: string, init: RequestInit) => fetch(BASE + u, init)) as typeof fetch }), screen)
		ms += Date.now() - t
		const [lo, so] = [want(l), want(r)]
		local += Number(lo)
		s1 += Number(so)
		const fmt = (i: Interpretation) => `${i.intent}${i.demo ? `:${  i.demo}` : ''}${i.variant ? `/${  i.variant}` : ''}${i.view ? `>${  i.view}` : ''}${i.props ? JSON.stringify(i.props) : ''}`
		rows.push(`${lo ? 'OK ' : 'XX '} ${so ? 'OK ' : 'XX '} ${m.padEnd(36)} local=${fmt(l).padEnd(34)} hybrid=${fmt(r)}`)
	}
	console.log(`local ${local}/${cases.length}   hybrid ${s1}/${cases.length}   hybrid avg ${Math.round(ms / cases.length)}ms\n${rows.join('\n')}`)
	expect(s1).toBeGreaterThanOrEqual(local)
}, 300000)
