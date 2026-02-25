<script>
  import { swatch } from '@rokkit/chart/lib'
  import { get } from 'svelte/store'

  // Access color palettes
  const swatchData = get(swatch)
  const blueShades = swatchData.palette.blue
  const primaryColor = swatchData.palette.blue[500]
</script>

<!-- Use colors in your charts -->
<div style="background-color: {primaryColor}">
  Primary Blue
</div>