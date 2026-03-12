import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { tick, flushSync } from 'svelte'
import FormRenderer from '../src/FormRenderer.svelte'
import { clearLookupCache } from '../src/lib/lookup.svelte.js'

describe('FormRenderer — group rendering', () => {
	beforeEach(() => cleanup())

	const addressSchema = {
		type: 'object',
		properties: {
			name: { type: 'string' },
			address: {
				type: 'object',
				properties: {
					street: { type: 'string' },
					city: { type: 'string' }
				}
			}
		}
	}

	const addressLayout = {
		type: 'vertical',
		elements: [
			{ label: 'Name', scope: '#/name' },
			{
				scope: '#/address',
				label: 'Address',
				elements: [
					{ scope: '#/address/street', label: 'Street' },
					{ scope: '#/address/city', label: 'City' }
				]
			}
		]
	}

	it('should render a fieldset with data-form-group for group elements', () => {
		const props = $state({
			data: { name: 'Alice', address: { street: '123 Main', city: 'Springfield' } },
			schema: addressSchema,
			layout: addressLayout
		})
		const { container } = render(FormRenderer, { props })

		const group = container.querySelector('[data-form-group]')
		expect(group).toBeTruthy()
		expect(group.tagName).toBe('FIELDSET')
		expect(group.getAttribute('data-scope')).toBe('#/address')
	})

	it('should render group label as legend', () => {
		const props = $state({
			data: { name: 'Alice', address: { street: '123 Main', city: 'Springfield' } },
			schema: addressSchema,
			layout: addressLayout
		})
		const { container } = render(FormRenderer, { props })

		const legend = container.querySelector('[data-form-group-label]')
		expect(legend).toBeTruthy()
		expect(legend.tagName).toBe('LEGEND')
		expect(legend.textContent).toBe('Address')
	})

	it('should not render legend when group has no label', () => {
		const layoutNoLabel = {
			type: 'vertical',
			elements: [
				{
					scope: '#/address',
					elements: [
						{ scope: '#/address/street', label: 'Street' },
						{ scope: '#/address/city', label: 'City' }
					]
				}
			]
		}
		const props = $state({
			data: { address: { street: '123 Main', city: 'Springfield' } },
			schema: addressSchema,
			layout: layoutNoLabel
		})
		const { container } = render(FormRenderer, { props })

		const group = container.querySelector('[data-form-group]')
		expect(group).toBeTruthy()
		expect(container.querySelector('[data-form-group-label]')).toBeNull()
	})

	it('should render child input fields inside group', () => {
		const props = $state({
			data: { name: 'Alice', address: { street: '123 Main', city: 'Springfield' } },
			schema: addressSchema,
			layout: addressLayout
		})
		const { container } = render(FormRenderer, { props })

		const group = container.querySelector('[data-form-group]')
		const fields = group.querySelectorAll('[data-form-field]')
		expect(fields).toHaveLength(2)

		// Check scopes of child fields
		expect(fields[0].getAttribute('data-scope')).toBe('#/address/street')
		expect(fields[1].getAttribute('data-scope')).toBe('#/address/city')
	})

	it('should render flat fields alongside group', () => {
		const props = $state({
			data: { name: 'Alice', address: { street: '123 Main', city: 'Springfield' } },
			schema: addressSchema,
			layout: addressLayout
		})
		const { container } = render(FormRenderer, { props })

		// One flat field + one group
		const root = container.querySelector('[data-form-root]')
		const topFields = root.querySelectorAll(':scope > [data-form-field]')
		const topGroups = root.querySelectorAll(':scope > [data-form-group]')
		expect(topFields).toHaveLength(1)
		expect(topGroups).toHaveLength(1)
	})

	it('should update nested field value on change', async () => {
		const props = $state({
			data: { name: 'Alice', address: { street: '123 Main', city: 'Springfield' } },
			schema: addressSchema,
			layout: addressLayout
		})
		const { container } = render(FormRenderer, { props })

		// Find the street input inside the group
		const group = container.querySelector('[data-form-group]')
		const streetInput = group.querySelector('input')
		expect(streetInput).toBeTruthy()

		// Change the value via native change event (InputText uses onchange handler)
		streetInput.value = '456 Oak Ave'
		await fireEvent.change(streetInput)

		// Data should be updated
		expect(props.data.address.street).toBe('456 Oak Ave')
	})

	it('should render deeply nested groups (group rendering)', () => {
		const deepSchema = {
			type: 'object',
			properties: {
				person: {
					type: 'object',
					properties: {
						name: { type: 'string' },
						address: {
							type: 'object',
							properties: {
								city: { type: 'string' }
							}
						}
					}
				}
			}
		}
		const deepLayout = {
			type: 'vertical',
			elements: [
				{
					scope: '#/person',
					label: 'Person',
					elements: [
						{ scope: '#/person/name', label: 'Name' },
						{
							scope: '#/person/address',
							label: 'Address',
							elements: [{ scope: '#/person/address/city', label: 'City' }]
						}
					]
				}
			]
		}
		const props = $state({
			data: { person: { name: 'Alice', address: { city: 'Springfield' } } },
			schema: deepSchema,
			layout: deepLayout
		})
		const { container } = render(FormRenderer, { props })

		// Outer group
		const outerGroup = container.querySelector('[data-form-group]')
		expect(outerGroup).toBeTruthy()
		expect(outerGroup.getAttribute('data-scope')).toBe('#/person')

		// Inner group nested inside outer
		const innerGroup = outerGroup.querySelector('[data-form-group]')
		expect(innerGroup).toBeTruthy()
		expect(innerGroup.getAttribute('data-scope')).toBe('#/person/address')

		// Inner group has one field
		const innerFields = innerGroup.querySelectorAll('[data-form-field]')
		expect(innerFields).toHaveLength(1)
		expect(innerFields[0].getAttribute('data-scope')).toBe('#/person/address/city')
	})
})

describe('FormRenderer — form submission', () => {
	beforeEach(() => cleanup())

	const schema = {
		type: 'object',
		properties: {
			name: { type: 'string', required: true },
			email: { type: 'string', required: true }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/name', label: 'Name' },
			{ scope: '#/email', label: 'Email' }
		]
	}

	it('should render as <form> when onsubmit is provided', () => {
		const onsubmit = vi.fn()
		const props = $state({
			data: { name: 'Alice', email: 'alice@test.com' },
			schema,
			layout,
			onsubmit
		})
		const { container } = render(FormRenderer, { props })
		const root = container.querySelector('[data-form-root]')
		expect(root.tagName).toBe('FORM')
	})

	it('should render as <div> when onsubmit is not provided', () => {
		const props = $state({
			data: { name: 'Alice', email: 'alice@test.com' },
			schema,
			layout
		})
		const { container } = render(FormRenderer, { props })
		const root = container.querySelector('[data-form-root]')
		expect(root.tagName).toBe('DIV')
	})

	it('should render default submit and reset buttons when onsubmit provided', () => {
		const onsubmit = vi.fn()
		const props = $state({
			data: { name: 'Alice', email: 'alice@test.com' },
			schema,
			layout,
			onsubmit
		})
		const { container } = render(FormRenderer, { props })

		const submitBtn = container.querySelector('button[data-form-submit]')
		const resetBtn = container.querySelector('button[data-form-reset]')
		expect(submitBtn).toBeTruthy()
		expect(resetBtn).toBeTruthy()
		expect(submitBtn.textContent).toBe('Submit')
		expect(resetBtn.textContent).toBe('Reset')
	})

	it('should not render buttons when onsubmit is not provided', () => {
		const props = $state({
			data: { name: 'Alice', email: 'alice@test.com' },
			schema,
			layout
		})
		const { container } = render(FormRenderer, { props })

		expect(container.querySelector('[data-form-actions]')).toBeNull()
		expect(container.querySelector('button[data-form-submit]')).toBeNull()
	})

	it('should call onsubmit with data when form is valid', async () => {
		const onsubmit = vi.fn()
		const props = $state({
			data: { name: 'Alice', email: 'alice@test.com' },
			schema,
			layout,
			onsubmit
		})
		const { container } = render(FormRenderer, { props })

		const form = container.querySelector('form')
		await fireEvent.submit(form)

		expect(onsubmit).toHaveBeenCalledOnce()
		expect(onsubmit).toHaveBeenCalledWith(
			{ name: 'Alice', email: 'alice@test.com' },
			{ isValid: true, errors: [] }
		)
	})

	it('should NOT call onsubmit when validation fails', async () => {
		const onsubmit = vi.fn()
		const props = $state({
			data: { name: '', email: '' },
			schema,
			layout,
			onsubmit
		})
		const { container } = render(FormRenderer, { props })

		const form = container.querySelector('form')
		await fireEvent.submit(form)

		expect(onsubmit).not.toHaveBeenCalled()
	})

	it('should focus first error field when validation fails', async () => {
		const onsubmit = vi.fn()
		const props = $state({
			data: { name: '', email: 'alice@test.com' },
			schema,
			layout,
			onsubmit
		})
		const { container } = render(FormRenderer, { props })

		// Spy on the name input's focus method before submitting
		const nameInput = container.querySelector('[data-scope="#/name"] input')
		const focusSpy = vi.spyOn(nameInput, 'focus')

		const form = container.querySelector('form')
		await fireEvent.submit(form)

		// The first error field (name) should have focus() called
		expect(focusSpy).toHaveBeenCalled()
	})

	it('should set data-form-submitting during async submission', async () => {
		let resolveSubmit
		const onsubmit = vi.fn(
			() =>
				new Promise((resolve) => {
					resolveSubmit = resolve
				})
		)
		const props = $state({
			data: { name: 'Alice', email: 'alice@test.com' },
			schema,
			layout,
			onsubmit
		})
		const { container } = render(FormRenderer, { props })

		const form = container.querySelector('form')
		const submitPromise = fireEvent.submit(form)
		await tick()

		// During submission, attribute should be present
		expect(form.hasAttribute('data-form-submitting')).toBe(true)

		// Resolve the submission
		resolveSubmit()
		await submitPromise
		await tick()

		// After submission, attribute should be removed
		expect(form.getAttribute('data-form-submitting')).toBeNull()
	})

	it('should disable buttons during submission', async () => {
		let resolveSubmit
		const onsubmit = vi.fn(
			() =>
				new Promise((resolve) => {
					resolveSubmit = resolve
				})
		)
		const props = $state({
			data: { name: 'Alice', email: 'alice@test.com' },
			schema,
			layout,
			onsubmit
		})
		const { container } = render(FormRenderer, { props })

		// First make the form dirty by changing a field
		const nameInput = container.querySelector('[data-scope="#/name"] input')
		nameInput.value = 'Bob'
		await fireEvent.change(nameInput)

		const submitBtn = container.querySelector('button[data-form-submit]')
		const resetBtn = container.querySelector('button[data-form-reset]')

		// Buttons should be enabled (form is dirty)
		expect(submitBtn.disabled).toBe(false)
		expect(resetBtn.disabled).toBe(false)

		// Submit the form
		const form = container.querySelector('form')
		const submitPromise = fireEvent.submit(form)
		await tick()

		// During submission, buttons should be disabled
		expect(submitBtn.disabled).toBe(true)
		expect(resetBtn.disabled).toBe(true)

		resolveSubmit()
		await submitPromise
		await tick()
	})

	it('should reset form data when reset button is clicked', async () => {
		const onsubmit = vi.fn()
		const props = $state({
			data: { name: 'Alice', email: 'alice@test.com' },
			schema,
			layout,
			onsubmit
		})
		const { container } = render(FormRenderer, { props })

		// Make form dirty
		const nameInput = container.querySelector('[data-scope="#/name"] input')
		nameInput.value = 'Bob'
		await fireEvent.change(nameInput)
		expect(props.data.name).toBe('Bob')

		// Click reset
		const resetBtn = container.querySelector('button[data-form-reset]')
		await fireEvent.click(resetBtn)

		// Data should revert to original
		expect(props.data.name).toBe('Alice')
	})

	it('should call onvalidate with * path on submit', async () => {
		const onsubmit = vi.fn()
		const onvalidate = vi.fn()
		const props = $state({
			data: { name: 'Alice', email: 'alice@test.com' },
			schema,
			layout,
			onsubmit,
			onvalidate
		})
		const { container } = render(FormRenderer, { props })

		const form = container.querySelector('form')
		await fireEvent.submit(form)

		// onvalidate should be called with '*' path and 'submit' trigger
		expect(onvalidate).toHaveBeenCalledWith('*', expect.any(Object), 'submit')
	})

	it('should clear submitting state even if onsubmit throws', async () => {
		const onsubmit = vi.fn(() => Promise.reject(new Error('Server error')))
		const props = $state({
			data: { name: 'Alice', email: 'alice@test.com' },
			schema,
			layout,
			onsubmit
		})
		const { container } = render(FormRenderer, { props })

		const form = container.querySelector('form')
		await fireEvent.submit(form)
		await tick()

		// Submitting should be cleared despite error
		expect(form.getAttribute('data-form-submitting')).toBeNull()
	})
})

describe('FormRenderer — lookup integration', () => {
	beforeEach(() => {
		cleanup()
		clearLookupCache()
		vi.restoreAllMocks()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	const baseSchema = {
		type: 'object',
		properties: {
			status: { type: 'string' },
			country: { type: 'string' },
			city: { type: 'string' }
		}
	}

	it('filter hook injects options into select field', async () => {
		const schema = {
			type: 'object',
			properties: { status: { type: 'string' } }
		}
		const layout = {
			elements: [{ scope: '#/status', label: 'Status', renderer: 'select' }]
		}
		const lookups = {
			status: {
				source: ['active', 'pending', 'inactive'],
				filter: (src) => src
			}
		}
		const props = $state({ data: { status: null }, schema, layout, lookups })
		const { container } = render(FormRenderer, { props })

		// Let onMount fire and lookup initialize
		await tick()
		flushSync()

		// Open the dropdown to see options
		const trigger = container.querySelector('[data-select-trigger]')
		expect(trigger).toBeTruthy()
		await fireEvent.click(trigger)
		await tick()
		flushSync()

		const optionEls = container.querySelectorAll('[data-select-option]')
		expect(optionEls).toHaveLength(3)
	})

	it('field is disabled when lookup dependencies are not met', async () => {
		const layout = {
			elements: [
				{ scope: '#/country', label: 'Country', renderer: 'select' },
				{ scope: '#/city', label: 'City', renderer: 'select' }
			]
		}
		const lookups = {
			city: {
				dependsOn: ['country'],
				source: ['New York', 'Los Angeles', 'Paris'],
				filter: (src) => src
			}
		}
		const props = $state({
			data: { country: null, city: null },
			schema: baseSchema,
			layout,
			lookups
		})
		const { container } = render(FormRenderer, { props })

		await tick()
		flushSync()

		// City field should be disabled because country is null
		const cityFieldRoot = container.querySelector('[data-scope="#/city"] [data-field-root]')
		expect(cityFieldRoot).toBeTruthy()
		expect(cityFieldRoot.hasAttribute('data-field-disabled')).toBe(true)
	})

	it('field is not disabled when lookup dependencies are met', async () => {
		const layout = {
			elements: [
				{ scope: '#/country', label: 'Country', renderer: 'select' },
				{ scope: '#/city', label: 'City', renderer: 'select' }
			]
		}
		const lookups = {
			city: {
				dependsOn: ['country'],
				source: ['New York', 'Los Angeles', 'Paris'],
				filter: (src) => src
			}
		}
		// country is already set — city should be enabled after init
		const props = $state({
			data: { country: 'USA', city: null },
			schema: baseSchema,
			layout,
			lookups
		})
		const { container } = render(FormRenderer, { props })

		await tick()
		flushSync()

		const cityFieldRoot = container.querySelector('[data-scope="#/city"] [data-field-root]')
		expect(cityFieldRoot).toBeTruthy()
		expect(cityFieldRoot.hasAttribute('data-field-disabled')).toBe(false)
	})

	it('fetch hook calls async function and injects options', async () => {
		const schema = {
			type: 'object',
			properties: { status: { type: 'string' } }
		}
		const layout = {
			elements: [{ scope: '#/status', label: 'Status', renderer: 'select' }]
		}
		const fetchFn = vi.fn().mockResolvedValue(['active', 'pending'])
		const lookups = { status: { fetch: fetchFn } }

		const props = $state({ data: { status: null }, schema, layout, lookups })
		const { container } = render(FormRenderer, { props })

		await tick()
		flushSync()
		// Allow async fetch to complete
		await tick()
		flushSync()

		expect(fetchFn).toHaveBeenCalledOnce()

		// Open dropdown to verify options are present
		const trigger = container.querySelector('[data-select-trigger]')
		await fireEvent.click(trigger)
		await tick()
		flushSync()

		const optionEls = container.querySelectorAll('[data-select-option]')
		expect(optionEls).toHaveLength(2)
	})

	it('dependent field value is cleared when dependency changes', async () => {
		// Use text inputs to make value-change testing straightforward
		const schema = {
			type: 'object',
			properties: {
				country: { type: 'string' },
				city: { type: 'string' }
			}
		}
		const layout = {
			elements: [
				{ scope: '#/country', label: 'Country' },
				{ scope: '#/city', label: 'City' }
			]
		}
		const lookups = {
			city: {
				dependsOn: ['country'],
				source: ['New York', 'Paris'],
				filter: (src) => src
			}
		}
		const props = $state({ data: { country: 'USA', city: 'New York' }, schema, layout, lookups })
		const { container } = render(FormRenderer, { props })

		await tick()
		flushSync()

		// Verify initial state
		expect(props.data.city).toBe('New York')

		// Change country — city should be cleared automatically
		const countryInput = container.querySelector('[data-scope="#/country"] input')
		expect(countryInput).toBeTruthy()
		countryInput.value = 'France'
		await fireEvent.change(countryInput)
		flushSync()

		expect(props.data.city).toBeNull()
	})
})
