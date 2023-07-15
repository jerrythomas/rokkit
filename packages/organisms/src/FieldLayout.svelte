<script>
	import { componentTypes } from './types'
	let className = ''

	export { className as class }
	export let value
	export let items = []
	export let schema = {}
	export let layout = {elements:[]}
	export let using = componentTypes
</script>

<segment class="{layout.type} {className}">
	{#each layout.elements as field}
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
