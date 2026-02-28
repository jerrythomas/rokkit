// @ts-nocheck
// Generate a color sequence for multiple data series
import { swatch } from '@rokkit/chart/lib'

// Get colors for a 4-series chart
const seriesColors = [
  swatch.palette.blue[500],
  swatch.palette.green[500], 
  swatch.palette.orange[500],
  swatch.palette.red[500]
]

// Or use different shades of the same color
const blueGradient = [
  swatch.palette.blue[300],
  swatch.palette.blue[500],
  swatch.palette.blue[700],
  swatch.palette.blue[900]
]