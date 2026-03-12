import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import UploadFileStatus from '../src/components/UploadFileStatus.svelte'
import { ProxyItem } from '@rokkit/states'

function makeProxy(data: Record<string, unknown>, fields: Record<string, string> = {}) {
	const merged = {
		label: 'label',
		value: 'value',
		icon: 'icon',
		type: 'type',
		size: 'size',
		status: 'status',
		progress: 'progress',
		error: 'error',
		...fields
	}
	return new ProxyItem(data, merged)
}

describe('UploadFileStatus', () => {
	it('renders a root element with data-upload-file-status', () => {
		const proxy = makeProxy({
			label: 'photo.jpg',
			status: 'uploading',
			size: 1024,
			type: 'image/jpeg',
			progress: 45
		})
		const { container } = render(UploadFileStatus, { proxy })
		expect(container.querySelector('[data-upload-file-status]')).toBeTruthy()
	})

	it('renders file name from proxy.label', () => {
		const proxy = makeProxy({
			label: 'doc.pdf',
			status: 'done',
			size: 2048,
			type: 'application/pdf',
			progress: 100
		})
		const { container } = render(UploadFileStatus, { proxy })
		expect(container.textContent).toContain('doc.pdf')
	})

	it('renders formatted file size', () => {
		const proxy = makeProxy({
			label: 'f.txt',
			status: 'pending',
			size: 1024,
			type: 'text/plain',
			progress: 0
		})
		const { container } = render(UploadFileStatus, { proxy })
		expect(container.textContent).toContain('1.0 KB')
	})

	it('renders status text as-is when no label mapping', () => {
		const proxy = makeProxy({
			label: 'f.txt',
			status: 'extracting',
			size: 100,
			type: 'text/plain',
			progress: 0
		})
		const { container } = render(UploadFileStatus, { proxy })
		expect(container.querySelector('[data-upload-status]')?.textContent).toBe('extracting')
	})

	it('renders mapped status label when provided', () => {
		const proxy = makeProxy({
			label: 'f.txt',
			status: 'extracting',
			size: 100,
			type: 'text/plain',
			progress: 0
		})
		const { container } = render(UploadFileStatus, {
			proxy,
			labels: { extracting: 'Extracting text…' }
		})
		expect(container.querySelector('[data-upload-status]')?.textContent).toBe('Extracting text…')
	})

	it('renders progress bar when 0 < progress < 100', () => {
		const proxy = makeProxy({
			label: 'f.txt',
			status: 'uploading',
			size: 100,
			type: 'text/plain',
			progress: 45
		})
		const { container } = render(UploadFileStatus, { proxy })
		const fill = container.querySelector('[data-upload-fill]') as HTMLElement
		expect(fill).toBeTruthy()
		expect(fill.style.width).toBe('45%')
	})

	it('does not render progress bar when progress is 0', () => {
		const proxy = makeProxy({
			label: 'f.txt',
			status: 'pending',
			size: 100,
			type: 'text/plain',
			progress: 0
		})
		const { container } = render(UploadFileStatus, { proxy })
		expect(container.querySelector('[data-upload-bar]')).toBeFalsy()
	})

	it('does not render progress bar when progress is 100', () => {
		const proxy = makeProxy({
			label: 'f.txt',
			status: 'done',
			size: 100,
			type: 'text/plain',
			progress: 100
		})
		const { container } = render(UploadFileStatus, { proxy })
		expect(container.querySelector('[data-upload-bar]')).toBeFalsy()
	})

	it('renders cancel button when status is in cancelWhen and oncancel provided', () => {
		const oncancel = vi.fn()
		const proxy = makeProxy({
			label: 'f.txt',
			status: 'uploading',
			size: 100,
			type: 'text/plain',
			progress: 30
		})
		const { container } = render(UploadFileStatus, {
			proxy,
			cancelWhen: ['uploading', 'queued'],
			oncancel
		})
		const btn = container.querySelector('[data-upload-cancel]')
		expect(btn).toBeTruthy()
	})

	it('does not render cancel button when status not in cancelWhen', () => {
		const oncancel = vi.fn()
		const proxy = makeProxy({
			label: 'f.txt',
			status: 'done',
			size: 100,
			type: 'text/plain',
			progress: 100
		})
		const { container } = render(UploadFileStatus, {
			proxy,
			cancelWhen: ['uploading'],
			oncancel
		})
		expect(container.querySelector('[data-upload-cancel]')).toBeFalsy()
	})

	it('fires oncancel with proxy when cancel clicked', async () => {
		const oncancel = vi.fn()
		const proxy = makeProxy({
			label: 'f.txt',
			status: 'uploading',
			size: 100,
			type: 'text/plain',
			progress: 30
		})
		const { container } = render(UploadFileStatus, {
			proxy,
			cancelWhen: ['uploading'],
			oncancel
		})
		await fireEvent.click(container.querySelector('[data-upload-cancel]')!)
		expect(oncancel).toHaveBeenCalledWith(proxy)
	})

	it('renders retry button when status is in retryWhen and onretry provided', () => {
		const onretry = vi.fn()
		const proxy = makeProxy({
			label: 'f.txt',
			status: 'failed',
			size: 100,
			type: 'text/plain',
			progress: 0
		})
		const { container } = render(UploadFileStatus, {
			proxy,
			retryWhen: ['failed'],
			onretry
		})
		expect(container.querySelector('[data-upload-retry]')).toBeTruthy()
	})

	it('fires onretry with proxy when retry clicked', async () => {
		const onretry = vi.fn()
		const proxy = makeProxy({
			label: 'f.txt',
			status: 'failed',
			size: 100,
			type: 'text/plain',
			progress: 0
		})
		const { container } = render(UploadFileStatus, {
			proxy,
			retryWhen: ['failed'],
			onretry
		})
		await fireEvent.click(container.querySelector('[data-upload-retry]')!)
		expect(onretry).toHaveBeenCalledWith(proxy)
	})

	it('renders remove button when status is in removeWhen and onremove provided', () => {
		const onremove = vi.fn()
		const proxy = makeProxy({
			label: 'f.txt',
			status: 'done',
			size: 100,
			type: 'text/plain',
			progress: 100
		})
		const { container } = render(UploadFileStatus, {
			proxy,
			removeWhen: ['done', 'failed'],
			onremove
		})
		expect(container.querySelector('[data-upload-remove]')).toBeTruthy()
	})

	it('renders file icon inferred from MIME type', () => {
		const proxy = makeProxy({
			label: 'photo.jpg',
			status: 'done',
			size: 100,
			type: 'image/jpeg',
			progress: 100
		})
		const { container } = render(UploadFileStatus, { proxy })
		const icon = container.querySelector('[data-upload-file-icon]')
		expect(icon?.classList.contains('i-lucide:image')).toBe(true)
	})

	it('uses semantic icon classes for action buttons', () => {
		const oncancel = vi.fn()
		const onretry = vi.fn()
		const onremove = vi.fn()
		const proxy = makeProxy({
			label: 'f.txt',
			status: 'failed',
			size: 100,
			type: 'text/plain',
			progress: 0
		})
		const { container } = render(UploadFileStatus, {
			proxy,
			cancelWhen: ['failed'],
			oncancel,
			retryWhen: ['failed'],
			onretry,
			removeWhen: ['failed'],
			onremove
		})
		expect(container.querySelector('[data-upload-cancel] span[aria-hidden]')).toBeTruthy()
		expect(container.querySelector('[data-upload-retry] span[aria-hidden]')).toBeTruthy()
		expect(container.querySelector('[data-upload-remove] span[aria-hidden]')).toBeTruthy()
	})

	it('sets data-status on root from proxy status', () => {
		const proxy = makeProxy({
			label: 'f.txt',
			status: 'chunking',
			size: 100,
			type: 'text/plain',
			progress: 50
		})
		const { container } = render(UploadFileStatus, { proxy })
		expect(container.querySelector('[data-upload-file-status]')?.getAttribute('data-status')).toBe(
			'chunking'
		)
	})
})
