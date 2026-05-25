import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import FormPlugin from '../src/FormPlugin.svelte'

const validSpec = JSON.stringify({
	schema: {
		type: 'object',
		properties: {
			name: { type: 'string' },
			active: { type: 'boolean' }
		}
	},
	data: { name: 'Jerry', active: true }
})

const submitSpec = JSON.stringify({
	schema: {
		type: 'object',
		properties: { priority: { type: 'string', enum: ['low', 'med', 'high'] } }
	},
	data: { priority: 'med' },
	submitAction: 'file_ticket',
	submitLabel: 'File ticket'
})

describe('FormPlugin', () => {
	it('renders the form plugin root for a valid spec', () => {
		const { container } = render(FormPlugin, { props: { code: validSpec } })
		expect(container.querySelector('[data-form-plugin]')).toBeTruthy()
		expect(container.querySelector('[data-block-error]')).toBeFalsy()
	})

	it('renders an error block for invalid JSON', () => {
		const { container } = render(FormPlugin, { props: { code: '{bad' } })
		expect(container.querySelector('[data-block-error]')).toBeTruthy()
	})

	it('renders an error block when schema is missing', () => {
		const { container } = render(FormPlugin, { props: { code: '{"data":{}}' } })
		expect(container.querySelector('[data-block-error]')).toBeTruthy()
	})

	it('toggles to raw spec when the code button is clicked', async () => {
		const { container } = render(FormPlugin, { props: { code: validSpec } })
		const toggle = container.querySelector('[data-form-code-toggle]')!
		await fireEvent.click(toggle)
		expect(container.querySelector('[data-form-code]')).toBeTruthy()
	})

	it('renders a submit button when submitAction is set', () => {
		const { container } = render(FormPlugin, { props: { code: submitSpec } })
		const btn = container.querySelector('[data-form-submit]') as HTMLButtonElement | null
		expect(btn).toBeTruthy()
		expect(btn?.textContent?.trim()).toBe('File ticket')
	})

	it('dispatches block-action with the captured payload on submit', async () => {
		const { container } = render(FormPlugin, { props: { code: submitSpec } })
		const root = container.querySelector('[data-form-plugin]')!
		const handler = vi.fn()
		root.addEventListener('block-action', handler as EventListener)
		const btn = container.querySelector('[data-form-submit]')!
		await fireEvent.click(btn)
		expect(handler).toHaveBeenCalledTimes(1)
		const evt = handler.mock.calls[0][0] as CustomEvent
		expect(evt.detail.name).toBe('file_ticket')
		expect(evt.detail.payload.priority).toBe('med')
	})

	it('disables the submit button after submission', async () => {
		const { container } = render(FormPlugin, { props: { code: submitSpec } })
		const btn = container.querySelector('[data-form-submit]') as HTMLButtonElement
		await fireEvent.click(btn)
		expect(btn.disabled).toBe(true)
		expect(btn.textContent).toContain('Submitted')
	})

	it('accepts a lookups field with url + source patterns', () => {
		const spec = JSON.stringify({
			schema: {
				type: 'object',
				properties: { country: { type: 'string' }, city: { type: 'string' } }
			},
			data: { country: 'FR', city: '' },
			lookups: {
				country: { source: [{ value: 'FR', label: 'France' }] },
				city: { url: '/api/cities?country={country}', dependsOn: ['country'] }
			}
		})
		const { container } = render(FormPlugin, { props: { code: spec } })
		expect(container.querySelector('[data-form-plugin]')).toBeTruthy()
		expect(container.querySelector('[data-block-error]')).toBeFalsy()
	})
})
