<script>
	import { setContext, untrack } from 'svelte'
	import FilterHistogram from '../../src/crossfilter/FilterHistogram.svelte'
	let { cf = undefined, data, field, label, bins, width, height, color, dimColor } = $props()
	setContext('crossfilter', untrack(() => cf))
</script>

<FilterHistogram {data} {field} {label} {bins} {width} {height} {color} {dimColor} />
