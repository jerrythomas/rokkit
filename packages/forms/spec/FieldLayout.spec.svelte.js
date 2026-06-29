import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'

import FieldLayout from '../src/FieldLayout.svelte'
import WrapperDiv from './fixtures/WrapperDiv.svelte'
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
})
