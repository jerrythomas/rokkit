import { getContext, setContext } from 'svelte';
import { writable, derived } from 'svelte/store';
import * as d3 from 'd3';

const CHART_CONTEXT = 'chart-context';

/**
 * Creates chart context and provides it to child components
 * 
 * @param {Object} options Initial chart options
 * @returns {Object} Chart context with all stores and methods
 */
export function createChartContext(options = {}) {
  // Default config values
  const defaultOptions = {
    width: 600,
    height: 400,
    margin: { top: 20, right: 30, bottom: 40, left: 50 },
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    responsive: true,
    animationDuration: 300,
    data: []
  };
  
  // Merge options with defaults
  const config = { ...defaultOptions, ...options };
  
  // Create stores for reactive properties
  const dimensions = writable({
    width: config.width,
    height: config.height,
    margin: { ...config.margin },
    padding: { ...config.padding }
  });
  
  const data = writable(config.data);
  const scales = writable({});
  
  // Compute inner dimensions (subtracting margins)
  const innerDimensions = derived(dimensions, $dimensions => {
    return {
      width: $dimensions.width - $dimensions.margin.left - $dimensions.margin.right - $dimensions.padding.left - $dimensions.padding.right,
      height: $dimensions.height - $dimensions.margin.top - $dimensions.margin.bottom - $dimensions.padding.top - $dimensions.padding.bottom
    };
  });
  
  // Store for plot elements (bars, lines, etc.)
  const plots = writable([]);
  
  // Store for axes
  const axes = writable({
    x: null,
    y: null
  });
  
  const legend = writable({
    enabled: false,
    items: []
  });
  
  // Helper to add a new plot
  function addPlot(plot) {
    plots.update(currentPlots => [...currentPlots, plot]);
    return () => {
      plots.update(currentPlots => currentPlots.filter(p => p !== plot));
    };
  }
  
  // Helper to update scales based on data and dimensions
  function updateScales(xKey, yKey, colorKey = null) {
    return derived([data, innerDimensions], ([$data, $innerDimensions]) => {
      if (!$data || $data.length === 0) return null;
      
      const xScale = d3.scaleBand()
        .domain($data.map(d => d[xKey]))
        .range([0, $innerDimensions.width])
        .padding(0.2);
      
      const yScale = d3.scaleLinear()
        .domain([0, d3.max($data, d => d[yKey])])
        .nice()
        .range([$innerDimensions.height, 0]);
      
      let colorScale = null;
      
      if (colorKey) {
        const uniqueCategories = [...new Set($data.map(d => d[colorKey]))];
        colorScale = d3.scaleOrdinal()
          .domain(uniqueCategories)
          .range(d3.schemeCategory10);
      }
      
      return { xScale, yScale, colorScale };
    });
  }
  
  // Create and set context
  const chartContext = {
    dimensions,
    innerDimensions,
    data,
    scales,
    plots,
    axes,
    legend,
    addPlot,
    updateScales
  };
  
  setContext(CHART_CONTEXT, chartContext);
  
  return chartContext;
}

/**
 * Gets chart context provided by parent component
 * 
 * @returns {Object} Chart context
 */
export function getChartContext() {
  return getContext(CHART_CONTEXT);
}