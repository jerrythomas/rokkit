<script>
	import Symbol from './Symbol.svelte'
	import Texture from './Texture.svelte'

	export let pattern
	export let shape = 'circle'
	export let fill
	export let stroke

	const size = 40
</script>

<svg viewBox="0 0 {size} {size}">
	<Symbol
		x={size / 2}
		y={size / 2}
		{size}
		fill={pattern.fillUrl || fill}
		{stroke}
		{shape}
	/>
	{#if pattern}
		<defs>
			<Texture {...pattern} />
		</defs>
	{/if}
</svg>
