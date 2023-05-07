<script>
	import { Icon } from '@rokkit/core'

	let count = 0
	function handleClick() {
		count += 1
	}
</script>

<p>Basic Usage with custom classes</p>
<span class="flex items-center justify-around gap-2 py-2">
	{#each ['', 'text-primary', 'text-secondary', 'text-skin-500'] as color}
		<Icon name="i-rokkit:mode-dark" class={color} />
	{/each}
</span>
<p>In different sizes</p>
<span class="flex items-center justify-around gap-2 py-2">
	{#each ['small', 'medium', 'base', 'large'] as size}
		<Icon name="i-rokkit:mode-dark" {size} />
	{/each}
</span>
<p>And these are interactive buttons</p>
<span class="flex items-center justify-around gap-2 py-2">
	{#each ['small', 'medium', 'base', 'large'] as size}
		<Icon
			name="i-rokkit:mode-dark"
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
