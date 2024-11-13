<script>
	import { getContext } from 'svelte'
	import { types } from './types'

	const registry = getContext('registry')

	/**
	 * @typedef {Object} Props
	 * @property {any} value
	 * @property {string} [type]
	 * @property {any} [using]
	 */

	/** @type {Props & { [key: string]: any }} */
	let { value = $bindable(), type = 'text', using = $bindable({}), ...rest } = $props()
	let components = $derived({ ...types, ...using, ...$registry?.editors })
</script>

{#if type in components}
	{@const SvelteComponent = components[type]}
	<SvelteComponent bind:value {...rest} />
{:else}
	<error>Type "{type}" is not supported by Input</error>
{/if}
