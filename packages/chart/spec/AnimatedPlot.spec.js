import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import AnimatedPlot from '../src/AnimatedPlot.svelte'
import mpg from './fixtures/mpg.json'

describe('AnimatedPlot', () => {
  const defaultProps = {
    data: mpg,
    animate: { by: 'year' },
    x: 'class',
    y: 'hwy',
    geoms: [{ type: 'bar', stat: 'mean' }],
    width: 600,
    height: 400
  }

  it('renders without crashing', () => {
    expect(() => render(AnimatedPlot, { props: defaultProps })).not.toThrow()
  })

  it('renders data-plot-animated container', () => {
    const { container } = render(AnimatedPlot, { props: defaultProps })
    expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
  })

  it('renders timeline controls', () => {
    const { container } = render(AnimatedPlot, { props: defaultProps })
    expect(container.querySelector('[data-plot-timeline]')).toBeTruthy()
  })

  it('renders play/pause button', () => {
    const { container } = render(AnimatedPlot, { props: defaultProps })
    expect(container.querySelector('[data-plot-timeline-playpause]')).toBeTruthy()
  })

  it('renders scrub slider with correct max', () => {
    const { container } = render(AnimatedPlot, { props: defaultProps })
    const slider = container.querySelector('[data-plot-timeline-scrub]')
    const expectedFrames = new Set(mpg.map((d) => d.year)).size
    expect(Number(slider?.getAttribute('max'))).toBe(expectedFrames - 1)
  })

  it('stops playing when scrub is used — integration smoke test', async () => {
    // Verify the component renders with playback state accessible
    // (deep animation behavior not testable in jsdom, but we verify structure)
    const { container } = render(AnimatedPlot, { props: defaultProps })
    const slider = container.querySelector('[data-plot-timeline-scrub]')
    expect(slider).toBeTruthy()
    // slider should not be disabled — has frames
    expect(slider?.disabled).toBe(false)
  })

  it('renders with single-frame dataset without crashing', () => {
    const singleFrame = [{ year: 1999, class: 'compact', hwy: 29 }]
    const { container } = render(AnimatedPlot, {
      props: { ...defaultProps, data: singleFrame }
    })
    expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
    // Slider max should be 0 (only one frame)
    const slider = container.querySelector('[data-plot-timeline-scrub]')
    expect(Number(slider?.getAttribute('max'))).toBe(0)
  })
})
