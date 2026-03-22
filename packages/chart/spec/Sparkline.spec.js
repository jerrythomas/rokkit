import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Sparkline from '../src/Sparkline.svelte'

describe('Sparkline', () => {
  it('renders an SVG element', () => {
    const { container } = render(Sparkline, { data: [10, 20, 30, 15] })
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('uses provided width and height', () => {
    const { container } = render(Sparkline, { data: [10, 20, 30], width: 120, height: 32 })
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('120')
    expect(svg?.getAttribute('height')).toBe('32')
  })

  it('renders a path for line type', () => {
    const { container } = render(Sparkline, { data: [10, 20, 30], type: 'line' })
    expect(container.querySelector('path')).toBeTruthy()
  })

  it('renders rects for bar type', () => {
    const { container } = render(Sparkline, { data: [10, 20, 30], type: 'bar' })
    expect(container.querySelectorAll('rect').length).toBeGreaterThan(0)
  })

  it('accepts objects with field prop', () => {
    const data = [{ v: 10 }, { v: 20 }, { v: 30 }]
    const { container } = render(Sparkline, { data, field: 'v' })
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
