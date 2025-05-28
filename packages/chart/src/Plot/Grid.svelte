<script>
  import { getContext } from 'svelte';
  import { createGrid } from '../lib/brewing/axes.svelte.js';

  let {
    direction = 'both',
    xTicks = null,
    yTicks = null,
    color = 'currentColor',
    opacity = 0.1,
    lineStyle = 'solid'
  } = $props();

  // Get brewer from context
  const brewer = getContext('chart-brewer');
  
  // Get grid data
  let gridData = $derived(brewer.createGrid({ 
    direction, 
    xTickCount: xTicks, 
    yTickCount: yTicks 
  }));

  // Convert lineStyle to stroke-dasharray
  let strokeDasharray = $derived(
    lineStyle === 'dashed' ? '5,5' : 
    lineStyle === 'dotted' ? '1,3' : 
    'none'
  );
</script>

<g class="chart-grid" data-plot-grid={direction}>
  {#if direction === 'x' || direction === 'both'}
    {#each gridData.xLines as line}
      <line
        data-plot-grid-line="x"
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        stroke={color}
        stroke-opacity={opacity}
        stroke-dasharray={strokeDasharray}
      />
    {/each}
  {/if}

  {#if direction === 'y' || direction === 'both'}
    {#each gridData.yLines as line}
      <line
        data-plot-grid-line="y"
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        stroke={color}
        stroke-opacity={opacity}
        stroke-dasharray={strokeDasharray}
      />
    {/each}
  {/if}
</g>

<style>
  .chart-grid {
    pointer-events: none;
  }
</style>