<script>
	import { createBubbler } from 'svelte/legacy'

	const bubble = createBubbler()
	import { Icon } from '@rokkit/atoms'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [leftIcon]
	 * @property {any} [rightIcon]
	 * @property {any} [label]
	 * @property {string} [type]
	 * @property {string} [style]
	 * @property {import('svelte').Snippet} [left]
	 * @property {import('svelte').Snippet} [children]
	 * @property {import('svelte').Snippet} [right]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		leftIcon = null,
		rightIcon = null,
		label = null,
		type = 'submit',
		style = 'default',
		left,
		children,
		right
	} = $props()

	let isPrimary = $derived(type === 'primary')
	let isOutlined = $derived(style === 'outlined')
</script>

<button
	type="submit"
	class="flex flex-row items-center {className}"
	onclick={bubble('click')}
	class:is-primary={isPrimary}
	class:is-outlined={isOutlined}
>
	{#if leftIcon}
		<icon-left class="flex flex-row">
			{#if left}{@render left()}{:else}
				<Icon name={leftIcon} />
			{/if}
		</icon-left>
	{/if}
	{#if children}{@render children()}{:else if label}
		<p>{label}</p>
	{/if}
	{#if rightIcon}
		<icon-right>
			{#if right}{@render right()}{:else}
				<Icon name={rightIcon} />
			{/if}
		</icon-right>
	{/if}
</button>
