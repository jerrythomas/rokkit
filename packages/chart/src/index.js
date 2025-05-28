import Root from './Plot/Root.svelte';
import Axis from './Plot/Axis.svelte';
import Bar from './Plot/Bar.svelte';
import Grid from './Plot/Grid.svelte';
import Legend from './Plot/Legend.svelte';

// Export components
export const Plot = {
  Root,
  Axis,
  Bar,
  Grid,
  Legend
};

// Export utilities
export { ChartBrewer } from './lib/brewing/index.svelte.js';
export * from './lib/brewing/index.svelte.js';
