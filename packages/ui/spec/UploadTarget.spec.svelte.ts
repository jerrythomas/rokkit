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
		expect(container.querySelector('[data-upload-target]')!.hasAttribute('data-disabled')).toBe(
			true
		)
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
		expect(container.querySelector('[data-upload-target]')!.hasAttribute('data-disabled')).toBe(
			false
		)
	})

	// ─── Drag and drop ──────────────────────────────────────────────

	const makeFile = (name = 'a.txt', size = 10, type = 'text/plain') => {
		const f = new File(['x'.repeat(size)], name, { type })
		Object.defineProperty(f, 'size', { value: size })
		return f
	}

	const dropWith = (files: File[]) => ({ dataTransfer: { files } })

	it('dragover marks the zone as dragging', async () => {
		const { container } = render(UploadTarget)
		const zone = container.querySelector('[data-upload-target]')!
		await fireEvent.dragOver(zone)
		expect(zone.getAttribute('data-dragging')).toBe('true')
	})

	it('dragleave clears the dragging state', async () => {
		const { container } = render(UploadTarget)
		const zone = container.querySelector('[data-upload-target]')!
		await fireEvent.dragOver(zone)
		await fireEvent.dragLeave(zone)
		expect(zone.hasAttribute('data-dragging')).toBe(false)
	})

	it('dragover does not mark dragging when disabled', async () => {
		const { container } = render(UploadTarget, { disabled: true })
		const zone = container.querySelector('[data-upload-target]')!
		await fireEvent.dragOver(zone)
		expect(zone.hasAttribute('data-dragging')).toBe(false)
	})

	it('dropping a valid file emits onfiles and clears dragging', async () => {
		const onfiles = vi.fn()
		const { container } = render(UploadTarget, { onfiles })
		const zone = container.querySelector('[data-upload-target]')!
		await fireEvent.dragOver(zone)
		await fireEvent.drop(zone, dropWith([makeFile()]))
		expect(onfiles).toHaveBeenCalledTimes(1)
		expect(onfiles.mock.calls[0][0][0].name).toBe('a.txt')
		expect(zone.hasAttribute('data-dragging')).toBe(false)
	})

	it('dropping while disabled emits nothing', async () => {
		const onfiles = vi.fn()
		const { container } = render(UploadTarget, { disabled: true, onfiles })
		await fireEvent.drop(container.querySelector('[data-upload-target]')!, dropWith([makeFile()]))
		expect(onfiles).not.toHaveBeenCalled()
	})

	it('dropping an empty file list emits nothing', async () => {
		const onfiles = vi.fn()
		const { container } = render(UploadTarget, { onfiles })
		await fireEvent.drop(container.querySelector('[data-upload-target]')!, dropWith([]))
		expect(onfiles).not.toHaveBeenCalled()
	})

	it('dropping an oversized file reports a size error instead of emitting', async () => {
		const onfiles = vi.fn()
		const onerror = vi.fn()
		const { container } = render(UploadTarget, { maxSize: 5, onfiles, onerror })
		await fireEvent.drop(
			container.querySelector('[data-upload-target]')!,
			dropWith([makeFile('big.txt', 50)])
		)
		expect(onerror).toHaveBeenCalledWith(expect.objectContaining({ reason: 'size' }))
		expect(onfiles).not.toHaveBeenCalled()
	})

	// ─── Keyboard activation ────────────────────────────────────────

	it.each(['Enter', ' '])('%s opens the file picker', async (key) => {
		const { container } = render(UploadTarget)
		const input = container.querySelector('input[type="file"]') as HTMLInputElement
		const click = vi.spyOn(input, 'click').mockImplementation(() => {})
		await fireEvent.keyDown(container.querySelector('[data-upload-target]')!, { key })
		expect(click).toHaveBeenCalled()
	})

	it('Enter does not open the picker when disabled', async () => {
		const { container } = render(UploadTarget, { disabled: true })
		const input = container.querySelector('input[type="file"]') as HTMLInputElement
		const click = vi.spyOn(input, 'click').mockImplementation(() => {})
		await fireEvent.keyDown(container.querySelector('[data-upload-target]')!, { key: 'Enter' })
		expect(click).not.toHaveBeenCalled()
	})

	it('ignores unrelated keys', async () => {
		const { container } = render(UploadTarget)
		const input = container.querySelector('input[type="file"]') as HTMLInputElement
		const click = vi.spyOn(input, 'click').mockImplementation(() => {})
		await fireEvent.keyDown(container.querySelector('[data-upload-target]')!, { key: 'Tab' })
		expect(click).not.toHaveBeenCalled()
	})
})
