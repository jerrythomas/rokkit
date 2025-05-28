<script>
  import { setContext } from 'svelte';
  import { ChartBrewer } from '../lib/brewing/index.svelte.js';
  
  let {
    data = [],
    width = 600,
    height = 400,
    margin = { top: 20, right: 30, bottom: 40, left: 50 },
    fill = null,
    responsive = true,
    animationDuration = 300
  } = $props();
  
  // Create chart brewer instance
  let brewer = $state(new ChartBrewer({
    width,
    height,
    margin,
    animationDuration
  }));
  
  // Chart dimensions derived from brewer
  let dimensions = $derived(brewer.getDimensions());
  
  // Process data
  $effect(() => {
    // If data has a select method (dataset object), call it to get actual data
    const chartData = data.select && typeof data.select === 'function' ? data.select() : data;
    
    // Update brewer with data and fields
    brewer.setData(chartData);
    brewer.setFields({ color: fill });
    
    // Create scales after setting data
    brewer.createScales();
  });
  
  // Update chart dimensions when props change
  $effect(() => {
    brewer.setDimensions({ width, height, margin });
  });
  
  // Provide chart context to child components
  setContext('chart-brewer', brewer);
  
  // Handle responsive behavior
  let container;
  
  $effect(() => {
    if (!responsive || !container || !document) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      
      const containerWidth = entry.contentRect.width;
      const aspectRatio = height / width;
      
      // Update chart dimensions while maintaining aspect ratio
      brewer.setDimensions({
        width: containerWidth,
        height: containerWidth * aspectRatio
      });
      
      // Update scales after dimensions change
      brewer.createScales();
    });
    
    // Start observing container size
    resizeObserver.observe(container);
    
    return () => {
      resizeObserver.disconnect();
    };
  });
</script>

<div class="chart-container" bind:this={container} data-plot-root>
  <svg
    width={dimensions.width}
    height={dimensions.height}
    viewBox="0 0 {dimensions.width} {dimensions.height}"
    role="img"
    aria-label="Chart visualization"
  >
    <g 
      class="chart-area"
      transform="translate({dimensions.margin.left}, {dimensions.margin.top})"
      data-plot-canvas
    >
      <slot />
    </g>
  </svg>
</div>

<style>
  .chart-container {
    position: relative;
    width: 100%;
    height: auto;
  }
  
  svg {
    display: block;
    overflow: visible;
  }
  
  .chart-area {
    pointer-events: all;
  }
</style>