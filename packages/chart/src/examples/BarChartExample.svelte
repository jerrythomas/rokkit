<script lang="ts">
	import { Plot } from '../index.js'
	import { dataset } from '@rokkit/data'

	type Row = Record<string, unknown>

	// Sample data
	const sampleData = [
		{ model: 'Model A', name: 'Product 1', category: 'Electronics', count: 45 },
		{ model: 'Model B', name: 'Product 2', category: 'Clothing', count: 32 },
		{ model: 'Model C', name: 'Product 3', category: 'Electronics', count: 62 },
		{ model: 'Model D', name: 'Product 4', category: 'Home', count: 28 },
		{ model: 'Model E', name: 'Product 5', category: 'Electronics', count: 53 },
		{ model: 'Model F', name: 'Product 6', category: 'Clothing', count: 24 },
		{ model: 'Model G', name: 'Product 7', category: 'Home', count: 35 }
	]

	// Use the dataset class to process the data
	const data: Row[] = dataset(sampleData)
		.groupBy('category')
		.summarize('name', { count: (values: unknown[]) => values.length })
		.rollup()
		.select()

	// Chart dimensions
	const width = 600
	const height = 400
	const margin = { top: 20, right: 100, bottom: 60, left: 60 }
</script>

<div class="example">
	<h2>Bar Chart Example</h2>

	<div class="chart-wrapper">
		<Plot.Root {data} x="category" y="count" color="category" {width} {height} {margin}>
			<Plot.Grid />
			<Plot.Axis type="x" label="Product Category" />
			<Plot.Axis type="y" label="Number of Products" />
			<Plot.Bar {data} x="category" y="count" fill="category" />
			<Plot.Legend labels={{ category: 'Categories' }} />
		</Plot.Root>
	</div>

	<div class="code-example">
		<h3>Example Code:</h3>
		<pre>
<!-- &lt;script&gt;
  import { Plot } from '@rokkit/chart';
  import { dataset } from '@rokkit/data';

  // Sample data
  const sampleData = [
    { model: 'Model A', name: 'Product 1', category: 'Electronics', count: 45 },
    { model: 'Model B', name: 'Product 2', category: 'Clothing', count: 32 },
    { model: 'Model C', name: 'Product 3', category: 'Electronics', count: 62 },
    { model: 'Model D', name: 'Product 4', category: 'Home', count: 28 },
    { model: 'Model E', name: 'Product 5', category: 'Electronics', count: 53 },
    { model: 'Model F', name: 'Product 6', category: 'Clothing', count: 24 },
    { model: 'Model G', name: 'Product 7', category: 'Home', count: 35 },
  ];

  // Use the dataset class to process the data
  const data = dataset(sampleData)
    .groupBy('category')
    .summarize('name', { count: values => values.length })
    .rollup();
&lt;/script&gt;

&lt;Plot.Root {data} width={600} height={400} margin={{ top: 20, right: 100, bottom: 60, left: 60 }} fill="category"&gt;
  &lt;Plot.Grid direction="y" lineStyle="dashed" /&gt;
  &lt;Plot.Axis type="x" field="category" label="Product Category" /&gt;
  &lt;Plot.Axis type="y" field="count" label="Number of Products" /&gt;
  &lt;Plot.Bar x="category" y="count" fill="category" onClick={handleBarClick} /&gt;
  &lt;Plot.Legend title="Categories" /&gt;
&lt;/Plot.Root&gt; -->
    </pre>
	</div>
</div>
