import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import StatusList from '../src/components/StatusList.svelte'

const items = [
	{ text: 'This check passed', status: 'pass' },
	{ text: 'This check failed', status: 'fail' },
	{ text: 'This check is unknown', status: 'unknown' },
	{ text: 'This check is warning', status: 'warn' }
]

describe('StatusList', () => {
	beforeEach(() => cleanup())

	it('should render all items', () => {
		const { container } = render(StatusList, { props: { items } })
		const root = container.querySelector('[data-status-list]')
		expect(root).toBeTruthy()
		expect(root!.getAttribute('role')).toBe('status')
		const rendered = container.querySelectorAll('[data-status-item]')
		expect(rendered).toHaveLength(4)
	})

	it('should set data-status attribute on each item', () => {
		const { container } = render(StatusList, { props: { items } })
		const rendered = container.querySelectorAll('[data-status-item]')
		expect(rendered[0].getAttribute('data-status')).toBe('pass')
		expect(rendered[1].getAttribute('data-status')).toBe('fail')
		expect(rendered[2].getAttribute('data-status')).toBe('unknown')
		expect(rendered[3].getAttribute('data-status')).toBe('warn')
	})

	it('should render item text', () => {
		const { container } = render(StatusList, { props: { items: [items[0]] } })
		const item = container.querySelector('[data-status-item]')
		expect(item!.textContent).toContain('This check passed')
	})

	it('should apply custom class', async () => {
		const props = $state({ items, class: 'custom' })
		const { container } = render(StatusList, { props })
		const root = container.querySelector('[data-status-list]')
		expect(root!.classList.contains('custom')).toBe(true)
		props.class = 'other'
		await tick()
		expect(root!.classList.contains('custom')).toBe(false)
		expect(root!.classList.contains('other')).toBe(true)
	})

	it('should use default icons when none provided', () => {
		const { container } = render(StatusList, { props: { items: [items[0]] } })
		// Icon component renders — just verify item renders without error
		expect(container.querySelector('[data-status-item]')).toBeTruthy()
	})

	it('should accept custom icon overrides', () => {
		const icons = {
			pass: 'custom-pass',
			fail: 'custom-fail',
			warn: 'custom-warn',
			unknown: 'custom-unknown'
		}
		const { container } = render(StatusList, { props: { items, icons } })
		expect(container.querySelector('[data-status-list]')).toBeTruthy()
	})
})
