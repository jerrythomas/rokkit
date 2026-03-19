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
		const id = alerts.push({ type: 'warning', text: 'Warn', dismissible: true, timeout: 0 })
		flushSync()
		expect(document.querySelectorAll('[data-message-root]')).toHaveLength(1)
		// Trigger the dismiss animation via the component's ondismiss handler
		const dismissBtn = document.querySelector('[data-message-dismiss]') as HTMLElement
		dismissBtn.click()
		flushSync()
		// JSDOM doesn't run CSS transitions, so fire transitionend (max-height) to
		// complete the CSS-driven dismiss and remove the element from the store.
		document.querySelectorAll('[data-alert-list] > div').forEach((el) => {
			el.dispatchEvent(new TransitionEvent('transitionend', { propertyName: 'max-height', bubbles: true }))
		})
		flushSync()
		expect(document.querySelectorAll('[data-message-root]')).toHaveLength(0)
		// Verify it was actually removed from the store too
		expect(alerts.current.find((a) => a.id === id)).toBeUndefined()
	})
})
