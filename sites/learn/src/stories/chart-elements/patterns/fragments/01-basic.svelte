<script>
  import { DefinePatterns } from '@rokkit/chart/elements'
  import { swatch } from '@rokkit/chart/lib'
  
  // Define patterns for use in charts
  $: patterns = [
    {
      id: 'stripe-pattern',
      component: $swatch.patterns.stripe,
      fill: $swatch.palette.blue[300],
      stroke: $swatch.palette.blue[500]
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