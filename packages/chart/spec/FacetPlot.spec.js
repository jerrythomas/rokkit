import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import FacetPlot from '../src/FacetPlot.svelte'
import mpg from './fixtures/mpg.json'

describe('FacetPlot', () => {
  const defaultProps = {
    data: mpg,
    facet: { by: 'drv', cols: 3 },
    x: 'class',
    y: 'hwy',
    width: 900,
    height: 300
  }

  it('renders without crashing', () => {
    expect(() => render(FacetPlot, { props: defaultProps })).not.toThrow()
  })

  it('renders one panel per distinct facet value', () => {
    const { container } = render(FacetPlot, { props: defaultProps })
    const panels = container.querySelectorAll('[data-facet-panel]')
    const expectedCount = new Set(mpg.map((d) => d.drv)).size
    expect(panels.length).toBe(expectedCount)
  })

  it('renders a panel title for each facet value', () => {
    const { container } = render(FacetPlot, { props: defaultProps })
    const titles = container.querySelectorAll('[data-facet-title]')
    expect(titles.length).toBeGreaterThan(0)
  })

  it('renders data-facet-grid container', () => {
    const { container } = render(FacetPlot, { props: defaultProps })
    expect(container.querySelector('[data-facet-grid]')).toBeTruthy()
  })
})
