// packages/chart/src/lib/preset.js

export const defaultPreset = {
  colors: ['blue', 'emerald', 'rose', 'amber', 'violet', 'sky', 'pink', 'teal',
           'orange', 'indigo', 'lime', 'cyan', 'gold', 'lavender'],
  shades: {
    light: { fill: '300', stroke: '700' },
    dark:  { fill: '500', stroke: '200' }
  },
  opacity: {
    area:   0.6,
    box:    0.5,
    violin: 0.5,
    point:  0.8
  },
  patterns: ['diagonal', 'dots', 'triangles', 'hatch', 'lattice', 'swell',
             'checkerboard', 'waves', 'petals'],
  symbols: ['circle', 'square', 'triangle', 'diamond', 'cross', 'star']
}

/**
 * Creates a chart preset by deep-merging overrides with the default preset.
 * All fields are optional. `opacity` is merged key-by-key so partial overrides work.
 * @param {Partial<typeof defaultPreset>} [overrides]
 * @returns {typeof defaultPreset}
 */
export function createChartPreset(overrides = {}) {
  return {
    ...defaultPreset,
    ...overrides,
    shades: overrides.shades
      ? {
          light: { ...defaultPreset.shades.light, ...overrides.shades.light },
          dark:  { ...defaultPreset.shades.dark,  ...overrides.shades.dark  }
        }
      : defaultPreset.shades,
    opacity: { ...defaultPreset.opacity, ...overrides.opacity }
  }
}
