<script>
	// @ts-nocheck
  import { Symbol } from '@rokkit/chart'
  import { swatch } from '@rokkit/chart/lib'
  import { get } from 'svelte/store'

  const swatchData = get(swatch)
</script>

<!-- Basic symbol usage -->
<svg viewBox="0 0 100 100">
  <Symbol
    x={50}
    y={50}
    name="circle"
    size={8}
    fill={swatchData.palette.blue[500]}
    stroke={swatchData.palette.blue[700]}
  />
</svg>