<script>
	import { defaultFields } from './constants'
	import { Text } from './items'

	export let items = []
	export let separator = '/'
	export let fields
	export let using

	$: fields = { ...defaultFields, ...(fields ?? {}) }
	$: using = { default: Text, ...(using ?? {}) }
</script>

<crumbs class="flex">
	{#each items as item, index}
		{@const component = item[fields.component]
			? using[item[fields.component]] || using.default
			: using.default}
		{#if index > 0}
			<span>
				{#if separator.length == 1}
					{separator}
				{:else}
					<icon class={separator} />
				{/if}
			</span>
		{/if}
		<crumb class:is-selected={index == items.length - 1}>
			<svelte:component this={component} content={item} {fields} />
		</crumb>
	{/each}
</crumbs>
