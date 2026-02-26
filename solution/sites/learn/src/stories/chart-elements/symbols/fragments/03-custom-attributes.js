// @ts-nocheck
// Advanced symbol configuration
import { swatch } from '@rokkit/chart/lib'

// Create symbols with varying properties
const scatterData = data.map((point, index) => ({
  x: point.x,
  y: point.y,
  symbol: {
    name: point.category === 'high' ? 'diamond' : 'circle',
    size: point.value > 50 ? 8 : 5, // Size based on value
    fill: swatch.palette[point.color][400],
    stroke: swatch.palette[point.color][700],
    strokeWidth: point.highlighted ? 2 : 1,
    opacity: point.active ? 1 : 0.6
  }
}))

// Custom symbol themes
const symbolThemes = {
  business: {
    primary: { name: 'square', fill: '#2563eb' },
    secondary: { name: 'circle', fill: '#7c3aed' },
    accent: { name: 'triangle', fill: '#dc2626' }
  },
  scientific: {
    control: { name: 'circle', fill: '#059669' },
    experimental: { name: 'diamond', fill: '#ea580c' },
    outlier: { name: 'cross', fill: '#dc2626' }
  }
}