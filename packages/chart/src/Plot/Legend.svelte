<script>
  import { getContext } from 'svelte'
  import { toPatternId } from '../lib/brewing/patterns.js'

  /** @type {Record<string, string>} */
  let { labels = {} } = $props()

  const state = getContext('plot-state')

  const isCategorical = $derived(state.colorScaleType === 'categorical')

  // True when color and pattern encode different fields (two separate legends needed)
  const splitLegend = $derived(
    !!state.colorField && !!state.patternField && state.colorField !== state.patternField
  )

  const colorItems = $derived(
    [...(state.colors?.entries() ?? [])].map(([key, entry]) => ({
      key,
      label: labels[String(key)] ?? String(key),
      fill: entry.fill,
      // Only show pattern overlay on color items when same field encodes both
      patternId: !splitLegend && state.patterns?.has(key) ? toPatternId(String(key)) : null
    }))
  )

  const patternItems = $derived(
    splitLegend
      ? [...(state.patterns?.entries() ?? [])].map(([key]) => ({
          key,
          label: labels[String(key)] ?? String(key),
          patternId: toPatternId(String(key))
        }))
      : []
  )

  const gradientStyle = $derived.by(() => {
    if (isCategorical) return ''
    return `background: linear-gradient(to right, #cfe2f3, #084594)`
  })
</script>

{#if isCategorical}
  <div class="legend-root" data-plot-legend>
    <div class="legend categorical">
      {#each colorItems as item (item.key)}
        <div class="legend-item" data-plot-legend-item>
          {#if item.patternId}
            <svg width="14" height="14" data-plot-legend-swatch>
              <rect width="14" height="14" fill={item.fill} />
              <rect width="14" height="14" fill="url(#{item.patternId})" />
            </svg>
          {:else}
            <span class="swatch" style:background-color={item.fill} data-plot-legend-swatch></span>
          {/if}
          <span class="label" data-plot-legend-label>{item.label}</span>
        </div>
      {/each}
    </div>

    {#if splitLegend && patternItems.length > 0}
      <div class="legend categorical legend-patterns">
        {#each patternItems as item (item.key)}
          <div class="legend-item" data-plot-legend-item>
            <svg width="14" height="14" data-plot-legend-swatch>
              <rect width="14" height="14" fill="var(--color-surface-z2, #ccc)" />
              <rect width="14" height="14" fill="url(#{item.patternId})" />
            </svg>
            <span class="label" data-plot-legend-label>{item.label}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <div class="legend gradient" data-plot-legend>
    <div class="gradient-bar" style={gradientStyle} data-plot-legend-gradient></div>
  </div>
{/if}

<style>
  .legend-root { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
  .legend { display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; }
  .legend-patterns { border-top: 1px solid var(--color-surface-z3, #e0e0e0); padding-top: 6px; }
  .legend-item { display: flex; align-items: center; gap: 4px; }
  .swatch { display: inline-block; width: 14px; height: 14px; border-radius: 2px; flex-shrink: 0; }
  .gradient-bar { width: 180px; height: 14px; border-radius: 2px; }
</style>
