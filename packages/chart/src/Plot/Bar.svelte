<script>
  import { getContext } from 'svelte';
  import { ChartBrewer } from '../lib/brewing/index.svelte.js';

  let {
    x = null,
    y = null,
    fill = null,
    color = "#4682b4",
    opacity = 1,
    animationDuration = 300,
    onClick = null
  } = $props();

  // Get brewer from context
  const brewer = getContext('chart-brewer');
  
  // Set field mappings in the brewer
  $effect(() => {
    brewer.setFields({
      x,
      y,
      color: fill
    });
    
    // Ensure scales are updated
    brewer.createScales();
  });
  
  // Compute bars whenever data or fields change
  let bars = $derived(brewer.createBars());
  
  // Animation transition values
  let initialY = $state(0);
  let initialHeight = $state(0);
  
  // Handle resetting animation state for new bars
  $effect(() => {
    if (bars && bars.length > 0) {
      initialY = brewer.getDimensions().innerHeight;
      initialHeight = 0;
      
      // Reset to actual positions after a delay
      setTimeout(() => {
        initialY = 0;
        initialHeight = 0;
      }, 10);
    }
  });
  
  // Handle bar click
  function handleClick(event, bar) {
    if (onClick) onClick(bar.data, event);
  }
</script>

{#if bars && bars.length > 0}
  <g class="chart-bars" data-plot-type="bar">
    {#each bars as bar, i (bar.data[x])}
      {@const barY = initialY > 0 ? brewer.getDimensions().innerHeight : bar.y}
      {@const barHeight = initialHeight > 0 ? 0 : bar.height}
      
      <rect
        class="bar"
        x={bar.x}
        y={barY}
        width={bar.width}
        height={barHeight}
        fill={bar.color}
        opacity={opacity}
        on:click={(event) => handleClick(event, bar)}
        on:mouseenter={(event) => {
          event.target.setAttribute('opacity', Math.min(opacity + 0.2, 1));
        }}
        on:mouseleave={(event) => {
          event.target.setAttribute('opacity', opacity);
        }}
        style="transition: y {animationDuration}ms ease, height {animationDuration}ms ease;"
        role="graphics-symbol"
        aria-label="Bar representing {bar.data[x]} with value {bar.data[y]}"
        data-plot-element="bar"
        data-plot-value={bar.data[y]}
        data-plot-category={bar.data[x]}
      >
        <title>{bar.data[x]}: {bar.data[y]}</title>
      </rect>
    {/each}
  </g>
{/if}

<style>
  .chart-bars .bar {
    cursor: pointer;
  }
</style>