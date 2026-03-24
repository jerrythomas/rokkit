import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
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
})
