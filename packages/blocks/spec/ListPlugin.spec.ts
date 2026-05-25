import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import ListPlugin from '../src/ListPlugin.svelte'

const flatSpec = JSON.stringify({
	items: [{ label: 'Profile' }, { label: 'Account' }, { label: 'Notifications' }]
})

const groupedSpec = JSON.stringify({
	items: [
		{ label: 'General', children: [{ label: 'Profile' }] },
		{ label: 'Appearance', children: [{ label: 'Theme' }] }
	],
	collapsible: true
})

describe('ListPlugin', () => {
	it('renders the rokkit List for a flat items array', () => {
		const { container } = render(ListPlugin, { props: { code: flatSpec } })
		expect(container.querySelector('[data-list-plugin]')).toBeTruthy()
	})

	it('renders an error block when items is missing', () => {
		const { container } = render(ListPlugin, { props: { code: '{}' } })
		expect(container.querySelector('[data-block-error]')).toBeTruthy()
	})

	it('renders an error block for invalid JSON', () => {
		const { container } = render(ListPlugin, { props: { code: '{bad' } })
		expect(container.querySelector('[data-block-error]')).toBeTruthy()
	})

	it('renders a collapsible grouped list', () => {
		const { container } = render(ListPlugin, { props: { code: groupedSpec } })
		expect(container.querySelector('[data-list-plugin]')).toBeTruthy()
	})

	it('toggles to raw spec when the code button is clicked', async () => {
		const { container } = render(ListPlugin, { props: { code: flatSpec } })
		const toggle = container.querySelector('[data-list-code-toggle]')!
		await fireEvent.click(toggle)
		expect(container.querySelector('[data-list-code]')).toBeTruthy()
	})
})
