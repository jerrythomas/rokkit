<script>
	import Connector from './Connector.svelte'
	import { Icon } from '@sparsh-ui/icons'

	export let content
	export let fields = {}
	export let types = []
	export let hasChildren = false
	export let linesVisible

	function toggle() {
		content.isOpen = !content.isOpen
	}
</script>

<node
	class="flex flex-row h-8 gap-2 leading-loose items-center cursor-pointer select-none"
	on:click={toggle}
>
	{#each types.slice(1) as type}
		<Connector type={linesVisible ? type : 'empty'} />
	{/each}

	{#if hasChildren}
		<span class="flex flex-col w-4 h-full items-center justify-center">
			{#if content.isOpen}
				<Icon size="100%" name="node-open" title="Collapse" />
			{:else}
				<Icon size="100%" name="node-closed" title="Expand" />
			{/if}
		</span>
	{/if}
	{#if content[fields.image]}
		<img
			class="h-8 w-8 rounded-full"
			alt={content[fields.text]}
			src={content[fields.image]}
		/>
	{/if}
	{#if content[fields.icon]}
		<Icon name={content[fields.icon]} title={content[fields.text]} />
	{/if}

	<p class="flex flex-grow">{content[fields.text]}</p>
</node>
