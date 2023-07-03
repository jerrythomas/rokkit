<script>
	import { Icon } from '@rokkit/atoms'

	let count = 0
	function handleClick() {
		count += 1
	}
</script>

<span class="flex items-center justify-start gap-2 py-2">
	{#each ['small', 'medium', 'base', 'large'] as size}
		<Icon
			name="i-rokkit:mode-dark-solid"
			role="button"
			label="Toggle dark mode"
			{size}
			on:click={handleClick}
		/>
	{/each}
</span>
<pre>
	Icon clicked {count} times.
</pre>
