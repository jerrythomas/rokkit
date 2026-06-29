import { describe, expect, beforeEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'

import InfoField from '../src/InfoField.svelte'

describe('InfoField', () => {
	beforeEach(() => cleanup())

	it('should render with data-field-root attribute', () => {
		const props = $state({ name: 'status', value: 'active' })
		const { container } = render(InfoField, { props })

		expect(container.querySelector('[data-field-root]')).toBeTruthy()
	})

	it('should set data-field-type="info"', () => {
		const props = $state({ name: 'status', value: 'active' })
		const { container } = render(InfoField, { props })

		const root = container.querySelector('[data-field-root]')
		expect(root.getAttribute('data-field-type')).toBe('info')
	})

	it('should render value in data-field-info span', () => {
		const props = $state({ name: 'status', value: 'active' })
		const { container } = render(InfoField, { props })

		const info = container.querySelector('[data-field-info]')
		expect(info?.textContent).toBe('active')
	})

	it('should render "—" when value is undefined', () => {
		const props = $state({ name: 'status' })
		const { container } = render(InfoField, { props })

		const info = container.querySelector('[data-field-info]')
		expect(info?.textContent).toBe('—')
	})

	it('should NOT render "—" when value is null (shows String(null))', () => {
		const props = $state({ name: 'status', value: null })
		const { container } = render(InfoField, { props })

		const info = container.querySelector('[data-field-info]')
		expect(info?.textContent).toBe('null')
	})

	it('should convert numeric value to string', () => {
		const props = $state({ name: 'count', value: 42 })
		const { container } = render(InfoField, { props })

		const info = container.querySelector('[data-field-info]')
		expect(info?.textContent).toBe('42')
	})

	it('should set data-field-empty when value is undefined', () => {
		const props = $state({ name: 'status' })
		const { container } = render(InfoField, { props })

		const root = container.querySelector('[data-field-root]')
		expect(root.getAttribute('data-field-empty')).toBe('true')
	})

	it('should set data-field-empty when value is null', () => {
		const props = $state({ name: 'status', value: null })
		const { container } = render(InfoField, { props })

		const root = container.querySelector('[data-field-root]')
		expect(root.getAttribute('data-field-empty')).toBe('true')
	})

	it('should set data-field-empty to false when value is present', () => {
		const props = $state({ name: 'status', value: 'active' })
		const { container } = render(InfoField, { props })

		const root = container.querySelector('[data-field-root]')
		// Svelte renders data-field-empty={false} as attribute with value "false"
		expect(root.getAttribute('data-field-empty')).toBe('false')
	})

	it('should render label when provided', () => {
		const props = $state({ name: 'status', value: 'active', label: 'Status' })
		const { container } = render(InfoField, { props })

		const label = container.querySelector('label')
		expect(label?.textContent).toBe('Status')
		expect(label?.getAttribute('for')).toBe('status')
	})

	it('should not render label element when label is not provided', () => {
		const props = $state({ name: 'status', value: 'active' })
		const { container } = render(InfoField, { props })

		expect(container.querySelector('label')).toBeNull()
	})

	it('should render description when provided', () => {
		const props = $state({ name: 'status', value: 'active', description: 'Current state' })
		const { container } = render(InfoField, { props })

		const desc = container.querySelector('[data-description]')
		expect(desc?.textContent).toBe('Current state')
	})

	it('should not render description element when not provided', () => {
		const props = $state({ name: 'status', value: 'active' })
		const { container } = render(InfoField, { props })

		expect(container.querySelector('[data-description]')).toBeNull()
	})

	it('should set aria-label from description when provided', () => {
		const props = $state({ name: 'status', value: 'active', description: 'Current state' })
		const { container } = render(InfoField, { props })

		const field = container.querySelector('[data-field]')
		expect(field?.getAttribute('aria-label')).toBe('Current state')
	})

	it('should set aria-label from label when no description', () => {
		const props = $state({ name: 'status', value: 'active', label: 'Status' })
		const { container } = render(InfoField, { props })

		const field = container.querySelector('[data-field]')
		expect(field?.getAttribute('aria-label')).toBe('Status')
	})

	it('should set aria-label from name when no description or label', () => {
		const props = $state({ name: 'status', value: 'active' })
		const { container } = render(InfoField, { props })

		const field = container.querySelector('[data-field]')
		expect(field?.getAttribute('aria-label')).toBe('status')
	})

	it('should apply class to root element', () => {
		const props = $state({ name: 'status', value: 'active', class: 'my-class' })
		const { container } = render(InfoField, { props })

		const root = container.querySelector('[data-field-root]')
		expect(root?.classList.contains('my-class')).toBe(true)
	})
})
