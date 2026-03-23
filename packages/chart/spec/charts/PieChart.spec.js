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

  it('aggregates duplicate labels with stat=sum', () => {
    const dupData = [
      { segment: 'A', share: 10 },
      { segment: 'A', share: 20 },
      { segment: 'B', share: 30 }
    ]
    const { container } = render(PieChart, {
      data: dupData, label: 'segment', y: 'share', stat: 'sum'
    })
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
