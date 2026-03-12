<script>
	let {
		x,
		y,
		text,
		angle = 0,
		small = false,
		anchor = 'middle'
	} = $props()

	let transform = $derived(`translate(${x},${y}) rotate(${angle})`)
	let validAnchor = $derived(['start', 'middle', 'end'].includes(anchor) ? anchor : 'middle')
</script>

<text class="label" class:small text-anchor={validAnchor} {transform}>{text}</text>
