import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import TestArc from '../helpers/TestArc.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

describe('Arc geom (smoke)', () => {
  it('renders without crashing when data is empty', () => {
    const state = createMockState({ geomData: () => [] })
    expect(() => render(TestArc, { props: { state } })).not.toThrow()
  })

  it('renders arc paths for non-empty data', () => {
    const pieData = [
      { class: 'compact', hwy: 29 },
      { class: 'suv', hwy: 18 }
    ]
    const state = createMockState({
      geomData: () => pieData,
      colors: new Map([
        ['compact', { fill: '#4e79a7', stroke: '#4e79a7' }],
        ['suv', { fill: '#f28e2b', stroke: '#f28e2b' }]
      ]),
      innerWidth: 300,
      innerHeight: 200
    })
    const { container } = render(TestArc, { props: { state } })
    const paths = container.querySelectorAll('[data-plot-element="arc"]')
    expect(paths.length).toBe(2)
  })
})
