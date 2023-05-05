<script>
	import { defaultFields } from './constants'
	import { Text } from './items'

	let className = ''
	export { className as class }
	export let items = [false, true]
	export let fields = defaultFields
	export let using = { default: Text }
	export let compact = true
	export let value

	const getComponent = (item, fields) => {
		return fields.component
			? item[fields.component] ?? using.default
			: using.default
	}

	const onItemClick = (item) => {
		value = item
	}

	$: useComponent = !items.every((item) => [false, true].includes(item))
	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Text, ...using }
</script>

{#if !Array.isArray(items) || items.length < 2}
	<error>Items should be an array with at least two items.</error>
{:else}
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<toggle-switch
		class="flex items-center {className}"
		class:compact
		tabindex="0"
	>
		{#each items as item, index (item)}
			{@const component = useComponent ? getComponent(item, fields) : null}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<item
				class="flex relative"
				class:is-selected={item === value}
				on:click={() => onItemClick(item)}
			>
				{#if item == value}
					<indicator class="absolute top-0 left-0 right-0 bottom-0" />
				{/if}
				{#if component}
					<svelte:component this={component} content={item} {fields} />
				{/if}
			</item>
		{/each}
	</toggle-switch>
{/if}
