<script>
  import { getContext } from 'svelte'

  /**
   * Dual range slider for a continuous crossfilter dimension.
   * NOTE: Interim implementation using HTML range inputs.
   * The spec calls for a Plot+Point+brush architecture, deferred until brush geom is implemented.
   */
  let { field, min, max, step = 0.1, label = '' } = $props()

  const cf = getContext('crossfilter')

  let low  = $state(min ?? 0)
  let high = $state(max ?? 100)

  // Reset slider to full range when min/max props change
  $effect(() => {
    low = min
    high = max
  })

  function handleLow(e) {
    low = Math.min(Number(e.currentTarget.value), high)
    cf?.setRange(field, [low, high])
  }

  function handleHigh(e) {
    high = Math.max(Number(e.currentTarget.value), low)
    cf?.setRange(field, [low, high])
  }
</script>

<div data-filter-slider data-filter-field={field}>
  {#if label}
    <span data-filter-slider-label>{label}</span>
  {/if}
  <div data-filter-slider-inputs>
    <input
      type="range"
      {min} {max} {step}
      value={low}
      oninput={handleLow}
      aria-label="Minimum {label || field}"
      data-filter-slider-low
    />
    <input
      type="range"
      {min} {max} {step}
      value={high}
      oninput={handleHigh}
      aria-label="Maximum {label || field}"
      data-filter-slider-high
    />
  </div>
  <div data-filter-slider-display>
    {low} – {high}
  </div>
</div>

<style>
  [data-filter-slider] {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
  }
  [data-filter-slider-inputs] {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  [data-filter-slider-label] {
    font-weight: 600;
  }
  [data-filter-slider-display] {
    color: currentColor;
    opacity: 0.7;
  }
</style>
