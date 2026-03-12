import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import UploadTarget from '../src/components/UploadTarget.svelte'

describe('UploadTarget', () => {
	it('renders a container with data-upload-target', () => {
		const { container } = render(UploadTarget)
		expect(container.querySelector('[data-upload-target]')).toBeTruthy()
	})

	it('renders a hidden file input', () => {
		const { container } = render(UploadTarget)
		const input = container.querySelector('input[type="file"]') as HTMLInputElement
		expect(input).toBeTruthy()
		expect(input.hidden).toBe(true)
	})

	it('sets accept and multiple on the input', () => {
		const { container } = render(UploadTarget, { accept: 'image/*', multiple: true })
		const input = container.querySelector('input[type="file"]') as HTMLInputElement
		expect(input.getAttribute('accept')).toBe('image/*')
		expect(input.multiple).toBe(true)
	})

	it('sets data-disabled when disabled', () => {
		const { container } = render(UploadTarget, { disabled: true })
		expect(
			container.querySelector('[data-upload-target]')!.hasAttribute('data-disabled')
		).toBe(true)
	})

	it('has role="button" and tabindex', () => {
		const { container } = render(UploadTarget)
		const zone = container.querySelector('[data-upload-target]')!
		expect(zone.getAttribute('role')).toBe('button')
		expect(zone.getAttribute('tabindex')).toBe('0')
	})

	it('fires onfiles with valid files from input change', async () => {
		const onfiles = vi.fn()
		const { container } = render(UploadTarget, { onfiles, accept: '' })
		const input = container.querySelector('input[type="file"]')!
		const file = new File(['content'], 'test.txt', { type: 'text/plain' })
		Object.defineProperty(input, 'files', { value: [file] })
		await fireEvent.change(input)
		expect(onfiles).toHaveBeenCalledWith([file])
	})

	it('fires onerror for files that fail type validation', async () => {
		const onfiles = vi.fn()
		const onerror = vi.fn()
		const { container } = render(UploadTarget, { onfiles, onerror, accept: 'image/*' })
		const input = container.querySelector('input[type="file"]')!
		const file = new File(['content'], 'test.txt', { type: 'text/plain' })
		Object.defineProperty(input, 'files', { value: [file] })
		await fireEvent.change(input)
		expect(onerror).toHaveBeenCalledWith({ file, reason: 'type' })
		expect(onfiles).not.toHaveBeenCalled()
	})

	it('fires onerror for files that fail size validation', async () => {
		const onerror = vi.fn()
		const { container } = render(UploadTarget, { onerror, maxSize: 5 })
		const input = container.querySelector('input[type="file"]')!
		const file = new File(['a'.repeat(100)], 'big.txt', { type: 'text/plain' })
		Object.defineProperty(input, 'files', { value: [file] })
		await fireEvent.change(input)
		expect(onerror).toHaveBeenCalledWith({ file, reason: 'size' })
	})

	it('sets aria-disabled when disabled', () => {
		const { container } = render(UploadTarget, { disabled: true })
		const zone = container.querySelector('[data-upload-target]')!
		expect(zone.getAttribute('aria-disabled')).toBe('true')
	})

	it('does not set data-disabled when enabled', () => {
		const { container } = render(UploadTarget)
		expect(
			container.querySelector('[data-upload-target]')!.hasAttribute('data-disabled')
		).toBe(false)
	})
})
