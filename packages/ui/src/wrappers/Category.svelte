<script>
	import { getContext } from 'svelte'
	import { defaultFields, FieldMapper } from '@rokkit/core'

	const registry = getContext('registry')

	let {
		class: className = '',
		options = [],
		fields = defaultFields,
		navigator = 'tabs',
		type = 'vertical',
		category = null,
		children,
		...restProps
	} = $props()

	let Template = $derived(registry.navigators[navigator] ?? registry.navigators.default)
</script>

<section class={className}>
	<Template {options} {fields} bind:value={category} {...restProps} />
	<field-layout class={type}>
		{@render children?.()}
	</field-layout>
</section>
