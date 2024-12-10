<script>
	import { getContext } from 'svelte'
	import { defaultFields } from '@rokkit/core'

	const registry = getContext('registry')

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [options]
	 * @property {string} [type]
	 * @property {any} [category]
	 * @property {any} [fields]
	 * @property {string} [navigator]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		class: className = '',
		options = [],
		type = 'vertical',
		category = $bindable(null),
		fields = defaultFields,
		navigator = 'tabs',
		children,
		...rest
	} = $props()

	let component = $derived($registry.navigators[navigator] ?? $registry.navigators.default)

	const SvelteComponent = $derived(component)
</script>

<section class={className}>
	<SvelteComponent
		{options}
		{fields}
		using={$registry.components}
		bind:value={category}
		{...rest}
	/>
	<field-layout class={type}>
		{@render children?.()}
	</field-layout>
</section>
