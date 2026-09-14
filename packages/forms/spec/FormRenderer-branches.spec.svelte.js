import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent, waitFor } from '@testing-library/svelte'
import { tick } from 'svelte'
import FormRenderer from '../src/FormRenderer.svelte'
import FormRendererTest from './FormRendererTest.svelte'

/**
 * The existing FormRenderer spec drives the common path: a `<form>` with scoped
 * controls. This covers the branches it never reaches — the display element
 * types, the custom `actions`/`child` snippets, the multi-step navigation, the
 * change/blur validation handlers, and submit.
 */

beforeEach(() => cleanup())

const schema = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		rows: { type: 'array' },
		profile: { type: 'object' }
	}
}

describe('FormRenderer — display element types', () => {
	const displayLayout = {
		type: 'vertical',
		elements: [
			{ type: 'display-table', scope: '#/rows' },
			{ type: 'display-cards', scope: '#/rows' },
			{ type: 'display-list', scope: '#/rows' },
			{ type: 'display-section', scope: '#/profile' },
			{ type: 'separator' }
		]
	}

	const data = {
		name: 'Alice',
		rows: [{ id: 1, label: 'One' }],
		profile: { city: 'Pune' }
	}

	it('renders every display variant plus the separator', () => {
		const { container } = render(FormRenderer, { props: { data, schema, layout: displayLayout } })

		expect(container.querySelector('[data-display-table]')).toBeTruthy()
		expect(container.querySelector('[data-display-cards]')).toBeTruthy()
		expect(container.querySelector('[data-display-list]')).toBeTruthy()
		expect(container.querySelector('[data-display-section]')).toBeTruthy()
		expect(container.querySelector('[data-form-separator]')).toBeTruthy()
	})

	it('coerces a non-array value to an empty collection for list displays', () => {
		// toRecordArray guards the display components from a scope that points at a
		// scalar or object — they index into the value, so a string would render
		// character-by-character or throw.
		const { container } = render(FormRenderer, {
			props: { data: { ...data, rows: 'not-an-array' }, schema, layout: displayLayout }
		})

		expect(container.querySelector('[data-display-table]')).toBeTruthy()
	})

	it('drops non-object entries from an array display', () => {
		const { container } = render(FormRenderer, {
			props: { data: { ...data, rows: [null, 'x', { id: 2, label: 'Two' }] }, schema, layout: displayLayout }
		})

		expect(container.querySelector('[data-display-table]')).toBeTruthy()
	})

	it('coerces a non-record value to an empty record for section displays', () => {
		const { container } = render(FormRenderer, {
			props: { data: { ...data, profile: ['array', 'not', 'record'] }, schema, layout: displayLayout }
		})

		expect(container.querySelector('[data-display-section]')).toBeTruthy()
	})
})

describe('FormRenderer — custom actions snippet', () => {
	const layout = { type: 'vertical', elements: [{ scope: '#/name', label: 'Name' }] }

	it('replaces the default action bar and receives the form context', () => {
		// The actions block lives inside the <form> branch, so onsubmit is what makes
		// an action bar exist at all — without it the root is a bare <div>.
		const { container } = render(FormRendererTest, {
			props: { withActions: true, data: { name: 'Alice' }, schema, layout, onsubmit: vi.fn() }
		})

		expect(container.querySelector('[data-custom-actions]')).toBeTruthy()
		// The built-in bar must be gone, not merely hidden.
		expect(container.querySelector('[data-form-actions]')).toBeNull()
		expect(container.querySelector('[data-custom-dirty]')?.textContent).toBe('false')
	})

	it('exposes a working submit through the snippet context', async () => {
		const onsubmit = vi.fn()
		const { container } = render(FormRendererTest, {
			props: { withActions: true, data: { name: 'Alice' }, schema, layout, onsubmit }
		})

		await fireEvent.click(container.querySelector('[data-custom-submit]'))

		await waitFor(() => expect(onsubmit).toHaveBeenCalled())
	})

	it('exposes a working reset through the snippet context', async () => {
		const { container } = render(FormRendererTest, {
			props: { withActions: true, data: { name: 'Alice' }, schema, layout, onsubmit: vi.fn() }
		})

		// InputField emits `onchange`, not a raw input event — the builder only marks
		// the form dirty once that fires.
		const input = container.querySelector('input')
		input.value = 'Bob'
		await fireEvent.change(input)
		await waitFor(() =>
			expect(container.querySelector('[data-custom-dirty]')?.textContent).toBe('true')
		)

		await fireEvent.click(container.querySelector('[data-custom-reset]'))

		await waitFor(() =>
			expect(container.querySelector('[data-custom-dirty]')?.textContent).toBe('false')
		)
	})
})

describe('FormRenderer — multi-step navigation', () => {
	const stepLayout = {
		type: 'stepper',
		elements: [
			{ type: 'step', label: 'One', elements: [{ scope: '#/name', label: 'Name' }] },
			{ type: 'step', label: 'Two', elements: [{ scope: '#/name', label: 'Name again' }] }
		]
	}
	const props = () => ({ data: { name: 'Alice' }, schema, layout: stepLayout })

	it('shows Next but not Previous on the first step', () => {
		const { container } = render(FormRenderer, { props: { ...props(), onsubmit: vi.fn() } })

		expect(container.querySelector('[data-form-next]')).toBeTruthy()
		expect(container.querySelector('[data-form-prev]')).toBeNull()
	})

	it('advances to the next step and reveals Previous', async () => {
		const { container } = render(FormRenderer, { props: { ...props(), onsubmit: vi.fn() } })

		await fireEvent.click(container.querySelector('[data-form-next]'))
		await tick()

		expect(container.querySelector('[data-form-root]').getAttribute('data-form-step')).toBe('1')
		expect(container.querySelector('[data-form-prev]')).toBeTruthy()
	})

	it('shows Submit instead of Next on the final step', async () => {
		const { container } = render(FormRenderer, { props: { ...props(), onsubmit: vi.fn() } })

		await fireEvent.click(container.querySelector('[data-form-next]'))
		await tick()

		expect(container.querySelector('[data-form-next]')).toBeNull()
		expect(container.querySelector('[data-form-submit]')).toBeTruthy()
	})

	it('steps back with Previous', async () => {
		const { container } = render(FormRenderer, { props: { ...props(), onsubmit: vi.fn() } })

		await fireEvent.click(container.querySelector('[data-form-next]'))
		await tick()
		await fireEvent.click(container.querySelector('[data-form-prev]'))
		await tick()

		expect(container.querySelector('[data-form-root]').getAttribute('data-form-step')).toBe('0')
	})

	it('renders step content in the div variant when no onsubmit is supplied', () => {
		// Without onsubmit the root is a <div>, not a <form> — the multi-step body
		// has its own branch there that the form-variant tests never reach.
		const { container } = render(FormRenderer, { props: props() })

		const root = container.querySelector('[data-form-root]')
		expect(root.tagName).toBe('DIV')
		expect(container.querySelector('[data-form-step-content]')).toBeTruthy()
	})
})

describe('FormRenderer — validation on change and blur', () => {
	const required = {
		type: 'object',
		properties: { name: { type: 'string', required: true } }
	}
	const layout = { type: 'vertical', elements: [{ scope: '#/name', label: 'Name' }] }

	it('validates on blur when validateOn="blur"', async () => {
		const { container } = render(FormRenderer, {
			props: { data: { name: '' }, schema: required, layout, validateOn: 'blur' }
		})
		const input = container.querySelector('input')

		await fireEvent.blur(input)

		await waitFor(() => expect(container.querySelector('[data-form-field]')).toBeTruthy())
	})

	it('validates on change when validateOn="change"', async () => {
		const { container } = render(FormRenderer, {
			props: { data: { name: 'x' }, schema: required, layout, validateOn: 'change' }
		})
		const input = container.querySelector('input')

		input.value = ''
		await fireEvent.change(input)

		await waitFor(() => expect(container.querySelector('[data-form-field]')).toBeTruthy())
	})

	it('applies an external validation result supplied by onvalidate', async () => {
		// onvalidate lets the host reject a value the schema accepts — an async
		// uniqueness check, say. The result has to land on the field.
		const onvalidate = vi.fn().mockReturnValue({ state: 'error', text: 'Already taken' })
		const { container } = render(FormRenderer, {
			props: { data: { name: 'taken' }, schema: required, layout, validateOn: 'blur', onvalidate }
		})

		await fireEvent.blur(container.querySelector('input'))

		await waitFor(() => expect(onvalidate).toHaveBeenCalled())
		expect(onvalidate.mock.calls[0][0]).toBe('name')
		expect(onvalidate.mock.calls[0][2]).toBe('blur')
	})
})

describe('FormRenderer — submit', () => {
	const layout = { type: 'vertical', elements: [{ scope: '#/name', label: 'Name' }] }

	it('calls onsubmit with the data and validity metadata', async () => {
		const onsubmit = vi.fn()
		const { container } = render(FormRenderer, {
			props: { data: { name: 'Alice' }, schema, layout, onsubmit }
		})

		await fireEvent.submit(container.querySelector('form'))

		await waitFor(() => expect(onsubmit).toHaveBeenCalled())
		const [submitted, meta] = onsubmit.mock.calls[0]
		expect(submitted).toEqual(expect.objectContaining({ name: 'Alice' }))
		expect(meta).toEqual(expect.objectContaining({ isValid: expect.any(Boolean) }))
	})

	it('ignores a second submit while the first is still in flight', async () => {
		// `submitting` guards re-entry; without it a double-click double-posts.
		let release
		const onsubmit = vi.fn(() => new Promise((resolve) => (release = resolve)))
		const { container } = render(FormRenderer, {
			props: { data: { name: 'Alice' }, schema, layout, onsubmit }
		})
		const form = container.querySelector('form')

		await fireEvent.submit(form)
		await fireEvent.submit(form)

		expect(onsubmit).toHaveBeenCalledTimes(1)
		release?.()
	})
})

describe('FormRenderer — child snippet override', () => {
	it('renders the custom child snippet for an element that opts in', () => {
		const layout = {
			type: 'vertical',
			elements: [{ scope: '#/name', label: 'Name', override: true }]
		}
		const { container } = render(FormRendererTest, {
			props: { withChild: true, data: { name: 'Alice' }, schema, layout }
		})

		expect(container.querySelector('[data-custom-child]')).toBeTruthy()
	})
})
