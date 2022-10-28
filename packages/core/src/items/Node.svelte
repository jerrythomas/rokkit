<script>
	import Connector from './Connector.svelte'
	import { defaultFields, defaultStateIcons } from '../constants'

	export let content
	export let fields = defaultFields
	export let types = []
	export let hasChildren = false
	export let stateIcons = defaultStateIcons.node
	export let linesVisible = true

	function toggle() {
		content.isOpen = !content.isOpen
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
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
				<icon class={stateIcons.opened} aria-label="collapse" />
			{:else}
				<icon class={stateIcons.closed} aria-label="expand" />
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
		<icon class={content[fields.icon]} title={content[fields.text]} />
	{/if}

	<p class="flex flex-grow">{content[fields.text]}</p>
</node>
