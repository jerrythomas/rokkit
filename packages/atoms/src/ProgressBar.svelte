<script>
	let className = ''
	export { className as class }
	export let value = null
	export let max = null
	export let height = '1.5mm'
	export let width = 10

	$: indeterminate = value === null || max === null
	$: percentage = indeterminate ? width : value / max
</script>

<progress-bar class:indeterminate class="flex w-full {className}" style:height>
	<value-bar style:width="{percentage}%" style:height />
</progress-bar>
