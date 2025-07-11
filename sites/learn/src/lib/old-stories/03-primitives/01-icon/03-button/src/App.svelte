<script>
	import { Icon } from '@rokkit/ui'

	let count = $state(0)
	function handleClick() {
		count += 1
	}
</script>

<span class="flex items-center justify-start gap-2 py-2">
	{#each ['small', 'medium', 'base', 'large'] as size (size)}
		<Icon
			name="i-rokkit:mode-dark"
			role="button"
			label="Toggle dark mode"
			{size}
			onclick={handleClick}
		/>
	{/each}
</span>
<pre>
	Icon clicked {count} times.
</pre>
