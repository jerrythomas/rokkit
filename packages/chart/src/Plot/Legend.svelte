<script>
  import { getContext } from 'svelte'
  import { toPatternId } from '../lib/brewing/patterns.js'
  import { buildSymbolPath } from '../lib/brewing/marks/points.js'

  /** @type {Record<string, string>} */
  let { labels = {} } = $props()

  const state = getContext('plot-state')

  const isCategorical = $derived(state.colorScaleType === 'categorical')
  const isLineGeom    = $derived(state.geomTypes?.has('line') ?? false)
  const isPointGeom   = $derived(state.geomTypes?.has('point') ?? false)
  const hasSymbols    = $derived((state.symbols?.size ?? 0) > 0)

  // Split conditions
  const splitPattern = $derived(
    !!state.colorField && !!state.patternField && state.colorField !== state.patternField
  )
  const splitSymbol = $derived(
    hasSymbols && !!state.colorField && !!state.symbolField && state.colorField !== state.symbolField
  )
  const symbolOnly = $derived(hasSymbols && !state.colorField)

  // Color section items — combined with same-field pattern/symbol overlays
  const colorItems = $derived(
    [...(state.colors?.entries() ?? [])].map(([key, entry]) => ({
      key,
      label: labels[String(key)] ?? String(key),
      fill: entry.fill,
      patternId: !splitPattern && state.patterns?.has(key) ? toPatternId(String(key)) : null,
      symbolShape: !splitSymbol && state.symbols?.get(key) ? state.symbols.get(key) : null
    }))
  )

  // Pattern section — only when pattern encodes a different field than color
  const patternItems = $derived(
    splitPattern
      ? [...(state.patterns?.entries() ?? [])].map(([key]) => ({
          key,
          label: labels[String(key)] ?? String(key),
          patternId: toPatternId(String(key))
        }))
      : []
  )

  // Symbol section — only when symbol encodes a different field than color, or symbol-only
  const symbolItems = $derived(
    splitSymbol || symbolOnly
      ? [...(state.symbols?.entries() ?? [])].map(([key, shape]) => ({
          key,
          label: labels[String(key)] ?? String(key),
          shape,
          fill: state.colors?.get(key)?.fill ?? '#888'
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

    <!-- Symbol-only: no color field, just symbol shapes -->
    {#if symbolOnly}
      <div class="legend categorical">
        {#each symbolItems as item (item.key)}
          <div class="legend-item" data-plot-legend-item>
            <svg width="14" height="14" data-plot-legend-swatch>
              <path transform="translate(7,7)" d={buildSymbolPath(item.shape, 5)} fill={item.fill} />
            </svg>
            <span class="label" data-plot-legend-label>{item.label}</span>
          </div>
        {/each}
      </div>

    <!-- Color section (line, point, or fill swatches) -->
    {:else if colorItems.length > 0}
      <div class="legend categorical">
        {#each colorItems as item (item.key)}
          <div class="legend-item" data-plot-legend-item>
            {#if isLineGeom}
              <!-- Line swatch with optional combined symbol -->
              <svg width="24" height="14" data-plot-legend-swatch>
                <line x1="2" y1="7" x2="22" y2="7" stroke={item.fill} stroke-width="2" stroke-linecap="round" />
                {#if item.symbolShape}
                  <path transform="translate(12,7)" d={buildSymbolPath(item.symbolShape, 4)} fill={item.fill} />
                {/if}
              </svg>
            {:else if isPointGeom && item.symbolShape}
              <!-- Symbol shape swatch for scatter -->
              <svg width="14" height="14" data-plot-legend-swatch>
                <path transform="translate(7,7)" d={buildSymbolPath(item.symbolShape, 5)} fill={item.fill} />
              </svg>
            {:else if item.patternId}
              <!-- Fill + pattern overlay -->
              <svg width="14" height="14" data-plot-legend-swatch>
                <rect width="14" height="14" fill={item.fill} />
                <rect width="14" height="14" fill="url(#{item.patternId})" />
              </svg>
            {:else}
              <!-- Plain fill swatch -->
              <span class="swatch" style:background-color={item.fill} data-plot-legend-swatch></span>
            {/if}
            <span class="label" data-plot-legend-label>{item.label}</span>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Pattern section (different field from color) -->
    {#if patternItems.length > 0}
      <div class="legend categorical legend-section">
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

    <!-- Symbol section (different field from color) -->
    {#if symbolItems.length > 0 && !symbolOnly}
      <div class="legend categorical legend-section">
        {#each symbolItems as item (item.key)}
          <div class="legend-item" data-plot-legend-item>
            {#if isLineGeom}
              <svg width="24" height="14" data-plot-legend-swatch>
                <line x1="2" y1="7" x2="22" y2="7" stroke={item.fill} stroke-width="2" stroke-linecap="round" stroke-dasharray="4 2" />
                <path transform="translate(12,7)" d={buildSymbolPath(item.shape, 4)} fill={item.fill} />
              </svg>
            {:else}
              <svg width="14" height="14" data-plot-legend-swatch>
                <path transform="translate(7,7)" d={buildSymbolPath(item.shape, 5)} fill={item.fill} />
              </svg>
            {/if}
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
  .legend-section { border-top: 1px solid var(--color-surface-z3, #e0e0e0); padding-top: 6px; }
  .legend-item { display: flex; align-items: center; gap: 4px; }
  .swatch { display: inline-block; width: 14px; height: 14px; border-radius: 2px; flex-shrink: 0; }
  .gradient-bar { width: 180px; height: 14px; border-radius: 2px; }
</style>
