import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Plot from '../src/Plot.svelte'
import mpg from './fixtures/mpg.json'

// Minimal render test — confirms Plot creates SVG and sets context
describe('Plot.svelte', () => {
  it('renders an SVG element', () => {
    const { container } = render(Plot, {
      props: { data: mpg.slice(0, 5), width: 400, height: 300, grid: false, legend: false }
    })
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders with data-plot-root attribute', () => {
    const { container } = render(Plot, {
      props: { data: mpg.slice(0, 5), width: 400, height: 300 }
    })
    expect(container.querySelector('[data-plot-root]')).toBeTruthy()
  })

  it('renders canvas transform group', () => {
    const { container } = render(Plot, {
      props: { data: mpg.slice(0, 5), width: 400, height: 300 }
    })
    expect(container.querySelector('[data-plot-canvas]')).toBeTruthy()
  })

  it('accepts spec prop without crashing', () => {
    const spec = {
      data: mpg.slice(0, 5),
      x: 'class',
      y: 'hwy',
      geoms: [{ type: 'bar', stat: 'identity' }]
    }
    expect(() => render(Plot, { props: { spec, width: 400, height: 300 } })).not.toThrow()
  })
})
