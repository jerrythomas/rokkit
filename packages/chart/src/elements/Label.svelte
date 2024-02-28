<script>
	export let x
	export let y
	export let text
	export let angle = 0
	export let small = false
	export let anchor = 'middle'


	$: transform = `translate(${x},${y}) rotate(${angle})`
	$: anchor = ['start','middle','end'].includes(anchor) ? anchor : 'middle'
</script>

<text class="label" class:small text-anchor={anchor} {transform}>{text}</text>
