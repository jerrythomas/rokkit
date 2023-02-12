<script>
	export let small = false
	export let label
	export let angle = 0
	export let anchor = 'middle'
	export let x
	export let y

	$: transform = `translate(${x},${y}) rotate(${angle})`
</script>

<text class="label" class:small text-anchor={anchor} {transform}>{label}</text>
