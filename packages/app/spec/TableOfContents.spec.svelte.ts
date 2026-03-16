import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import TableOfContents from '../src/components/TableOfContents.svelte'

// ─── Helpers ──────────────────────────────────────────────────────────────

function makeContainer(id = 'main-content') {
	const el = document.createElement('div')
	el.id = id
	document.body.appendChild(el)
	return el
}

function clearChildren(el: HTMLElement) {
	while (el.firstChild) el.removeChild(el.firstChild)
}

function addHeading(container: HTMLElement, tag: 'h2' | 'h3', text: string, id?: string) {
	const el = document.createElement(tag)
	el.textContent = text
	if (id) el.id = id
	container.appendChild(el)
	return el
}

// ─── IntersectionObserver Mock ──────────────────────────────────────────────

let observerCallback: ((entries: any[]) => void) | null = null
let mockObserverInstance: any = null

function createMockIO() {
	return vi.fn((callback: any) => {
		observerCallback = callback
		mockObserverInstance = {
			observe: vi.fn(),
			unobserve: vi.fn(),
			disconnect: vi.fn(),
			simulateIntersection: (entries: any[]) => {
				callback(entries, mockObserverInstance)
			}
		}
		return mockObserverInstance
	})
}

// ─── Setup / Teardown ───────────────────────────────────────────────────────

beforeEach(() => {
	vi.stubGlobal('IntersectionObserver', createMockIO())
	observerCallback = null
	mockObserverInstance = null
})

afterEach(() => {
	vi.unstubAllGlobals()
})

// ─── Rendering ────────────────────────────────────────────────────────────

describe('TableOfContents — rendering', () => {
	let container: HTMLElement

	beforeEach(() => {
		container = makeContainer()
	})
	afterEach(() => {
		container.remove()
	})

	it('renders nothing when container has no headings', () => {
		const { container: host } = render(TableOfContents)
		expect(host.querySelector('[data-toc]')).toBeNull()
	})

	it('renders nothing when container has only one heading', () => {
		addHeading(container, 'h2', 'Only one')
		const { container: host } = render(TableOfContents)
		expect(host.querySelector('[data-toc]')).toBeNull()
	})

	it('renders [data-toc] nav with two or more headings', () => {
		addHeading(container, 'h2', 'First')
		addHeading(container, 'h2', 'Second')
		const { container: host } = render(TableOfContents)
		expect(host.querySelector('[data-toc]')).toBeTruthy()
	})

	it('nav has aria-label "On this page"', () => {
		addHeading(container, 'h2', 'First')
		addHeading(container, 'h2', 'Second')
		const { container: host } = render(TableOfContents)
		expect(host.querySelector('[data-toc]')?.getAttribute('aria-label')).toBe('On this page')
	})

	it('renders [data-toc-label]', () => {
		addHeading(container, 'h2', 'First')
		addHeading(container, 'h2', 'Second')
		const { container: host } = render(TableOfContents)
		expect(host.querySelector('[data-toc-label]')).toBeTruthy()
	})

	it('renders [data-toc-list]', () => {
		addHeading(container, 'h2', 'First')
		addHeading(container, 'h2', 'Second')
		const { container: host } = render(TableOfContents)
		expect(host.querySelector('[data-toc-list]')).toBeTruthy()
	})

	it('renders one [data-toc-item] per heading', () => {
		addHeading(container, 'h2', 'First')
		addHeading(container, 'h2', 'Second')
		addHeading(container, 'h3', 'Third')
		const { container: host } = render(TableOfContents)
		expect(host.querySelectorAll('[data-toc-item]').length).toBe(3)
	})

	it('sets data-toc-level to the heading tag on each item', () => {
		addHeading(container, 'h2', 'Section')
		addHeading(container, 'h3', 'Sub-section')
		const { container: host } = render(TableOfContents)
		const items = host.querySelectorAll('[data-toc-item]')
		expect(items[0].getAttribute('data-toc-level')).toBe('h2')
		expect(items[1].getAttribute('data-toc-level')).toBe('h3')
	})

	it('renders item text content from heading text', () => {
		addHeading(container, 'h2', 'Getting started')
		addHeading(container, 'h2', 'Installation')
		const { container: host } = render(TableOfContents)
		const items = host.querySelectorAll('[data-toc-item]')
		expect(items[0].textContent?.trim()).toBe('Getting started')
		expect(items[1].textContent?.trim()).toBe('Installation')
	})
})

// ─── DOM Scanning ─────────────────────────────────────────────────────────

describe('TableOfContents — DOM scanning', () => {
	let container: HTMLElement

	beforeEach(() => {
		container = makeContainer()
	})
	afterEach(() => {
		container.remove()
	})

	it('preserves existing IDs on headings (does not overwrite with slugs)', () => {
		const h1 = addHeading(container, 'h2', 'Getting Started', 'my-custom-id')
		const h2 = addHeading(container, 'h2', 'Another Section', 'another-id')
		const { container: host } = render(TableOfContents)
		// Verify that the headings still have their original IDs, not slugified versions
		expect(h1.id).toBe('my-custom-id')
		expect(h2.id).toBe('another-id')
		// Also verify the component found both headings via the TOC items
		expect(host.querySelectorAll('[data-toc-item]').length).toBe(2)
	})

	it('auto-generates slug IDs for headings without IDs', () => {
		addHeading(container, 'h2', 'Getting Started')
		addHeading(container, 'h2', 'API Reference')
		render(TableOfContents)
		expect(document.getElementById('getting-started')).toBeTruthy()
		expect(document.getElementById('api-reference')).toBeTruthy()
	})

	it('uses fallback section-N ID for headings with empty text', () => {
		const h = addHeading(container, 'h2', '')
		addHeading(container, 'h2', 'Second')
		render(TableOfContents)
		expect(h.id).toMatch(/^section-\d+$/)
	})

	it('only scans h2 and h3, ignores h1 and h4', () => {
		const h1 = document.createElement('h1')
		h1.textContent = 'Title'
		container.appendChild(h1)
		addHeading(container, 'h2', 'First')
		addHeading(container, 'h3', 'Sub')
		const h4 = document.createElement('h4')
		h4.textContent = 'Minor'
		container.appendChild(h4)
		const { container: host } = render(TableOfContents)
		expect(host.querySelectorAll('[data-toc-item]').length).toBe(2)
	})

	it('uses custom container ID prop', () => {
		const custom = makeContainer('article-body')
		addHeading(custom, 'h2', 'First')
		addHeading(custom, 'h2', 'Second')
		const { container: host } = render(TableOfContents, { props: { container: 'article-body' } })
		expect(host.querySelectorAll('[data-toc-item]').length).toBe(2)
		custom.remove()
	})

	it('renders nothing when container element does not exist', () => {
		const { container: host } = render(TableOfContents, { props: { container: 'nonexistent-id' } })
		expect(host.querySelector('[data-toc]')).toBeNull()
	})
})

// ─── Active State ─────────────────────────────────────────────────────────

describe('TableOfContents — active state', () => {
	let container: HTMLElement

	beforeEach(() => {
		container = makeContainer()
	})
	afterEach(() => {
		container.remove()
	})

	it('no item has data-toc-active initially', () => {
		addHeading(container, 'h2', 'First')
		addHeading(container, 'h2', 'Second')
		const { container: host } = render(TableOfContents)
		expect(host.querySelector('[data-toc-active]')).toBeNull()
	})

	it('sets data-toc-active on the item whose heading intersects', async () => {
		const h1 = addHeading(container, 'h2', 'First', 'first')
		addHeading(container, 'h2', 'Second', 'second')
		const { container: host } = render(TableOfContents)

		mockObserverInstance?.simulateIntersection([
			{ target: h1, isIntersecting: true, boundingClientRect: { top: 0 } }
		])
		flushSync()

		await waitFor(() => {
			const active = host.querySelector('[data-toc-active]')
			expect(active?.textContent?.trim()).toBe('First')
		})
	})

	it('moves data-toc-active when a different heading intersects', async () => {
		const h1 = addHeading(container, 'h2', 'First', 'first')
		const h2el = addHeading(container, 'h2', 'Second', 'second')
		const { container: host } = render(TableOfContents)

		mockObserverInstance?.simulateIntersection([
			{ target: h1, isIntersecting: true, boundingClientRect: { top: 0 } }
		])
		flushSync()
		mockObserverInstance?.simulateIntersection([
			{ target: h2el, isIntersecting: true, boundingClientRect: { top: 0 } }
		])
		flushSync()

		await waitFor(() => {
			const active = host.querySelector('[data-toc-active]')
			expect(active?.textContent?.trim()).toBe('Second')
		})
	})
})

// ─── Focus / Roving Tabindex ──────────────────────────────────────────────

describe('TableOfContents — roving tabindex', () => {
	let container: HTMLElement

	beforeEach(() => {
		container = makeContainer()
	})
	afterEach(() => {
		container.remove()
	})

	it('first item has tabindex 0 by default', () => {
		addHeading(container, 'h2', 'First')
		addHeading(container, 'h2', 'Second')
		const { container: host } = render(TableOfContents)
		const items = host.querySelectorAll('[data-toc-item]')
		expect(items[0].getAttribute('tabindex')).toBe('0')
		expect(items[1].getAttribute('tabindex')).toBe('-1')
	})

	it('sets data-toc-focused on the first item by default', () => {
		addHeading(container, 'h2', 'First')
		addHeading(container, 'h2', 'Second')
		const { container: host } = render(TableOfContents)
		const items = host.querySelectorAll('[data-toc-item]')
		expect(items[0].hasAttribute('data-toc-focused')).toBe(true)
		expect(items[1].hasAttribute('data-toc-focused')).toBe(false)
	})

	it('updates tabindex and focused attribute on focusin', async () => {
		addHeading(container, 'h2', 'First')
		addHeading(container, 'h2', 'Second')
		const { container: host } = render(TableOfContents)
		const items = host.querySelectorAll('[data-toc-item]')
		await fireEvent.focusIn(items[1])
		expect(items[1].getAttribute('tabindex')).toBe('0')
		expect(items[0].getAttribute('tabindex')).toBe('-1')
		expect(items[1].hasAttribute('data-toc-focused')).toBe(true)
		expect(items[0].hasAttribute('data-toc-focused')).toBe(false)
	})
})

// ─── Keyboard Navigation ──────────────────────────────────────────────────

describe('TableOfContents — keyboard navigation', () => {
	let container: HTMLElement

	beforeEach(() => {
		container = makeContainer()
	})
	afterEach(() => {
		container.remove()
	})

	it('ArrowDown moves focus to next item', async () => {
		addHeading(container, 'h2', 'First')
		addHeading(container, 'h2', 'Second')
		addHeading(container, 'h3', 'Third')
		const { container: host } = render(TableOfContents)
		const nav = host.querySelector('[data-toc]')!
		const items = host.querySelectorAll('[data-toc-item]')
		items[0].focus()
		await fireEvent.keyUp(nav, { key: 'ArrowDown' })
		await waitFor(() => expect(document.activeElement).toBe(items[1]))
	})

	it('ArrowUp moves focus to previous item', async () => {
		addHeading(container, 'h2', 'First')
		addHeading(container, 'h2', 'Second')
		const { container: host } = render(TableOfContents)
		const nav = host.querySelector('[data-toc]')!
		const items = host.querySelectorAll('[data-toc-item]')
		items[1].focus()
		await fireEvent.keyUp(nav, { key: 'ArrowUp' })
		await waitFor(() => expect(document.activeElement).toBe(items[0]))
	})

	it('ArrowDown does not move past last item', async () => {
		addHeading(container, 'h2', 'First')
		addHeading(container, 'h2', 'Second')
		const { container: host } = render(TableOfContents)
		const nav = host.querySelector('[data-toc]')!
		const items = host.querySelectorAll('[data-toc-item]')
		items[0].focus()
		await fireEvent.keyUp(nav, { key: 'ArrowDown' })
		await fireEvent.keyUp(nav, { key: 'ArrowDown' })
		expect(document.activeElement).toBe(items[1])
	})

	it('ArrowUp does not move before first item', async () => {
		addHeading(container, 'h2', 'First')
		addHeading(container, 'h2', 'Second')
		const { container: host } = render(TableOfContents)
		const nav = host.querySelector('[data-toc]')!
		const items = host.querySelectorAll('[data-toc-item]')
		items[0].focus()
		await fireEvent.keyUp(nav, { key: 'ArrowUp' })
		expect(document.activeElement).toBe(items[0])
	})

	it('Enter calls scrollTo on the container for the focused heading', async () => {
		addHeading(container, 'h2', 'First', 'first')
		addHeading(container, 'h2', 'Second', 'second')
		const scrollSpy = vi.spyOn(container, 'scrollTo').mockImplementation(() => {})
		const { container: host } = render(TableOfContents)
		const nav = host.querySelector('[data-toc]')!
		const items = host.querySelectorAll('[data-toc-item]')
		items[0].focus()
		await fireEvent.keyUp(nav, { key: 'Enter' })
		expect(scrollSpy).toHaveBeenCalled()
	})

	it('Space calls scrollTo on the container for the focused heading', async () => {
		addHeading(container, 'h2', 'First', 'first')
		addHeading(container, 'h2', 'Second', 'second')
		const scrollSpy = vi.spyOn(container, 'scrollTo').mockImplementation(() => {})
		const { container: host } = render(TableOfContents)
		const nav = host.querySelector('[data-toc]')!
		const items = host.querySelectorAll('[data-toc-item]')
		items[0].focus()
		await fireEvent.keyUp(nav, { key: ' ' })
		expect(scrollSpy).toHaveBeenCalled()
	})
})

// ─── Click Handling ───────────────────────────────────────────────────────

describe('TableOfContents — click handling', () => {
	let container: HTMLElement

	beforeEach(() => {
		container = makeContainer()
	})
	afterEach(() => {
		container.remove()
	})

	it('clicking an item calls scrollTo on the container', async () => {
		addHeading(container, 'h2', 'First', 'first')
		addHeading(container, 'h2', 'Second', 'second')
		const scrollSpy = vi.spyOn(container, 'scrollTo').mockImplementation(() => {})
		const { container: host } = render(TableOfContents)
		const items = host.querySelectorAll('[data-toc-item]')
		await fireEvent.click(items[1])
		expect(scrollSpy).toHaveBeenCalled()
	})

	it('clicking an item updates focusedIndex (tabindex and data-toc-focused)', async () => {
		addHeading(container, 'h2', 'First', 'first')
		addHeading(container, 'h2', 'Second', 'second')
		vi.spyOn(container, 'scrollTo').mockImplementation(() => {})
		const { container: host } = render(TableOfContents)
		const items = host.querySelectorAll('[data-toc-item]')
		await fireEvent.click(items[1])
		await waitFor(() => {
			expect(items[1].getAttribute('tabindex')).toBe('0')
			expect(items[0].getAttribute('tabindex')).toBe('-1')
			expect(items[1].hasAttribute('data-toc-focused')).toBe(true)
			expect(items[0].hasAttribute('data-toc-focused')).toBe(false)
		})
	})
})

// ─── rescan() ─────────────────────────────────────────────────────────────

describe('TableOfContents — rescan()', () => {
	let container: HTMLElement

	beforeEach(() => {
		container = makeContainer()
	})
	afterEach(() => {
		container.remove()
	})

	it('rescan() picks up new headings added after mount', async () => {
		addHeading(container, 'h2', 'First')
		addHeading(container, 'h2', 'Second')
		const result = render(TableOfContents)
		expect(result.container.querySelectorAll('[data-toc-item]').length).toBe(2)

		addHeading(container, 'h2', 'Third')
		const toc = result.component as any
		toc.rescan()
		flushSync()

		await waitFor(() => {
			expect(result.container.querySelectorAll('[data-toc-item]').length).toBe(3)
		})
	})

	it('rescan() resets focusedIndex to first item', async () => {
		addHeading(container, 'h2', 'First')
		addHeading(container, 'h2', 'Second')
		const result = render(TableOfContents)
		const items = result.container.querySelectorAll('[data-toc-item]')
		await fireEvent.focusIn(items[1])

		const toc = result.component as any
		toc.rescan()
		flushSync()

		await waitFor(() => {
			const updated = result.container.querySelectorAll('[data-toc-item]')
			expect(updated[0].getAttribute('tabindex')).toBe('0')
		})
	})

	it('rescan() picks up a completely replaced heading set', async () => {
		addHeading(container, 'h2', 'Old First')
		addHeading(container, 'h2', 'Old Second')
		const result = render(TableOfContents)

		clearChildren(container)
		addHeading(container, 'h2', 'New First')
		addHeading(container, 'h2', 'New Second')
		addHeading(container, 'h3', 'New Sub')

		const toc = result.component as any
		toc.rescan()
		flushSync()

		await waitFor(() => {
			expect(result.container.querySelectorAll('[data-toc-item]').length).toBe(3)
			expect(result.container.querySelectorAll('[data-toc-item]')[0].textContent?.trim()).toBe('New First')
		})
	})
})
