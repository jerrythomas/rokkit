<script>
	import NamedPattern from './paths/NamedPattern.svelte'

	let { size = 10, thickness = 0.5, stroke = 'currentColor' } = $props()
</script>

<NamedPattern {size} {thickness} {stroke} name="curvedWave" />
