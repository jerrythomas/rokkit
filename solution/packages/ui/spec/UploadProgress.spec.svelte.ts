import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import UploadProgress from '../src/components/UploadProgress.svelte'

const files = [
	{ id: '1', text: 'photo.jpg', value: '1', size: 1024, type: 'image/jpeg', status: 'uploading', progress: 45 },
	{ id: '2', text: 'doc.pdf', value: '2', size: 2048, type: 'application/pdf', status: 'done', progress: 100 },
	{ id: '3', text: 'readme.md', value: '3', size: 512, type: 'text/plain', status: 'pending', progress: 0 },
]

describe('UploadProgress', () => {
	it('renders root with data-upload-progress', () => {
		const { container } = render(UploadProgress, { files })
		expect(container.querySelector('[data-upload-progress]')).toBeTruthy()
	})

	it('renders data-upload-view attribute', () => {
		const { container } = render(UploadProgress, { files })
		expect(container.querySelector('[data-upload-progress]')?.getAttribute('data-upload-view')).toBe('list')
	})

	it('shows file count in header', () => {
		const { container } = render(UploadProgress, { files })
		const header = container.querySelector('[data-upload-header]')
		expect(header?.textContent).toContain('3')
	})

	it('shows status summary in header', () => {
		const { container } = render(UploadProgress, { files })
		const header = container.querySelector('[data-upload-header]')!
		expect(header.textContent).toContain('uploading')
		expect(header.textContent).toContain('done')
		expect(header.textContent).toContain('pending')
	})

	it('uses labels for status summary when provided', () => {
		const { container } = render(UploadProgress, {
			files,
			labels: { uploading: 'En cours', done: 'Termin\u00e9', pending: 'En attente' },
		})
		const header = container.querySelector('[data-upload-header]')!
		expect(header.textContent).toContain('En cours')
		expect(header.textContent).toContain('Termin\u00e9')
	})

	it('renders a List component internally (default view)', () => {
		const { container } = render(UploadProgress, { files })
		expect(container.querySelector('[data-list]')).toBeTruthy()
	})

	it('renders a Grid component when view=grid', () => {
		const { container } = render(UploadProgress, { files, view: 'grid' })
		expect(container.querySelector('[data-upload-progress]')?.getAttribute('data-upload-view')).toBe('grid')
		expect(container.querySelector('[data-grid]')).toBeTruthy()
	})

	it('renders UploadFileStatus for each file (default snippet)', () => {
		const { container } = render(UploadProgress, { files })
		const statuses = container.querySelectorAll('[data-upload-file-status]')
		expect(statuses.length).toBe(3)
	})

	it('shows clear button when onclear provided', () => {
		const onclear = vi.fn()
		const { container } = render(UploadProgress, { files, onclear })
		expect(container.querySelector('[data-upload-clear]')).toBeTruthy()
	})

	it('fires onclear when clear button clicked', async () => {
		const onclear = vi.fn()
		const { container } = render(UploadProgress, { files, onclear })
		await fireEvent.click(container.querySelector('[data-upload-clear]')!)
		expect(onclear).toHaveBeenCalled()
	})

	it('does not show clear button when onclear not provided', () => {
		const { container } = render(UploadProgress, { files })
		expect(container.querySelector('[data-upload-clear]')).toBeFalsy()
	})

	it('forwards cancelWhen to UploadFileStatus', () => {
		const oncancel = vi.fn()
		const { container } = render(UploadProgress, {
			files, cancelWhen: ['uploading'], oncancel,
		})
		const cancelBtns = container.querySelectorAll('[data-upload-cancel]')
		expect(cancelBtns.length).toBe(1)
	})

	it('renders empty state when no files', () => {
		const { container } = render(UploadProgress, { files: [] })
		expect(container.querySelectorAll('[data-upload-file-status]').length).toBe(0)
	})

	it('passes fields mapping through to inner components', () => {
		const customFiles = [
			{ id: '1', filename: 'test.txt', val: '1', bytes: 512, mime: 'text/plain', stage: 'active', pct: 50 },
		]
		const { container } = render(UploadProgress, {
			files: customFiles,
			fields: { label: 'filename', value: 'val', size: 'bytes', type: 'mime', status: 'stage', progress: 'pct' },
		})
		expect(container.textContent).toContain('test.txt')
		expect(container.querySelector('[data-upload-file-status]')?.getAttribute('data-status')).toBe('active')
	})
})
