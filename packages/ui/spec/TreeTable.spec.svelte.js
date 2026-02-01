import { describe, expect, it, beforeEach, vi } from 'vitest'
import { cleanup, render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import TreeTable from '../src/TreeTable.svelte'

describe('TreeTable.svelte', () => {
	beforeEach(() => cleanup())

	const flatData = [
		{ path: 'src', size: 0, type: 'folder' },
		{ path: 'src/components', size: 0, type: 'folder' },
		{ path: 'src/components/Button.svelte', size: 2048, type: 'file' },
		{ path: 'src/components/List.svelte', size: 4096, type: 'file' },
		{ path: 'src/utils', size: 0, type: 'folder' },
		{ path: 'src/utils/helpers.js', size: 1024, type: 'file' },
		{ path: 'README.md', size: 512, type: 'file' }
	]

	const columns = [
		{ field: 'path', label: 'Name', hierarchy: true, separator: '/' },
		{ field: 'size', label: 'Size' },
		{ field: 'type', label: 'Type' }
	]

	it('should render with flat data and hierarchy column', () => {
		const { container } = render(TreeTable, {
			props: { data: flatData, columns }
		})

		const table = container.querySelector('[data-tree-table]')
		expect(table).toBeTruthy()

		const rows = container.querySelectorAll('tbody tr')
		expect(rows.length).toBeGreaterThan(0)
	})

	it('should render column headers', () => {
		const { container } = render(TreeTable, {
			props: { data: flatData, columns }
		})

		const headers = container.querySelectorAll('thead th')
		expect(headers.length).toBe(3)
		expect(headers[0].textContent).toBe('Name')
		expect(headers[1].textContent).toBe('Size')
		expect(headers[2].textContent).toBe('Type')
	})

	it('should show expand/collapse icons for parent nodes', () => {
		const { container } = render(TreeTable, {
			props: { data: flatData, columns }
		})

		const icons = container.querySelectorAll('[data-tag-icon]')
		expect(icons.length).toBeGreaterThan(0)
	})

	it('should toggle expansion on parent row click', async () => {
		const onexpand = vi.fn()
		const oncollapse = vi.fn()

		const { container } = render(TreeTable, {
			props: { data: flatData, columns, expanded: true, onexpand, oncollapse }
		})

		// Find a parent row (src folder)
		const rows = container.querySelectorAll('tbody tr')
		const srcRow = Array.from(rows).find((row) => row.textContent.includes('src'))

		if (srcRow) {
			await fireEvent.click(srcRow)
			await tick()
			expect(oncollapse).toHaveBeenCalled()
		}
	})

	it('should call onselect when clicking a leaf node', async () => {
		const onselect = vi.fn()

		const { container } = render(TreeTable, {
			props: { data: flatData, columns, onselect }
		})

		// Find a leaf row (README.md - no children)
		const rows = container.querySelectorAll('tbody tr')
		const readmeRow = Array.from(rows).find((row) => row.textContent.includes('README'))

		if (readmeRow) {
			await fireEvent.click(readmeRow)
			await tick()
			expect(onselect).toHaveBeenCalled()
		}
	})

	it('should apply custom class', () => {
		const { container } = render(TreeTable, {
			props: { data: flatData, columns, class: 'custom-table' }
		})

		const table = container.querySelector('[data-tree-table]')
		expect(table.classList.contains('custom-table')).toBe(true)
	})

	it('should apply striped class when striped is true', () => {
		const { container } = render(TreeTable, {
			props: { data: flatData, columns, striped: true }
		})

		const table = container.querySelector('table')
		expect(table.classList.contains('striped')).toBe(true)
	})

	it('should render without hierarchy when no hierarchy column', () => {
		const simpleColumns = [
			{ field: 'path', label: 'Path' },
			{ field: 'size', label: 'Size' }
		]

		const { container } = render(TreeTable, {
			props: { data: flatData, columns: simpleColumns }
		})

		const rows = container.querySelectorAll('tbody tr')
		expect(rows.length).toBe(flatData.length)
	})

	it('should support column width', () => {
		const columnsWithWidth = [
			{ field: 'path', label: 'Name', hierarchy: true, width: '200px' },
			{ field: 'size', label: 'Size', width: '100px' }
		]

		const { container } = render(TreeTable, {
			props: { data: flatData, columns: columnsWithWidth }
		})

		const headers = container.querySelectorAll('thead th')
		expect(headers[0].style.width).toBe('200px')
		expect(headers[1].style.width).toBe('100px')
	})

	it('should support custom format function', () => {
		const columnsWithFormat = [
			{ field: 'path', label: 'Name', hierarchy: true },
			{ field: 'size', label: 'Size', format: (val) => `${val} bytes` }
		]

		const { container } = render(TreeTable, {
			props: { data: [{ path: 'test.txt', size: 1024 }], columns: columnsWithFormat }
		})

		expect(container.textContent).toContain('1024 bytes')
	})
})
