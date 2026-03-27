<script>
	import CrossFilter from '../../src/crossfilter/CrossFilter.svelte'
	import TestCrossFilterChild from './TestCrossFilterChild.svelte'

	let { mode = 'dim' } = $props()
</script>

<CrossFilter {mode}>
	<TestCrossFilterChild />
</CrossFilter>
