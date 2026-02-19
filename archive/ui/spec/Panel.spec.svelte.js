import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import Panel from '../src/Panel.svelte'

describe('Panel.svelte', () => {
	beforeEach(() => cleanup())

	it('should render with body content only', async () => {
		const { container } = render(Panel, {
			props: {}
		})
		expect(container.querySelector('[data-panel]')).toBeTruthy()
		expect(container.querySelector('[data-panel-body]')).toBeTruthy()
		expect(container.querySelector('[data-panel-header]')).toBeFalsy()
		expect(container.querySelector('[data-panel-footer]')).toBeFalsy()
	})

	it('should render with header snippet', async () => {
		const { container } = render(Panel, {
			props: {
				header: () => {
					const el = document.createElement('span')
					el.textContent = 'Header Content'
					return el
				}
			}
		})
		expect(container.querySelector('[data-panel-header]')).toBeTruthy()
	})

	it('should render with footer snippet', async () => {
		const { container } = render(Panel, {
			props: {
				footer: () => {
					const el = document.createElement('span')
					el.textContent = 'Footer Content'
					return el
				}
			}
		})
		expect(container.querySelector('[data-panel-footer]')).toBeTruthy()
	})

	it('should apply custom class', async () => {
		const { container } = render(Panel, {
			props: {
				class: 'custom-panel'
			}
		})
		const panel = container.querySelector('[data-panel]')
		expect(panel.classList.contains('custom-panel')).toBe(true)
	})

	it('should render all sections', async () => {
		const { container } = render(Panel, {
			props: {
				header: () => document.createElement('div'),
				body: () => document.createElement('div'),
				footer: () => document.createElement('div')
			}
		})
		expect(container.querySelector('[data-panel-header]')).toBeTruthy()
		expect(container.querySelector('[data-panel-body]')).toBeTruthy()
		expect(container.querySelector('[data-panel-footer]')).toBeTruthy()
	})
})
