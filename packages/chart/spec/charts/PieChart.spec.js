import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import PieChart from '../../src/charts/PieChart.svelte'

const data = [
  { slice: 'A', value: 30 },
  { slice: 'B', value: 70 }
]

describe('PieChart', () => {
  it('renders without errors', () => {
    const { container } = render(PieChart, { data, label: 'slice', y: 'value' })
    expect(container).toBeTruthy()
  })

  it('renders an SVG element', () => {
    const { container } = render(PieChart, { data, label: 'slice', y: 'value' })
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders one arc path per data slice', () => {
    const { container } = render(PieChart, { data, label: 'slice', y: 'value' })
    const paths = container.querySelectorAll('[data-plot-element="arc"]')
    expect(paths.length).toBe(2)
  })

  it('arc paths have non-empty d attribute (no NaN)', () => {
    const { container } = render(PieChart, { data, label: 'slice', y: 'value' })
    const paths = container.querySelectorAll('[data-plot-element="arc"]')
    for (const path of paths) {
      const d = path.getAttribute('d')
      expect(d).toBeTruthy()
      expect(d).not.toContain('NaN')
    }
  })

  it('arc paths have fill color (not the fallback #888)', () => {
    const { container } = render(PieChart, { data, label: 'slice', y: 'value' })
    const paths = container.querySelectorAll('[data-plot-element="arc"]')
    for (const path of paths) {
      const fill = path.getAttribute('fill')
      expect(fill).not.toBe('#888')
      expect(fill).toBeTruthy()
    }
  })

  it('aggregates duplicate labels with stat=sum', () => {
    const dupData = [
      { segment: 'A', share: 10 },
      { segment: 'A', share: 20 },
      { segment: 'B', share: 30 }
    ]
    const { container } = render(PieChart, {
      data: dupData, label: 'segment', y: 'share', stat: 'sum'
    })
    const paths = container.querySelectorAll('[data-plot-element="arc"]')
    expect(paths.length).toBe(2)
  })

  it('renders percentage labels for slices >= 5%', () => {
    const { container } = render(PieChart, { data, label: 'slice', y: 'value' })
    const labels = container.querySelectorAll('[data-plot-element="arc-label"]')
    expect(labels.length).toBeGreaterThanOrEqual(1)
    const texts = [...labels].map((l) => l.textContent)
    expect(texts.some((t) => t?.includes('%'))).toBe(true)
  })

  it('renders a donut when innerRadius > 0', () => {
    const { container } = render(PieChart, { data, label: 'slice', y: 'value', innerRadius: 0.5 })
    const paths = container.querySelectorAll('[data-plot-element="arc"]')
    expect(paths.length).toBe(2)
    // Donut paths include an inner arc — the d attribute will differ from a full pie
    const d = paths[0].getAttribute('d')
    expect(d).toBeTruthy()
  })
})
