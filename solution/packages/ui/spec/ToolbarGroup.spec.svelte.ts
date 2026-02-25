import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ToolbarGroupTest from './ToolbarGroupTest.svelte'

describe('ToolbarGroup', () => {
	it('renders a toolbar-group element', () => {
		const { container } = render(ToolbarGroupTest)
		expect(container.querySelector('[data-toolbar-group]')).toBeTruthy()
	})

	it('has role="group"', () => {
		const { container } = render(ToolbarGroupTest)
		const el = container.querySelector('[data-toolbar-group]')
		expect(el?.getAttribute('role')).toBe('group')
	})

	it('sets aria-label', () => {
		const { container } = render(ToolbarGroupTest, { label: 'Text formatting' })
		const el = container.querySelector('[data-toolbar-group]')
		expect(el?.getAttribute('aria-label')).toBe('Text formatting')
	})

	it('renders children', () => {
		const { container } = render(ToolbarGroupTest)
		const children = container.querySelectorAll('[data-test-child]')
		expect(children.length).toBe(2)
	})

	it('defaults to sm gap', () => {
		const { container } = render(ToolbarGroupTest)
		const el = container.querySelector('[data-toolbar-group]')
		expect(el?.getAttribute('data-toolbar-group-gap')).toBe('sm')
	})

	it('supports custom gap', () => {
		const { container } = render(ToolbarGroupTest, { gap: 'lg' })
		const el = container.querySelector('[data-toolbar-group]')
		expect(el?.getAttribute('data-toolbar-group-gap')).toBe('lg')
	})
})
