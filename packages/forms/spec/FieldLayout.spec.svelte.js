import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import FieldLayout from '../src/FieldLayout.svelte'
import WrapperDiv from './fixtures/WrapperDiv.svelte'
import WrapperSection from './fixtures/WrapperSection.svelte'
import ComponentSpan from './fixtures/ComponentSpan.svelte'

/**
 * Build the registry context required by FieldLayout.
 */
function makeRegistry(extra = {}) {
	return new Map([
		[
			'registry',
			{
				wrappers: {
					default: WrapperDiv,
					...extra.wrappers
				},
				components: {
					default: ComponentSpan,
					custom: ComponentSpan,
					...extra.components
				}
			}
		]
	])
}

describe('FieldLayout', () => {
	beforeEach(() => cleanup())

	// ---------- Error case: no elements array ----------

	it('should render error element when schema has no elements', () => {
		const props = $state({ schema: {}, value: {} })
		const { container } = render(FieldLayout, {
			props,
			context: makeRegistry()
		})

		expect(container.querySelector('error')).toBeTruthy()
	})

	it('should render error element when elements is not an array', () => {
		const props = $state({ schema: { elements: 'bad' }, value: {} })
		const { container } = render(FieldLayout, {
			props,
			context: makeRegistry()
		})

		expect(container.querySelector('error')).toBeTruthy()
	})

	// ---------- Empty elements array ----------

	it('should render wrapper but no fields for empty elements array', () => {
		const props = $state({ schema: { elements: [] }, value: {} })
		const { container } = render(FieldLayout, {
			props,
			context: makeRegistry()
		})

		// Wrapper renders, no input fields
		expect(container.querySelector('[data-layout-wrapper]')).toBeTruthy()
		const fields = container.querySelectorAll('[data-field-root]')
		expect(fields).toHaveLength(0)
	})

	// ---------- Input field rendering ----------

	it('should render input fields for leaf elements with key', () => {
		const props = $state({
			schema: {
				elements: [{ key: 'name', props: { label: 'Name' } }]
			},
			value: { name: 'Alice' }
		})
		const { container } = render(FieldLayout, {
			props,
			context: makeRegistry()
		})

		expect(container.querySelector('[data-field-root]')).toBeTruthy()
	})

	it('should render input for element without key', () => {
		const props = $state({
			schema: {
				elements: [{ props: { label: 'Static' } }]
			},
			value: {}
		})
		const { container } = render(FieldLayout, {
			props,
			context: makeRegistry()
		})

		expect(container.querySelector('[data-layout-wrapper]')).toBeTruthy()
	})

	it('should render multiple leaf elements', () => {
		const props = $state({
			schema: {
				elements: [
					{ key: 'first', props: { label: 'First' } },
					{ key: 'last', props: { label: 'Last' } }
				]
			},
			value: { first: 'Jane', last: 'Doe' }
		})
		const { container } = render(FieldLayout, {
			props,
			context: makeRegistry()
		})

		const fields = container.querySelectorAll('[data-field-root]')
		expect(fields).toHaveLength(2)
	})

	// ---------- Nested FieldLayout (sub-schemas) ----------

	it('should recursively render nested schema with key', () => {
		const props = $state({
			schema: {
				elements: [
					{
						key: 'address',
						elements: [{ key: 'city', props: { label: 'City' } }]
					}
				]
			},
			value: { address: { city: 'Springfield' } }
		})
		const { container } = render(FieldLayout, {
			props,
			context: makeRegistry()
		})

		const fields = container.querySelectorAll('[data-field-root]')
		expect(fields.length).toBeGreaterThan(0)
	})

	it('should recursively render nested schema without key (passthrough)', () => {
		const props = $state({
			schema: {
				elements: [
					{
						elements: [{ key: 'city', props: { label: 'City' } }]
					}
				]
			},
			value: { city: 'Springfield' }
		})
		const { container } = render(FieldLayout, {
			props,
			context: makeRegistry()
		})

		const fields = container.querySelectorAll('[data-field-root]')
		expect(fields.length).toBeGreaterThan(0)
	})

	// ---------- Custom component rendering ----------

	it('should render custom component from registry when item.component is specified', () => {
		const props = $state({
			schema: {
				elements: [{ key: 'badge', component: 'custom', props: { label: 'Badge' } }]
			},
			value: { badge: 'gold' }
		})
		const { container } = render(FieldLayout, {
			props,
			context: makeRegistry()
		})

		expect(container.querySelector('[data-custom-component]')).toBeTruthy()
	})

	it('should use default component when component key is not in registry', () => {
		const props = $state({
			schema: {
				elements: [{ key: 'info', component: 'nonexistent', props: {} }]
			},
			value: { info: 'val' }
		})
		const { container } = render(FieldLayout, {
			props,
			context: makeRegistry()
		})

		// Falls back to registry.components.default = ComponentSpan
		expect(container.querySelector('[data-custom-component]')).toBeTruthy()
	})

	// ---------- Custom wrapper ----------

	it('should use named wrapper from registry', () => {
		const props = $state({
			schema: {
				wrapper: 'custom',
				elements: []
			},
			value: {}
		})
		const registry = new Map([
			[
				'registry',
				{
					wrappers: {
						default: WrapperDiv,
						custom: WrapperDiv
					},
					components: {
						default: ComponentSpan
					}
				}
			]
		])
		const { container } = render(FieldLayout, {
			props,
			context: registry
		})

		expect(container.querySelector('[data-layout-wrapper]')).toBeTruthy()
	})

	// ---------- path propagation ----------

	it('should use path when building element names', () => {
		const props = $state({
			schema: {
				elements: [{ key: 'email', props: { label: 'Email', type: 'email' } }]
			},
			value: { email: 'a@b.com' },
			path: ['user']
		})
		const { container } = render(FieldLayout, {
			props,
			context: makeRegistry()
		})

		const field = container.querySelector('[data-field-root]')
		expect(field).toBeTruthy()
	})

	// ---------- Reactivity to schema changes ----------

	it('should update wrapper props when schema changes', () => {
		const props = $state({
			schema: { elements: [], title: 'before' },
			value: {}
		})
		const { container } = render(FieldLayout, {
			props,
			context: makeRegistry()
		})

		expect(container.querySelector('[data-layout-wrapper]').getAttribute('title')).toBe('before')

		props.schema = { elements: [], title: 'after' }
		flushSync()

		expect(container.querySelector('[data-layout-wrapper]').getAttribute('title')).toBe('after')
	})

	it('should swap the wrapper component when schema.wrapper changes', () => {
		const props = $state({
			schema: { elements: [] },
			value: {}
		})
		const { container } = render(FieldLayout, {
			props,
			context: makeRegistry({ wrappers: { alt: WrapperSection } })
		})

		expect(container.querySelector('[data-layout-wrapper]')).toBeTruthy()

		props.schema = { wrapper: 'alt', elements: [] }
		flushSync()

		expect(container.querySelector('[data-layout-wrapper]')).toBeNull()
		expect(container.querySelector('[data-layout-wrapper-alt]')).toBeTruthy()
	})

	// ---------- Keyed elements: recursion and value binding ----------
	// The keyless variants were covered; the keyed ones are the shape a real
	// schema produces, and they are what bind a nested object's slice of `value`.

	it('recurses into a nested element that carries a key, binding its slice of value', () => {
		const props = $state({
			schema: {
				elements: [
					{
						key: 'address',
						elements: [{ key: 'street', props: { label: 'Street' } }]
					}
				]
			},
			value: { address: { street: '221B' } }
		})
		const { container } = render(FieldLayout, { props, context: makeRegistry() })
		flushSync()

		// Two wrappers: the outer layout plus the nested one it recursed into.
		expect(container.querySelectorAll('[data-layout-wrapper]').length).toBeGreaterThan(1)
		expect(container.querySelector('input')?.value).toBe('221B')
	})

	it('binds a keyed leaf field to its slice of value', () => {
		const props = $state({
			schema: { elements: [{ key: 'name', props: { label: 'Name' } }] },
			value: { name: 'Alice' }
		})
		const { container } = render(FieldLayout, { props, context: makeRegistry() })
		flushSync()

		expect(container.querySelector('input')?.value).toBe('Alice')
	})

	it('names a keyed field by its full path', () => {
		const props = $state({
			schema: {
				elements: [{ key: 'address', elements: [{ key: 'city', props: { label: 'City' } }] }]
			},
			value: { address: { city: 'Pune' } },
			path: ['form']
		})
		const { container } = render(FieldLayout, { props, context: makeRegistry() })
		flushSync()

		expect(container.querySelector('[name="form.address.city"]')).toBeTruthy()
	})

	it('falls back to its own defaults when value and schema are both omitted', () => {
		// The prop defaults (`value = $bindable({})`, `schema = {}`) only execute when
		// the prop is absent — passing `{}` explicitly skips them, which is what every
		// other case here does.
		const props = $state({})
		const { container } = render(FieldLayout, { props, context: makeRegistry() })

		expect(container.querySelector('error')).toBeTruthy()
	})

	it('writes a keyed leaf edit back into the bound value', async () => {
		// `bind:value={value[item.key]}` compiles to a getter AND a setter; reading
		// alone never runs the setter, so the write-back path needs a real edit.
		const props = $state({
			schema: { elements: [{ key: 'name', props: { label: 'Name' } }] },
			value: { name: 'Alice' }
		})
		render(FieldLayout, { props, context: makeRegistry() })
		flushSync()

		const input = document.querySelector('input')
		input.value = 'Bob'
		await fireEvent.change(input)
		flushSync()

		expect(props.value.name).toBe('Bob')
	})

	it('writes a keyed nested edit back through the recursive layout', async () => {
		const props = $state({
			schema: {
				elements: [{ key: 'address', elements: [{ key: 'street', props: { label: 'Street' } }] }]
			},
			value: { address: { street: '221B' } }
		})
		render(FieldLayout, { props, context: makeRegistry() })
		flushSync()

		const input = document.querySelector('input')
		input.value = '10 Downing'
		await fireEvent.change(input)
		flushSync()

		expect(props.value.address.street).toBe('10 Downing')
	})
})
