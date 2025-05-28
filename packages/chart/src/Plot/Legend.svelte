<script>
  import { getContext } from 'svelte';
  import { createLegend, createLegendItemAttributes } from '../lib/brewing/legends.svelte.js';

  let {
    title = '',
    align = 'right',
    verticalAlign = 'top',
    shape = 'rect',
    markerSize = 10,
    onClick = null
  } = $props();

  // Get brewer from context
  const brewer = getContext('chart-brewer');
  
  // Get legend data
  let legendData = $derived(brewer.createLegend({
    title,
    align,
    shape,
    markerSize
  }));
  
  // Track selected items (for filtering)
  let selectedItems = $state([]);
  
  function toggleItem(item) {
    if (!onClick) return;
    
    const isSelected = selectedItems.includes(item.value);
    
    if (isSelected) {
      selectedItems = selectedItems.filter(v => v !== item.value);
    } else {
      selectedItems = [...selectedItems, item.value];
    }
    
    onClick(selectedItems);
  }
</script>

{#if legendData.items.length > 0}
  <g 
    class="chart-legend"
    transform={legendData.transform}
    data-plot-legend
  >
    <!-- Legend title -->
    {#if legendData.title}
      <text
        class="legend-title"
        x="0"
        y="-6"
        text-anchor={align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle'}
        data-plot-legend-title
      >
        {legendData.title}
      </text>
    {/if}
    
    <!-- Legend items -->
    {#each legendData.items as item}
      {@const attrs = createLegendItemAttributes(item)}
      {@const isSelected = selectedItems.includes(item.value)}
      <g 
        {...attrs}
        class="legend-item"
        class:selected={isSelected}
        on:click={() => toggleItem(item)}
      >
        <!-- Shape: circle or rect -->
        {#if item.shape === 'circle'}
          <circle
            cx={item.markerSize / 2}
            cy={item.markerSize / 2}
            r={item.markerSize / 2}
            fill={item.color}
            stroke={isSelected ? 'currentColor' : 'none'}
            stroke-width={isSelected ? 1 : 0}
            data-plot-legend-marker="circle"
          />
        {:else}
          <rect
            width={item.markerSize}
            height={item.markerSize}
            fill={item.color}
            stroke={isSelected ? 'currentColor' : 'none'}
            stroke-width={isSelected ? 1 : 0}
            data-plot-legend-marker="rect"
          />
        {/if}
        
        <!-- Text label -->
        <text
          x={item.markerSize + 5}
          y={item.markerSize - 2}
          text-anchor="start"
          data-plot-legend-label
        >
          {item.value}
        </text>
      </g>
    {/each}
  </g>
{/if}

<style>
  .chart-legend {
    font-size: 12px;
  }
  
  .legend-title {
    font-weight: bold;
    font-size: 14px;
  }
  
  .legend-item {
    cursor: pointer;
  }
  
  .legend-item:hover [data-plot-legend-label] {
    font-weight: 500;
  }
  
  .legend-item.selected [data-plot-legend-label] {
    font-weight: 700;
  }
</style>