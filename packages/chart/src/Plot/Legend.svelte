<script>
  import { getContext } from 'svelte'
  import { toPatternId } from '../lib/brewing/patterns.js'

  /** @type {Record<string, string>} */
  let { labels = {} } = $props()

  const state = getContext('plot-state')

  const isCategorical = $derived(state.colorScaleType === 'categorical')

  const categoricalItems = $derived(
    [...(state.colors?.entries() ?? [])].map(([key, entry]) => ({
      key,
      label: labels[String(key)] ?? String(key),
      fill: entry.fill,
      patternId: state.patterns?.has(key) ? toPatternId(String(key)) : null
    }))
  )

  const gradientStyle = $derived.by(() => {
    if (isCategorical) return ''
    return `background: linear-gradient(to right, #cfe2f3, #084594)`
  })
</script>

{#if isCategorical}
  <div class="legend categorical" data-plot-legend>
    {#each categoricalItems as item (item.key)}
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
{:else}
  <div class="legend gradient" data-plot-legend>
    <div class="gradient-bar" style={gradientStyle} data-plot-legend-gradient></div>
  </div>
{/if}

<style>
  .legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; font-size: 12px; }
  .legend-item { display: flex; align-items: center; gap: 4px; }
  .swatch { display: inline-block; width: 14px; height: 14px; border-radius: 2px; flex-shrink: 0; }
  .gradient-bar { width: 180px; height: 14px; border-radius: 2px; }
</style>
