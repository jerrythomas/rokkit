<script>
	import { inputTypes } from './types'
	let className = ''

	export { className as class }
	export let value
	export let items = []
	// export let mapping
	export let using = inputTypes
</script>

<segment class={className}>
	{#each items as field}
		{@const component = using[field.component]}
		{@const hasKey = 'key' in field}

		{#if field.items}
			{#if hasKey}
				<svelte:self
					bind:value={value[field.key]}
					items={field.items}
					{using}
					class={field.class}
				/>
			{:else}
				<svelte:self
					bind:value
					items={field.items}
					{using}
					class={field.class}
				/>
			{/if}
		{:else if 'key' in field}
			<svelte:component
				this={component}
				bind:value={value[field.key]}
				{...field.props}
			/>
		{:else}
			<svelte:component this={component} {...field.props} />
		{/if}
	{/each}
</segment>
