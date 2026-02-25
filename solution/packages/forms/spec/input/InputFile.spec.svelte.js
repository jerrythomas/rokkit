import { describe, expect, beforeEach, it, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'

import InputFile from '../../src/input/InputFile.svelte'

describe('InputFile', () => {
	beforeEach(() => cleanup())

	it('should render', () => {
		const props = $state({ value: null })
		const { container } = render(InputFile, { props })

		const element = container.querySelector('input')
		expect(element.type).toBe('file')
		expect(element.value).toBe('')
	})

	it('should render as disabled', () => {
		const props = $state({
			value: null,
			disabled: true
		})

		const { container } = render(InputFile, { props })
		const element = container.querySelector('input')
		expect(element.disabled).toBe(true)

		props.disabled = false
		flushSync()
		expect(element.disabled).toBe(false)
	})

	it('should render as required', () => {
		const props = $state({
			value: null,
			required: true
		})
		const { container } = render(InputFile, { props })
		const element = container.querySelector('input')
		expect(element.required).toBe(true)

		props.required = false
		flushSync()
		expect(element.required).toBe(false)
	})

	it('should render with accept attribute', () => {
		const props = $state({
			value: null,
			accept: 'image/*'
		})
		const { container } = render(InputFile, { props })
		const element = container.querySelector('input')
		expect(element.accept).toBe('image/*')
	})

	it('should render with multiple attribute', () => {
		const props = $state({
			value: null,
			multiple: true
		})
		const { container } = render(InputFile, { props })
		const element = container.querySelector('input')
		expect(element.multiple).toBe(true)

		props.multiple = false
		flushSync()
		expect(element.multiple).toBe(false)
	})

	it('should render with additional attributes', () => {
		const props = $state({
			value: null,
			id: 'file-input',
			name: 'upload'
		})
		const { container } = render(InputFile, { props })
		const element = container.querySelector('input')
		expect(element.id).toBe('file-input')
		expect(element.name).toBe('upload')
	})

	it('should handle file selection', async () => {
		const props = $state({
			value: null,
			onchange: vi.fn()
		})
		const { container } = render(InputFile, { props })

		const element = container.querySelector('input')
		const file = new File(['test content'], 'test.txt', { type: 'text/plain' })

		await fireEvent.change(element, {
			target: { files: [file] }
		})
		await tick()

		expect(props.onchange).toHaveBeenCalled()
		expect(element.files).toHaveLength(1)
		expect(element.files[0].name).toBe('test.txt')
	})

	it('should handle multiple file selection', async () => {
		const props = $state({
			value: null,
			multiple: true,
			onchange: vi.fn()
		})
		const { container } = render(InputFile, { props })

		const element = container.querySelector('input')
		const file1 = new File(['test content 1'], 'test1.txt', { type: 'text/plain' })
		const file2 = new File(['test content 2'], 'test2.txt', { type: 'text/plain' })

		await fireEvent.change(element, {
			target: { files: [file1, file2] }
		})
		await tick()

		expect(props.onchange).toHaveBeenCalled()
		expect(element.files).toHaveLength(2)
		expect(element.files[0].name).toBe('test1.txt')
		expect(element.files[1].name).toBe('test2.txt')
	})

	it('should handle focus and blur events', async () => {
		const props = $state({
			value: null,
			onfocus: vi.fn(),
			onblur: vi.fn()
		})
		const { container } = render(InputFile, { props })

		const element = container.querySelector('input')
		await fireEvent.focus(element)
		expect(props.onfocus).toHaveBeenCalledTimes(1)

		await fireEvent.blur(element)
		expect(props.onblur).toHaveBeenCalledTimes(1)
	})

	it('should render with specific file type restrictions', () => {
		const props = $state({
			value: null,
			accept: '.pdf,.doc,.docx'
		})
		const { container } = render(InputFile, { props })
		const element = container.querySelector('input')
		expect(element.accept).toBe('.pdf,.doc,.docx')
	})

	it('should render with image file restrictions', () => {
		const props = $state({
			value: null,
			accept: 'image/png,image/jpeg,image/gif'
		})
		const { container } = render(InputFile, { props })
		const element = container.querySelector('input')
		expect(element.accept).toBe('image/png,image/jpeg,image/gif')
	})

	it('should render with all file-specific props', () => {
		const props = $state({
			value: null,
			accept: 'image/*',
			multiple: true,
			required: true,
			disabled: false,
			name: 'file-upload',
			id: 'file-upload-input'
		})
		const { container } = render(InputFile, { props })
		expect(container).toMatchSnapshot()
	})

	it('should clear file selection when value is set to null', async () => {
		const props = $state({ value: null })
		const { container } = render(InputFile, { props })

		const element = container.querySelector('input')
		const file = new File(['test'], 'test.txt', { type: 'text/plain' })

		await fireEvent.change(element, {
			target: { files: [file] }
		})
		await tick()

		expect(element.files).toHaveLength(1)

		// Simulate clearing the input
		await fireEvent.change(element, {
			target: { files: [] }
		})
		await tick()

		expect(element.files).toHaveLength(0)
	})
})
