<script>
	import { getContext } from 'svelte'
	import { Tabs, Select } from '@rokkit/organisms'
	import CodeSnippet from './CodeSnippet.svelte'

	const media = getContext('media')

	
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} items
	 * @property {any} fields
	 * @property {any} [value]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		items,
		fields,
		value = $bindable(null)
	} = $props();

	let navigator = media && $media.small ? Select : Tabs

	const SvelteComponent = $derived(navigator);
</script>

<multi-file class="flex flex-col {className}">
	<nav class="w-full items-center">
		<SvelteComponent {items} {fields} bind:value />
	</nav>
	{#if value}
		{@const language = value.file.split('.')[1]}
		<CodeSnippet code={value.code} {language} />
	{/if}
</multi-file>
