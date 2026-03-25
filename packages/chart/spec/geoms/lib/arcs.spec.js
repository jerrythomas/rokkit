import { describe, it, expect } from 'vitest'
import { buildArcs } from '../../../src/lib/brewing/marks/arcs.js'

const colors = new Map([
  ['compact', { fill: '#4e79a7', stroke: '#fff' }],
  ['suv',     { fill: '#f28e2b', stroke: '#fff' }]
])

const data = [
  { segment: 'compact', hwy: 29 },
  { segment: 'suv',     hwy: 18 }
]

describe('buildArcs — color channel drives fill lookup', () => {
  it('returns one arc per datum', () => {
    const arcs = buildArcs(data, { color: 'segment', y: 'hwy' }, colors, 300, 300)
    expect(arcs).toHaveLength(2)
  })

  it('arc has d (SVG path), fill, stroke, key', () => {
    const [arc] = buildArcs(data, { color: 'segment', y: 'hwy' }, colors, 300, 300)
    expect(arc).toHaveProperty('d')
    expect(arc).toHaveProperty('fill')
    expect(arc).toHaveProperty('stroke')
    expect(arc).toHaveProperty('key')
  })

  it('uses color channel value as key for colors Map lookup', () => {
    const arcs = buildArcs(data, { color: 'segment', y: 'hwy' }, colors, 300, 300)
    const compact = arcs.find((a) => a.key === 'compact')
    expect(compact).toBeDefined()
    expect(compact.fill).toBe('#4e79a7')
  })

  it('arc d is a non-empty SVG path string with no NaN', () => {
    const arcs = buildArcs(data, { color: 'segment', y: 'hwy' }, colors, 300, 300)
    for (const arc of arcs) {
      expect(typeof arc.d).toBe('string')
      expect(arc.d.length).toBeGreaterThan(0)
      expect(arc.d).not.toContain('NaN')
    }
  })

  it('falls back to default fill (#888) when color key is absent from colors Map', () => {
    const [arc] = buildArcs(
      [{ segment: 'unknown', hwy: 50 }],
      { color: 'segment', y: 'hwy' },
      colors,
      300,
      300
    )
    expect(arc.fill).toBe('#888')
  })

  it('innerRadius option produces donut arcs', () => {
    const solidArcs  = buildArcs(data, { color: 'segment', y: 'hwy' }, colors, 300, 300, { innerRadius: 0 })
    const donutArcs  = buildArcs(data, { color: 'segment', y: 'hwy' }, colors, 300, 300, { innerRadius: 50 })
    // Donut arcs have a different path (inner cutout changes the M/A commands)
    expect(donutArcs[0].d).not.toBe(solidArcs[0].d)
  })
})
