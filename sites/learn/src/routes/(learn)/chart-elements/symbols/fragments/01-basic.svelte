<script>
  import { Symbol } from '@rokkit/chart'
  import { swatch } from '@rokkit/chart/lib'
</script>

<!-- Basic symbol usage -->
<svg viewBox="0 0 100 100">
  <Symbol 
    x={50} 
    y={50} 
    name="circle" 
    size={8}
    fill={$swatch.palette.blue[500]}
    stroke={$swatch.palette.blue[700]}
  />
</svg>