import { describe, it, expect } from 'vitest'
import { fireEvent, render } from '@testing-library/svelte'
import { vi } from 'vitest'
import Timeline from '../../src/Plot/Timeline.svelte'

const defaultProps = {
	frameKeys: [1999, 2008],
	currentIndex: 0,
	playing: false,
	speed: 1
}

describe('Timeline', () => {
	it('renders without crashing', () => {
		expect(() => render(Timeline, { props: defaultProps })).not.toThrow()
	})

	it('renders data-plot-timeline container', () => {
		const { container } = render(Timeline, { props: defaultProps })
		expect(container.querySelector('[data-plot-timeline]')).toBeTruthy()
	})

	it('renders play button when not playing', () => {
		const { container } = render(Timeline, { props: { ...defaultProps, playing: false } })
		const btn = container.querySelector('[data-plot-timeline-playpause]')
		expect(btn?.textContent).toContain('▶')
	})

	it('renders pause button when playing', () => {
		const { container } = render(Timeline, { props: { ...defaultProps, playing: true } })
		const btn = container.querySelector('[data-plot-timeline-playpause]')
		expect(btn?.textContent).toContain('⏸')
	})

	it('renders scrub slider with max = frameKeys.length - 1', () => {
		const { container } = render(Timeline, { props: defaultProps })
		const slider = container.querySelector('[data-plot-timeline-scrub]')
		expect(Number(slider?.getAttribute('max'))).toBe(1)
	})

	it('shows current frame label', () => {
		const { container } = render(Timeline, { props: { ...defaultProps, currentIndex: 1 } })
		const label = container.querySelector('[data-plot-timeline-label]')
		expect(label?.textContent).toContain('2008')
	})

	it('calls onplay when play button clicked', async () => {
		const onplay = vi.fn()
		const { container } = render(Timeline, { props: { ...defaultProps, onplay } })
		const btn = container.querySelector('[data-plot-timeline-playpause]')
		await fireEvent.click(btn)
		expect(onplay).toHaveBeenCalledOnce()
	})

	it('calls onpause when pause button clicked while playing', async () => {
		const onpause = vi.fn()
		const { container } = render(Timeline, { props: { ...defaultProps, playing: true, onpause } })
		const btn = container.querySelector('[data-plot-timeline-playpause]')
		await fireEvent.click(btn)
		expect(onpause).toHaveBeenCalledOnce()
	})

	it('disables play button and slider when frameKeys is empty', () => {
		const { container } = render(Timeline, {
			props: { frameKeys: [], currentIndex: 0, playing: false, speed: 1 }
		})
		const btn = container.querySelector('[data-plot-timeline-playpause]')
		const slider = container.querySelector('[data-plot-timeline-scrub]')
		expect(btn?.disabled).toBe(true)
		expect(slider?.disabled).toBe(true)
	})
})
