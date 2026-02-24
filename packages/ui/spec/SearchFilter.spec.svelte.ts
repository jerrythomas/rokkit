import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import SearchFilter from '../src/components/SearchFilter.svelte'

describe('SearchFilter', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a search filter container', () => {
		const { container } = render(SearchFilter)
		expect(container.querySelector('[data-search-filter]')).toBeTruthy()
	})

	it('renders a search input', () => {
		const { container } = render(SearchFilter)
		expect(container.querySelector('[data-search-input]')).toBeTruthy()
	})

	it('renders with custom placeholder', () => {
		const { container } = render(SearchFilter, { placeholder: 'Find...' })
		const input = container.querySelector('[data-search-input]') as HTMLInputElement
		expect(input?.placeholder).toBe('Find...')
	})

	it('renders with default placeholder', () => {
		const { container } = render(SearchFilter)
		const input = container.querySelector('[data-search-input]') as HTMLInputElement
		expect(input?.placeholder).toBe('Search...')
	})

	// ─── Size Variant ───────────────────────────────────────────────

	it('applies size attribute', () => {
		const { container } = render(SearchFilter, { size: 'lg' })
		expect(container.querySelector('[data-search-filter]')?.getAttribute('data-size')).toBe('lg')
	})

	// ─── Input ──────────────────────────────────────────────────────

	it('does not show clear button initially', () => {
		const { container } = render(SearchFilter)
		expect(container.querySelector('[data-search-clear]')).toBeNull()
	})

	it('shows clear button when input has text', async () => {
		const { container } = render(SearchFilter)
		const input = container.querySelector('[data-search-input]') as HTMLInputElement
		await fireEvent.input(input, { target: { value: 'test' } })
		expect(container.querySelector('[data-search-clear]')).toBeTruthy()
	})

	it('clears input on clear button click', async () => {
		const { container } = render(SearchFilter)
		const input = container.querySelector('[data-search-input]') as HTMLInputElement
		await fireEvent.input(input, { target: { value: 'test' } })
		const clearBtn = container.querySelector('[data-search-clear]')!
		await fireEvent.click(clearBtn)
		expect(input.value).toBe('')
	})

	// ─── No tags initially ──────────────────────────────────────────

	it('does not show tags when no filters', () => {
		const { container } = render(SearchFilter)
		expect(container.querySelector('[data-search-tags]')).toBeNull()
	})

	// ─── Callback ───────────────────────────────────────────────────

	it('fires onfilter callback on clear', async () => {
		const onfilter = vi.fn()
		const { container } = render(SearchFilter, { onfilter })
		const input = container.querySelector('[data-search-input]') as HTMLInputElement

		// Type some text first
		await fireEvent.input(input, { target: { value: 'test' } })

		// Wait for debounce
		await new Promise((r) => setTimeout(r, 350))

		// Clear
		const clearBtn = container.querySelector('[data-search-clear]')!
		await fireEvent.click(clearBtn)

		// Last call should have empty filters
		const lastCall = onfilter.mock.calls[onfilter.mock.calls.length - 1]
		expect(lastCall[0]).toEqual([])
	})

	it('fires onfilter callback after debounce', async () => {
		const onfilter = vi.fn()
		const { container } = render(SearchFilter, { onfilter, debounce: 50 })
		const input = container.querySelector('[data-search-input]') as HTMLInputElement

		await fireEvent.input(input, { target: { value: 'age>30' } })
		// Should not fire immediately
		expect(onfilter).not.toHaveBeenCalled()

		// Wait for debounce
		await new Promise((r) => setTimeout(r, 100))
		expect(onfilter).toHaveBeenCalled()
		const filters = onfilter.mock.calls[0][0]
		expect(filters.length).toBe(1)
		expect(filters[0].column).toBe('age')
		expect(filters[0].operator).toBe('>')
		expect(filters[0].value).toBe(30)
	})

	it('parses free text to case-insensitive regex filter', async () => {
		const onfilter = vi.fn()
		const { container } = render(SearchFilter, { onfilter, debounce: 10 })
		const input = container.querySelector('[data-search-input]') as HTMLInputElement

		await fireEvent.input(input, { target: { value: 'alice' } })
		await new Promise((r) => setTimeout(r, 50))

		const filters = onfilter.mock.calls[0][0]
		expect(filters.length).toBe(1)
		expect(filters[0].operator).toBe('~*')
		expect(filters[0].value).toBeInstanceOf(RegExp)
	})

	it('parses column:value syntax', async () => {
		const onfilter = vi.fn()
		const { container } = render(SearchFilter, { onfilter, debounce: 10 })
		const input = container.querySelector('[data-search-input]') as HTMLInputElement

		await fireEvent.input(input, { target: { value: 'name:alice' } })
		await new Promise((r) => setTimeout(r, 50))

		const filters = onfilter.mock.calls[0][0]
		expect(filters.length).toBe(1)
		expect(filters[0].column).toBe('name')
	})
})
