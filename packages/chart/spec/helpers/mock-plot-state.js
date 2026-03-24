import { scaleBand, scaleLinear } from 'd3-scale'

/**
 * Creates a minimal PlotState-compatible object for testing infrastructure
 * components (Axis, Grid, Legend) without needing a real PlotState instance.
 *
 * @param {Partial<import('../../src/PlotState.svelte.js').PlotState>} overrides
 */
export function createMockState(overrides = {}) {
  const xScale = scaleBand().domain(['a', 'b', 'c']).range([0, 300]).padding(0.1)
  const yScale = scaleLinear().domain([0, 100]).range([200, 0])

  return {
    xScale,
    yScale,
    innerWidth: 300,
    innerHeight: 200,
    xAxisY: 200,
    yAxisX: 0,
    orientation: 'vertical',
    colorScaleType: 'categorical',
    colors: new Map([
      ['a', { fill: '#4e79a7', stroke: '#4e79a7' }],
      ['b', { fill: '#f28e2b', stroke: '#f28e2b' }]
    ]),
    patterns: new Map(),
    preset: () => ({
      colors: ['#4e79a7', '#f28e2b', '#e15759'],
      patterns: [],
      symbols: []
    }),
    geomData: (_id) => [],
    registerGeom: (_id, _config) => {},
    unregisterGeom: (_id) => {},
    ...overrides
  }
}
