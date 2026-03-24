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

  function handleLow(e) {
    low = Math.min(Number(e.currentTarget.value), high)
    cf?.setRange(field, [low, high])
  }

  function handleHigh(e) {
    high = Math.max(Number(e.currentTarget.value), low)
    cf?.setRange(field, [low, high])
  }
</script>

<div class="filter-slider" data-filter-slider data-filter-field={field}>
  {#if label}
    <span class="label" data-filter-slider-label>{label}</span>
  {/if}
  <div class="inputs">
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
  <div class="range-display" data-filter-slider-display>
    {low} – {high}
  </div>
</div>

<style>
  .filter-slider {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
  }
  .inputs {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .label {
    font-weight: 600;
  }
  .range-display {
    color: currentColor;
    opacity: 0.7;
  }
</style>
