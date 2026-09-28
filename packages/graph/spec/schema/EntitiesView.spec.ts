/* DOM only — the counts themselves are GraphState's tests, not this file's.

   Row-level hooks are Table's (`[data-table-row]`), not a `data-graph-entity-row` of our
   own: Table owns the <tr>, and its `row` snippet is handed neither the entry key nor the
   focus flag, so re-rendering the row ourselves would drop `data-path` and the roving
   tabindex — breaking exactly the keyboard navigation this task exists to gain. */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import EntitiesView from '../../src/schema/EntitiesView.svelte'
import { GraphState } from '../../src/GraphState.svelte.js'
import { SCHEMA_FIELDS } from '../../src/schema/fromSchemaModel.js'

const TABLES = [
	{
		schema: 'public',
		name: 'users',
		kind: 'table',
		noteMd: 'People who sign in',
		columns: [
			{ name: 'id', type: 'uuid', pk: true },
			{ name: 'email', type: 'text' }
		]
	},
	{ schema: 'public', name: 'orders', kind: 'view', columns: [{ name: 'user_id', type: 'uuid' }] }
]

const REFS = [
	{ from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'public', t: 'users', c: 'id' } }
]

const state = (tables: unknown[] = TABLES, refs: unknown[] = REFS) =>
	new GraphState({ nodes: tables, edges: refs, fields: SCHEMA_FIELDS })

describe('EntitiesView', () => {
	it('renders a row per entity the state reports', () => {
		const { container } = render(EntitiesView, { state: state() })

		expect(container.querySelectorAll('[data-table-row]')).toHaveLength(2)
	})

	it('shows each entity name', () => {
		const { getByText } = render(EntitiesView, { state: state() })

		expect(getByText('users')).toBeTruthy()
	})

	it('renders the row count the state derived', () => {
		const s = state()
		const { container } = render(EntitiesView, { state: s })
		const shown = [...container.querySelectorAll('[data-graph-entity-rows]')].map(
			(el) => el.textContent
		)

		expect(shown).toEqual(s.entities.map((e) => String(e.rowCount)))
	})

	it('renders the ref count the state derived', () => {
		const s = state()
		const { container } = render(EntitiesView, { state: s })
		const shown = [...container.querySelectorAll('[data-graph-entity-refs]')].map(
			(el) => el.textContent
		)

		expect(shown).toEqual(s.entities.map((e) => String(e.refCount)))
	})

	it('shows an em dash rather than a zero when an entity has no references', () => {
		const { container } = render(EntitiesView, { state: state(TABLES, []) })
		const shown = [...container.querySelectorAll('[data-graph-entity-refs]')].map(
			(el) => el.textContent
		)

		expect(shown).toEqual(['—', '—'])
	})

	it('renders the note as formatted blocks', () => {
		const { container } = render(EntitiesView, { state: state() })

		expect(container.querySelector('[data-graph-note]')?.textContent).toContain(
			'People who sign in'
		)
	})

	it('publishes the entity kind for theming', () => {
		const { container } = render(EntitiesView, { state: state() })
		const kinds = [...container.querySelectorAll('[data-graph-entity-kind]')].map((el) =>
			el.getAttribute('data-graph-entity-kind')
		)

		expect(kinds.sort()).toEqual(['table', 'view'])
	})

	it('shows the group as a prefix on the entity name', () => {
		const { container } = render(EntitiesView, { state: state() })

		expect(container.querySelector('[data-graph-entity-group]')?.textContent).toContain('public')
	})

	it('routes a row click through state.select', () => {
		const s = state()
		const { container } = render(EntitiesView, { state: s })

		;(container.querySelector('[data-table-row]') as HTMLElement).click()
		expect(s.value).toBe('public.users')
	})

	it('selects the row that was clicked, not the first one', () => {
		const s = state()
		const { container } = render(EntitiesView, { state: s })
		const rows = [...container.querySelectorAll('[data-table-row]')] as HTMLElement[]

		rows[1].click()
		expect(s.value).toBe('public.orders')
	})

	it('gives the rows a roving tabindex so the grid is keyboard reachable', () => {
		// dbd put onclick on a bare <tr> with no tabindex and no key handler, so its rows were
		// mouse-only. A grid takes ONE tab stop and moves with the arrow keys, so the check is
		// that exactly one row is focusable — not that every row is.
		const { container } = render(EntitiesView, { state: state() })
		const rows = [...container.querySelectorAll('[data-table-row]')] as HTMLElement[]

		expect(rows).toHaveLength(2)
		expect(rows.filter((r) => r.tabIndex === 0)).toHaveLength(1)
		expect(rows.every((r) => r.hasAttribute('data-path'))).toBe(true)
	})

	it('renders an empty table for an empty model', () => {
		const { container } = render(EntitiesView, { state: state([], []) })

		expect(container.querySelectorAll('[data-table-row]')).toHaveLength(0)
	})

	it('constructs its own state from raw props when given neither state nor context', () => {
		const { container } = render(EntitiesView, {
			nodes: TABLES,
			edges: REFS,
			fields: SCHEMA_FIELDS
		})

		expect(container.querySelectorAll('[data-table-row]')).toHaveLength(2)
	})

	it('resolves the state from CONTEXT when no prop is given', () => {
		// The previous test exercises the self-construct fallback, not this. <Graph> publishes on
		// 'graph-state', so the context branch needs a real provider to be exercised at all —
		// otherwise the branch ships with no discriminating coverage under a name that claims it.
		const s = state()
		const { container } = render(EntitiesView, {
			context: new Map([['graph-state', s]])
		})

		expect(container.querySelectorAll('[data-table-row]')).toHaveLength(2)
	})

	it('prefers the state PROP over context when both are present', () => {
		const fromProp = state()
		const fromContext = state([], [])
		const { container } = render(EntitiesView, {
			props: { state: fromProp },
			context: new Map([['graph-state', fromContext]])
		})

		expect(container.querySelectorAll('[data-table-row]')).toHaveLength(2)
	})
})
