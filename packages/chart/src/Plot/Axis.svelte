<script>
  import { getContext } from 'svelte';
  import { createXAxis, createYAxis, createTickAttributes } from '../lib/brewing/axes.svelte.js';

  let {
    type = 'x',
    field = null,
    label = '',
    ticks = null,
    tickFormat = null,
    grid = false
  } = $props();

  // Get brewer from context
  const brewer = getContext('chart-brewer');
  
  // Set field mappings in the brewer
  $effect(() => {
    if (field) {
      brewer.setFields({
        [type]: field
      });
      
      // Ensure scales are updated
      brewer.createScales();
    }
  });
  
  // Compute axis data whenever scales change
  let axisData = $derived(
    type === 'x' 
      ? brewer.createXAxis({ tickCount: ticks, tickFormat, label }) 
      : brewer.createYAxis({ tickCount: ticks, tickFormat, label })
  );
</script>

<g 
  class="axis {type}-axis"
  transform={axisData.transform}
  data-plot-axis={type}
>
  {#if axisData.ticks.length > 0}
    <!-- Axis line -->
    <line
      data-plot-axis-line
      x1={type === 'x' ? 0 : 0}
      y1={type === 'x' ? 0 : 0}
      x2={type === 'x' ? brewer.getDimensions().innerWidth : 0}
      y2={type === 'x' ? 0 : brewer.getDimensions().innerHeight}
      stroke="currentColor"
    />
    
    <!-- Ticks -->
    {#each axisData.ticks as tick}
      {@const attrs = createTickAttributes(tick, type)}
      <g {...attrs}>
        <line 
          x1="0" 
          y1="0" 
          x2={type === 'x' ? 0 : -6} 
          y2={type === 'x' ? 6 : 0} 
          stroke="currentColor"
        />
        <text 
          x={type === 'x' ? 0 : -9}
          y={type === 'x' ? 9 : 0}
          data-plot-tick-label
        >
          {tick.formattedValue}
        </text>
      </g>
    {/each}
    
    <!-- Axis label -->
    {#if label}
      <text
        class="axis-label {type}-axis-label"
        transform={axisData.labelTransform}
        text-anchor="middle"
        data-plot-axis-label
      >
        {label}
      </text>
    {/if}
  {/if}
</g>

<style>
  .axis {
    font-size: 12px;
  }
  
  .axis-label {
    font-size: 14px;
    font-weight: 500;
    fill: currentColor;
  }
  
  [data-plot-tick-label] {
    font-size: 11px;
    fill: currentColor;
  }
</style>