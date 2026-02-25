<script>
  import { DefinePatterns } from '@rokkit/chart/elements'
  import { swatch } from '@rokkit/chart/lib'
  import { get } from 'svelte/store'

  const swatchData = get(swatch)

  // Define patterns for use in charts
  const patterns = [
    {
      id: 'stripe-pattern',
      component: swatchData.patterns.stripe,
      fill: swatchData.palette.blue[300],
      stroke: swatchData.palette.blue[500]
    }
  ]
</script>

<svg viewBox="0 0 100 100">
  <DefinePatterns {patterns} size={10} />
  
  <!-- Use pattern in chart elements -->
  <rect 
    x="10" y="10" 
    width="80" height="80" 
    fill="url(#stripe-pattern)" 
  />
</svg>