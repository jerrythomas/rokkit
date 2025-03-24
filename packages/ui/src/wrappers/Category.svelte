<script>
	import { getContext } from 'svelte'

	const registry = getContext('registry')

	let {
		class: className = '',
		options = [],
		fields,
		navigator = 'tabs',
		type = 'vertical',
		category = null,
		children,
		...restProps
	} = $props()

	let Template = $derived(registry.navigators[navigator] ?? registry.navigators.default)
</script>

<section class={className}>
	{#if Template}
		<Template {options} {fields} bind:value={category} {...restProps} />
	{/if}
	<field-layout class={type}>
		{@render children?.()}
	</field-layout>
</section>
