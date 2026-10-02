/* A `demo` block says WHAT is on screen; `renderPlan` decides HOW the chat draws it — the
 * inline table/list/form, a plot, the demo's own live component, or a card to its page for
 * the demos that only exist inside the /app layout.
 */
import { describe, it, expect } from 'vitest'
import { renderPlan } from '../../../src/lib/chat-demo/intent/render-plan'

const ROWS = [
	{ name: 'Laptop', price: 1299 },
	{ name: 'Phone', price: 899 }
]

describe('renderPlan', () => {
	it('draws a table inline with its rows and props', () => {
		expect(renderPlan({ kind: 'demo', demo: 'table', props: { striped: true }, data: ROWS })).toEqual({
			kind: 'inline',
			tool: 'mount_table',
			props: { data: ROWS, striped: true }
		})
	})

	it('draws a chart as a plot of its data, in the variant’s geometry', () => {
		const plan = renderPlan({ kind: 'demo', demo: 'chart', variant: 'line', props: { x: 'name', y: 'price' }, data: ROWS })
		expect(plan).toMatchObject({ kind: 'plot', spec: { data: ROWS, x: 'name', y: 'price', geoms: [{ type: 'line' }] } })
	})

	it('draws a chart variant’s sample when it carries no data', () => {
		const plan = renderPlan({ kind: 'demo', demo: 'chart', variant: 'pie', props: {} })
		expect(plan).toMatchObject({ kind: 'plot', spec: { geoms: [{ type: 'arc' }] } })
	})

	it('mounts a self-contained demo live, with its props', () => {
		expect(renderPlan({ kind: 'demo', demo: 'badge', props: { variant: 'primary' } })).toEqual({
			kind: 'live',
			demo: 'badge',
			props: { variant: 'primary' }
		})
	})

	it('links to the page of a demo that only exists inside the /app layout', () => {
		expect(renderPlan({ kind: 'demo', demo: 'date-picker', props: {} })).toEqual({
			kind: 'card',
			demo: 'date-picker',
			href: '/app/date'
		})
	})
})
