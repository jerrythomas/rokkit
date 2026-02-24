import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Timeline from '../src/components/Timeline.svelte'

const sampleItems = [
	{ text: 'Step One', description: 'First step description', completed: true },
	{ text: 'Step Two', description: 'Second step description', active: true },
	{ text: 'Step Three', description: 'Third step description' }
]

describe('Timeline', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a timeline container', () => {
		const { container } = render(Timeline, { items: sampleItems })
		expect(container.querySelector('[data-timeline]')).toBeTruthy()
	})

	it('renders timeline items', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const items = container.querySelectorAll('[data-timeline-item]')
		expect(items.length).toBe(3)
	})

	it('renders circles with step numbers', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const circles = container.querySelectorAll('[data-timeline-circle]')
		expect(circles.length).toBe(3)
		// First is completed (shows icon), second and third show numbers
		expect(circles[2].textContent?.trim()).toBe('3')
	})

	it('renders connector lines except on last item', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const connectors = container.querySelectorAll('[data-timeline-connector]')
		expect(connectors.length).toBe(2) // 3 items, 2 connectors
	})

	it('renders no connector on single item', () => {
		const { container } = render(Timeline, { items: [{ text: 'Only' }] })
		const connectors = container.querySelectorAll('[data-timeline-connector]')
		expect(connectors.length).toBe(0)
	})

	// ─── Title and Description ──────────────────────────────────────

	it('renders title text', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const titles = container.querySelectorAll('[data-timeline-title]')
		expect(titles[0].textContent).toBe('Step One')
		expect(titles[1].textContent).toBe('Step Two')
		expect(titles[2].textContent).toBe('Step Three')
	})

	it('renders description text', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const descriptions = container.querySelectorAll('[data-timeline-description]')
		expect(descriptions[0].textContent).toBe('First step description')
	})

	it('does not render description when not provided', () => {
		const { container } = render(Timeline, { items: [{ text: 'No desc' }] })
		const descriptions = container.querySelectorAll('[data-timeline-description]')
		expect(descriptions.length).toBe(0)
	})

	// ─── States ─────────────────────────────────────────────────────

	it('applies completed state', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const items = container.querySelectorAll('[data-timeline-item]')
		expect(items[0].hasAttribute('data-completed')).toBe(true)
		expect(items[1].hasAttribute('data-completed')).toBe(false)
	})

	it('applies active state', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const items = container.querySelectorAll('[data-timeline-item]')
		expect(items[1].hasAttribute('data-active')).toBe(true)
		expect(items[0].hasAttribute('data-active')).toBe(false)
	})

	it('shows check icon for completed items', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const circles = container.querySelectorAll('[data-timeline-circle]')
		// Completed circle should contain an icon span
		const icon = circles[0].querySelector('span')
		expect(icon).toBeTruthy()
		expect(icon?.classList.contains('i-lucide:check')).toBe(true)
	})

	it('shows step number for non-completed items', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const circles = container.querySelectorAll('[data-timeline-circle]')
		// Active (not completed) shows number
		expect(circles[1].textContent?.trim()).toBe('2')
	})

	// ─── Icon support ───────────────────────────────────────────────

	it('shows icon in circle when provided', () => {
		const items = [{ text: 'With icon', icon: 'i-lucide:star' }]
		const { container } = render(Timeline, { items })
		const circle = container.querySelector('[data-timeline-circle]')
		const icon = circle?.querySelector('span')
		expect(icon?.classList.contains('i-lucide:star')).toBe(true)
	})

	// ─── Field mapping ──────────────────────────────────────────────

	it('supports field mapping', () => {
		const items = [{ title: 'Mapped', summary: 'Mapped desc' }]
		const fields = { text: 'title', description: 'summary' }
		const { container } = render(Timeline, { items, fields })
		expect(container.querySelector('[data-timeline-title]')?.textContent).toBe('Mapped')
		expect(container.querySelector('[data-timeline-description]')?.textContent).toBe('Mapped desc')
	})

	// ─── Empty state ────────────────────────────────────────────────

	it('renders empty when no items', () => {
		const { container } = render(Timeline, { items: [] })
		const items = container.querySelectorAll('[data-timeline-item]')
		expect(items.length).toBe(0)
	})

	it('renders empty by default (no items prop)', () => {
		const { container } = render(Timeline)
		const items = container.querySelectorAll('[data-timeline-item]')
		expect(items.length).toBe(0)
	})

	// ─── CSS class ──────────────────────────────────────────────────

	it('applies custom CSS class', () => {
		const { container } = render(Timeline, { items: sampleItems, class: 'my-timeline' })
		expect(container.querySelector('[data-timeline]')?.classList.contains('my-timeline')).toBe(true)
	})

	// ─── ARIA ───────────────────────────────────────────────────────

	it('has role="list" on container', () => {
		const { container } = render(Timeline, { items: sampleItems })
		expect(container.querySelector('[data-timeline]')?.getAttribute('role')).toBe('list')
	})

	it('has role="listitem" on items', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const items = container.querySelectorAll('[data-timeline-item]')
		items.forEach((item) => {
			expect(item.getAttribute('role')).toBe('listitem')
		})
	})

	it('has aria-hidden on markers', () => {
		const { container } = render(Timeline, { items: sampleItems })
		const markers = container.querySelectorAll('[data-timeline-marker]')
		markers.forEach((marker) => {
			expect(marker.getAttribute('aria-hidden')).toBe('true')
		})
	})

	// ─── Custom icons ───────────────────────────────────────────────

	it('supports custom completed icon', () => {
		const items = [{ text: 'Done', completed: true }]
		const icons = { completed: 'i-lucide:circle-check' }
		const { container } = render(Timeline, { items, icons })
		const circle = container.querySelector('[data-timeline-circle]')
		const icon = circle?.querySelector('span')
		expect(icon?.classList.contains('i-lucide:circle-check')).toBe(true)
	})
})
