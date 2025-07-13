<script>
  import { swatch } from '@rokkit/chart/lib'
  
  // Access color palettes
  $: blueShades = $swatch.palette.blue
  $: primaryColor = $swatch.palette.blue[500]
</script>

<!-- Use colors in your charts -->
<div style="background-color: {primaryColor}">
  Primary Blue
</div>