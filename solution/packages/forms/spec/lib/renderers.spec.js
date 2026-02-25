import { describe, it, expect } from 'vitest'
import { defaultRenderers, resolveRenderer } from '../../src/lib/renderers.js'
import InputText from '../../src/input/InputText.svelte'
import InputNumber from '../../src/input/InputNumber.svelte'
import InputEmail from '../../src/input/InputEmail.svelte'
import InputSelect from '../../src/input/InputSelect.svelte'
import InputCheckbox from '../../src/input/InputCheckbox.svelte'

describe('defaultRenderers', () => {
	it('should map standard types to components', () => {
		expect(defaultRenderers.text).toBe(InputText)
		expect(defaultRenderers.number).toBe(InputNumber)
		expect(defaultRenderers.email).toBe(InputEmail)
		expect(defaultRenderers.select).toBe(InputSelect)
		expect(defaultRenderers.checkbox).toBe(InputCheckbox)
	})

	it('should map integer to InputNumber', () => {
		expect(defaultRenderers.integer).toBe(InputNumber)
	})

	it('should include all expected types', () => {
		const expectedTypes = [
			'text',
			'number',
			'integer',
			'email',
			'password',
			'tel',
			'url',
			'color',
			'date',
			'datetime-local',
			'datetime',
			'time',
			'month',
			'week',
			'range',
			'textarea',
			'file',
			'checkbox',
			'radio',
			'select',
			'switch'
		]
		for (const type of expectedTypes) {
			expect(defaultRenderers[type], `missing renderer for '${type}'`).toBeDefined()
		}
	})
})

describe('resolveRenderer', () => {
	it('should resolve by element type', () => {
		const result = resolveRenderer({ type: 'email' }, defaultRenderers)
		expect(result).toBe(InputEmail)
	})

	it('should resolve explicit renderer name over type', () => {
		const customComponent = () => {}
		const renderers = { ...defaultRenderers, 'custom-rating': customComponent }
		const result = resolveRenderer(
			{ type: 'text', props: { renderer: 'custom-rating' } },
			renderers
		)
		expect(result).toBe(customComponent)
	})

	it('should fall back to InputText for unknown type', () => {
		const result = resolveRenderer({ type: 'nonexistent' }, defaultRenderers)
		expect(result).toBe(InputText)
	})

	it('should fall back to InputText when renderer name not found', () => {
		const result = resolveRenderer(
			{ type: 'nonexistent', props: { renderer: 'also-missing' } },
			defaultRenderers
		)
		expect(result).toBe(InputText)
	})

	it('should handle element with no props', () => {
		const result = resolveRenderer({ type: 'number' }, defaultRenderers)
		expect(result).toBe(InputNumber)
	})

	it('should use custom renderers merged with defaults', () => {
		const CustomInput = () => {}
		const merged = { ...defaultRenderers, 'my-widget': CustomInput }
		const result = resolveRenderer({ type: 'my-widget' }, merged)
		expect(result).toBe(CustomInput)
	})

	it('should allow overriding a default type', () => {
		const CustomText = () => {}
		const merged = { ...defaultRenderers, text: CustomText }
		const result = resolveRenderer({ type: 'text' }, merged)
		expect(result).toBe(CustomText)
	})
})
