import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { iconStore } from '../src/store'
import Icon from '../src/Icon.svelte'
import box from './fixtures/box.svelte'
import circle from './fixtures/circle.svelte'

describe('Icon.svelte', () => {
	beforeEach(() => cleanup())

	it('should render svg with default properties and title', () => {
		const { container } = render(Icon, { name: 'circle' })
		expect(container).toBeTruthy()

		const svg = container.querySelector('svg')
		expect(svg).toBeTruthy()
		expect(svg.getAttribute('height')).toBe('1.5em')
		expect(svg.getAttribute('width')).toBe('1.5em')
		expect(svg.getAttribute('viewBox')).toBe('0 0 24 24')
		expect(svg.getAttribute('fill')).toBe('none')
		expect(svg.getAttribute('stroke')).toBe('currentColor')
		expect(svg.getAttribute('class')).toContain('icon')

		const title = svg.querySelector('title')
		expect(title).toBeTruthy()
		expect(title.innerHTML).toBe('circle')

		expect(svg.innerHTML).toBe('<title>circle</title>')
	})
	it('should render svg with custom size', () => {
		const { container } = render(Icon, { name: 'circle', size: '2em' })
		expect(container).toBeTruthy()
		const svg = container.querySelector('svg')
		expect(svg.getAttribute('height')).toBe('2em')
		expect(svg.getAttribute('width')).toBe('2em')
	})

	it('should render a circle using name', () => {
		iconStore.set({ circle })
		const { container } = render(Icon, { name: 'circle' })

		expect(container).toBeTruthy()
		const svg = container.querySelector('svg')

		expect(svg.innerHTML).toBe(
			'<title>circle</title><circle cx="12" cy="12" r="10"></circle>'
		)
	})

	it('should render a circle using icon', () => {
		iconStore.set({ circle })
		const { container } = render(Icon, { name: 'Ring', icon: circle })

		expect(container).toBeTruthy()
		const svg = container.querySelector('svg')

		expect(svg.innerHTML).toBe(
			'<title>Ring</title><circle cx="12" cy="12" r="10"></circle>'
		)
	})

	it('should render a box', () => {
		iconStore.set({ circle, box })
		const { container } = render(Icon, { name: 'box' })
		expect(container).toBeTruthy()
		const svg = container.querySelector('svg')

		expect(svg.innerHTML).toBe(
			'<title>box</title><rect x1="4" y1="4" x2="20" y2="20"></rect>'
		)
	})

	it('should render with custom class', () => {
		const { container } = render(Icon, { name: 'box', class: 'custom' })
		expect(container).toBeTruthy()
		const svg = container.querySelector('svg')
		expect(svg.getAttribute('class')).toContain('icon')
		expect(svg.getAttribute('class')).toContain('custom')
	})

	it('should fire click event', async () => {
		const { container } = render(Icon, { name: 'box' })
		expect(container).toBeTruthy()
		const svg = container.querySelector('svg')

		container.onclick = vi.fn()
		await fireEvent.click(svg)
		expect(container.onclick).toHaveBeenCalled()
	})
})
