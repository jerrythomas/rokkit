<script>
	import NamedPattern from './paths/NamedPattern.svelte'

	export let size = 10
	export let thickness = 0.5
	export let stroke = 'currentColor'
</script>

<NamedPattern {size} {thickness} {stroke} name="curvedWave" />
