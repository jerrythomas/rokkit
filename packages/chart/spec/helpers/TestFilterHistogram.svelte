<script>
	import { setContext } from 'svelte'
	import FilterHistogram from '../../src/crossfilter/FilterHistogram.svelte'
	let { cf = undefined, data, field, label, bins, width, height, color, dimColor } = $props()
	setContext('crossfilter', cf)
</script>

<FilterHistogram {data} {field} {label} {bins} {width} {height} {color} {dimColor} />
