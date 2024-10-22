<script>
	import { run } from 'svelte/legacy';

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
	let { value = $bindable(), type = 'text', using = $bindable({}), ...rest } = $props();

	run(() => {
		using = { ...types, ...using, ...$registry?.editors }
	});
</script>

{#if type in using}
	{@const SvelteComponent = using[type]}
	<SvelteComponent bind:value {...rest} on:change on:focus on:blur />
{:else}
	<error>Type "{type}" is not supported by Input</error>
{/if}
