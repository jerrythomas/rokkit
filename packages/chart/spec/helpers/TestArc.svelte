<script>
  import { setContext } from 'svelte'
  import Arc from '../../src/geoms/Arc.svelte'
  import { createMockState } from '../helpers/mock-plot-state.js'

  let { state = createMockState(), theta = 'hwy', color = 'class' } = $props()
  setContext('plot-state', state)
</script>

<svg>
  <Arc {theta} {color} />
</svg>
