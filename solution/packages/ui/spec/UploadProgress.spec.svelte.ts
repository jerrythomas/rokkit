import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import UploadProgress from '../src/components/UploadProgress.svelte'

const files = [
	{
		id: '1',
		text: 'photo.jpg',
		value: '1',
		size: 1024,
		type: 'image/jpeg',
		status: 'uploading',
		progress: 45,
		path: '',
	},
	{
		id: '2',
		text: 'doc.pdf',
		value: '2',
		size: 2048,
		type: 'application/pdf',
		status: 'done',
		progress: 100,
		path: '',
	},
	{
		id: '3',
		text: 'readme.md',
		value: '3',
		size: 512,
		type: 'text/plain',
		status: 'pending',
		progress: 0,
		path: '',
	},
]

describe('UploadProgress', () => {
	it('renders a container with data-upload-progress', () => {
		const { container } = render(UploadProgress, { files })
		expect(container.querySelector('[data-upload-progress]')).toBeTruthy()
	})

	it('shows file count in header', () => {
		const { container } = render(UploadProgress, { files })
		const header = container.querySelector('[data-upload-header]')
		expect(header?.textContent).toContain('3')
	})

	it('renders list view by default', () => {
		const { container } = render(UploadProgress, { files })
		expect(
			container.querySelector('[data-upload-progress]')?.getAttribute('data-upload-view')
		).toBe('list')
	})

	it('renders file items', () => {
		const { container } = render(UploadProgress, { files })
		const items = container.querySelectorAll('[data-upload-file]')
		expect(items.length).toBe(3)
	})

	it('shows progress bar for uploading files', () => {
		const { container } = render(UploadProgress, { files })
		const bars = container.querySelectorAll('[data-upload-bar]')
		expect(bars.length).toBeGreaterThan(0)
	})

	it('renders status badges', () => {
		const { container } = render(UploadProgress, { files })
		const statuses = container.querySelectorAll('[data-upload-status]')
		expect(statuses.length).toBe(3)
	})

	it('shows file name in each row', () => {
		const { container } = render(UploadProgress, { files })
		const items = container.querySelectorAll('[data-upload-file]')
		expect(items[0].textContent).toContain('photo.jpg')
		expect(items[1].textContent).toContain('doc.pdf')
	})

	it('shows formatted file size', () => {
		const { container } = render(UploadProgress, { files })
		const items = container.querySelectorAll('[data-upload-file]')
		expect(items[0].textContent).toContain('1.0 KB')
	})

	it('renders cancel button for uploading files', () => {
		const oncancel = vi.fn()
		const { container } = render(UploadProgress, { files, oncancel })
		const cancelBtns = container.querySelectorAll('[data-upload-cancel]')
		expect(cancelBtns.length).toBeGreaterThan(0)
	})

	it('renders remove button for done files', () => {
		const onremove = vi.fn()
		const { container } = render(UploadProgress, { files, onremove })
		const removeBtns = container.querySelectorAll('[data-upload-remove]')
		expect(removeBtns.length).toBeGreaterThan(0)
	})

	it('fires oncancel when cancel button clicked', async () => {
		const oncancel = vi.fn()
		const { container } = render(UploadProgress, { files, oncancel })
		const cancelBtn = container.querySelector('[data-upload-cancel]')!
		await fireEvent.click(cancelBtn)
		expect(oncancel).toHaveBeenCalled()
	})

	it('fires onremove when remove button clicked', async () => {
		const onremove = vi.fn()
		const { container } = render(UploadProgress, { files, onremove })
		const removeBtn = container.querySelector('[data-upload-remove]')!
		await fireEvent.click(removeBtn)
		expect(onremove).toHaveBeenCalled()
	})

	it('fires onclear when clear button clicked', async () => {
		const onclear = vi.fn()
		const { container } = render(UploadProgress, { files, onclear })
		const clearBtn = container.querySelector('[data-upload-clear]')!
		await fireEvent.click(clearBtn)
		expect(onclear).toHaveBeenCalled()
	})

	it('shows status summary in header', () => {
		const { container } = render(UploadProgress, { files })
		const header = container.querySelector('[data-upload-header]')!
		expect(header.textContent).toContain('uploading')
		expect(header.textContent).toContain('done')
		expect(header.textContent).toContain('pending')
	})

	it('renders grid view when view=grid', () => {
		const { container } = render(UploadProgress, { files, view: 'grid' })
		expect(
			container.querySelector('[data-upload-progress]')?.getAttribute('data-upload-view')
		).toBe('grid')
		expect(container.querySelector('[data-grid]')).toBeTruthy()
	})

	it('infers icon from MIME type', () => {
		const { container } = render(UploadProgress, { files })
		const items = container.querySelectorAll('[data-upload-file]')
		// First file is image/jpeg → should have i-lucide:image icon
		const icon = items[0].querySelector('[data-upload-file-icon]')
		expect(icon?.classList.contains('i-lucide:image')).toBe(true)
	})

	it('renders empty state when no files', () => {
		const { container } = render(UploadProgress, { files: [] })
		expect(container.querySelectorAll('[data-upload-file]').length).toBe(0)
	})

	it('sets data-status on each file row', () => {
		const { container } = render(UploadProgress, { files })
		const items = container.querySelectorAll('[data-upload-file]')
		expect(items[0].getAttribute('data-status')).toBe('uploading')
		expect(items[1].getAttribute('data-status')).toBe('done')
		expect(items[2].getAttribute('data-status')).toBe('pending')
	})

	it('renders progress bar with correct width for uploading file', () => {
		const { container } = render(UploadProgress, { files })
		const fill = container.querySelector('[data-upload-fill]') as HTMLElement
		expect(fill).toBeTruthy()
		expect(fill.style.width).toBe('45%')
	})
})
