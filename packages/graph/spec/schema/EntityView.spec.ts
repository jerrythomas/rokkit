import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import EntityView from '../../src/schema/EntityView.svelte'
import { GraphState } from '../../src/GraphState.svelte.js'
import { SCHEMA_FIELDS } from '../../src/schema/fromSchemaModel.js'

const TABLES = [
	{
		schema: 'public',
		name: 'users',
		kind: 'table',
		noteMd: 'People who sign in',
		indexes: [{ def: 'btree(email)', unique: true, name: 'users_email_key' }],
		columns: [
			{ name: 'id', type: 'uuid', pk: true, note: 'Primary key' },
			{ name: 'email', type: 'varchar(255)', nn: true }
		]
	},
	{
		schema: 'public',
		name: 'orders',
		kind: 'table',
		columns: [
			{ name: 'id', type: 'uuid', pk: true },
			{ name: 'user_id', type: 'uuid' }
		]
	}
]

const REFS = [
	{ from: { s: 'public', t: 'orders', c: 'user_id' }, to: { s: 'public', t: 'users', c: 'id' } }
]

/** Selection drives which entity is shown, so the fixture selects. */
function state(value: string | null = 'public.users', refs: unknown[] = REFS) {
	const s = new GraphState({ nodes: TABLES, edges: refs, fields: SCHEMA_FIELDS })
	if (value) s.select(value)
	return s
}

describe('EntityView', () => {
	it('shows the entity label and group', () => {
		// Scoped to the header rather than a bare getByText(/public/): the relationship list
		// also names its group, so a loose query matches two elements and throws.
		const { container } = render(EntityView, { state: state() })

		expect(container.querySelector('[data-graph-entity-title]')?.textContent).toBe('users')
		expect(container.querySelector('[data-graph-entity-group]')?.textContent).toContain('public')
	})

	it('renders the entity note', () => {
		const { container } = render(EntityView, { state: state() })

		expect(container.querySelector('[data-graph-note]')?.textContent).toContain(
			'People who sign in'
		)
	})

	it('lists every row of the entity', () => {
		const { container } = render(EntityView, { state: state() })

		expect(container.querySelectorAll('[data-graph-column]')).toHaveLength(2)
	})

	it('badges the primary key', () => {
		const { container } = render(EntityView, { state: state() })

		expect(container.querySelector('[data-row-badge="pk"]')).not.toBeNull()
	})

	it('badges a derived foreign key on the referencing entity', () => {
		const { container } = render(EntityView, { state: state('public.orders') })

		expect(container.querySelector('[data-row-badge="fk"]')).not.toBeNull()
	})

	it('renders a per-row note when present', () => {
		const { getByText } = render(EntityView, { state: state() })

		expect(getByText('Primary key')).toBeTruthy()
	})

	it('splits a sized type into base and size', () => {
		const { container } = render(EntityView, { state: state() })
		const types = [...container.querySelectorAll('[data-graph-column-type]')].map(
			(el) => el.textContent
		)
		const sizes = [...container.querySelectorAll('[data-graph-column-size]')].map(
			(el) => el.textContent
		)

		expect(types).toEqual(['uuid', 'varchar'])
		expect(sizes).toEqual(['—', '255'])
	})

	it('lists indexes from the node meta passthrough', () => {
		const { container } = render(EntityView, { state: state() })

		expect(container.querySelectorAll('[data-graph-index]')).toHaveLength(1)
	})

	it('shows an index definition, its uniqueness and its name', () => {
		const { container } = render(EntityView, { state: state() })
		const index = container.querySelector('[data-graph-index]') as HTMLElement

		expect(index.textContent).toContain('btree(email)')
		expect(index.textContent).toContain('users_email_key')
		expect(index.querySelector('[data-graph-index-unique]')).not.toBeNull()
	})

	it('renders no index section when the meta carries none', () => {
		const { container } = render(EntityView, { state: state('public.orders') })

		expect(container.querySelectorAll('[data-graph-index]')).toHaveLength(0)
	})

	it('renders one element per relationship the state reports', () => {
		const s = state()
		const { container } = render(EntityView, { state: s })

		expect(container.querySelectorAll('[data-graph-relationship]')).toHaveLength(
			s.relationships.length
		)
	})

	it('reflects the relationship direction onto the attribute', () => {
		const { container } = render(EntityView, { state: state() })

		expect(
			container.querySelector('[data-graph-relationship]')?.getAttribute('data-graph-relationship')
		).toBe('in')
	})

	it('reflects an outbound relationship from the other side', () => {
		const { container } = render(EntityView, { state: state('public.orders') })

		expect(container.querySelector('[data-graph-relationship="out"]')).not.toBeNull()
	})

	it('routes a relationship click through state.select', () => {
		const s = state()
		const { container } = render(EntityView, { state: s })

		;(container.querySelector('[data-graph-relationship]') as HTMLElement).click()
		expect(s.value).toBe('public.orders')
	})

	it('shows a referential action on the relationship when the ref carries one', () => {
		// `ON DELETE CASCADE` is the kind of thing you look at a relationship to find out.
		const cascading = [{ ...REFS[0], action: 'cascade' }]
		const { container } = render(EntityView, { state: state('public.users', cascading) })

		expect(container.querySelector('[data-graph-relationship-action]')?.textContent).toBe(
			'cascade'
		)
	})

	it('omits the action element when the ref has none', () => {
		const { container } = render(EntityView, { state: state() })

		expect(container.querySelector('[data-graph-relationship-action]')).toBeNull()
	})

	it('publishes the entity kind for theming', () => {
		const { container } = render(EntityView, { state: state() })

		expect(container.querySelector('[data-node-kind="table"]')).not.toBeNull()
	})

	it('renders an empty state when nothing is selected', () => {
		const { container } = render(EntityView, { state: state(null) })

		expect(container.querySelectorAll('[data-graph-column]')).toHaveLength(0)
	})

	it('renders an empty state when the selection names no known node', () => {
		const { container } = render(EntityView, { state: state('public.ghost') })

		expect(container.querySelectorAll('[data-graph-column]')).toHaveLength(0)
	})

	it('says so when an entity has no relationships', () => {
		const { container } = render(EntityView, { state: state('public.users', []) })

		expect(container.querySelectorAll('[data-graph-relationship]')).toHaveLength(0)
		expect(container.querySelector('[data-graph-relationships-empty]')).not.toBeNull()
	})

	it('omits the note section entirely when the entity has none', () => {
		const { container } = render(EntityView, { state: state('public.orders') })

		expect(container.querySelector('[data-graph-note]')).toBeNull()
	})

	it('constructs its own state from raw props when given neither state nor context', () => {
		const { container } = render(EntityView, {
			nodes: TABLES,
			edges: REFS,
			fields: SCHEMA_FIELDS,
			value: 'public.users'
		})

		expect(container.querySelectorAll('[data-graph-column]')).toHaveLength(2)
	})

	it('resolves the state from CONTEXT when no prop is given', () => {
		// Exercises the middle branch of the three-way resolution, which the test above does not.
		const { container } = render(EntityView, {
			context: new Map([['graph-state', state()]])
		})

		expect(container.querySelectorAll('[data-graph-column]')).toHaveLength(2)
	})
})
