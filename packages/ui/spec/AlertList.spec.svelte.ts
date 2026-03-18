import { describe, expect, beforeEach, afterEach, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import { alerts } from '@rokkit/states'
import AlertList from '../src/components/AlertList.svelte'

describe('AlertList', () => {
	beforeEach(() => cleanup())
	afterEach(() => {
		alerts.clear()
		// Clean up any portalled elements left on body
		document.querySelectorAll('[data-alert-list]').forEach((el) => el.remove())
	})

	it('renders the alert list container on document.body (portal)', () => {
		render(AlertList)
		flushSync()
		expect(document.querySelector('[data-alert-list]')).toBeTruthy()
	})

	it('defaults to top-right position', () => {
		render(AlertList)
		flushSync()
		expect(document.querySelector('[data-alert-list]')!.getAttribute('data-position')).toBe(
			'top-right'
		)
	})

	it('respects the position prop', () => {
		render(AlertList, { props: { position: 'bottom-left' } })
		flushSync()
		expect(document.querySelector('[data-alert-list]')!.getAttribute('data-position')).toBe(
			'bottom-left'
		)
	})

	it('renders alerts from the store', () => {
		render(AlertList)
		alerts.push({ type: 'info', text: 'Hello' })
		flushSync()
		expect(document.querySelectorAll('[data-message-root]')).toHaveLength(1)
	})

	it('renders multiple alerts', () => {
		render(AlertList)
		alerts.push({ type: 'error', text: 'A' })
		alerts.push({ type: 'success', text: 'B' })
		flushSync()
		expect(document.querySelectorAll('[data-message-root]')).toHaveLength(2)
	})

	it('removes alert from DOM when dismissed', () => {
		render(AlertList)
		const id = alerts.push({ type: 'warning', text: 'Warn', dismissible: true })
		flushSync()
		expect(document.querySelectorAll('[data-message-root]')).toHaveLength(1)
		alerts.dismiss(id)
		flushSync()
		expect(document.querySelectorAll('[data-message-root]')).toHaveLength(0)
	})
})
