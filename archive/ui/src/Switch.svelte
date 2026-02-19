<script>
	import { equals } from 'ramda'
	import { keyboard } from '@rokkit/actions'
	import { Proxy } from '@rokkit/states'
	import Item from './Item.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string}                              [class]
	 * @property {any}                                 value
	 * @property {import('@rokkit/core').FieldMapping} fields
	 * @property {Array<any>}                          [options]
	 * @property {boolean}                             [compact]
	 * @property {boolean}                             [disabled]
	 */

	/** @type {Props} */
	let {
		class: classes = '',
		value = $bindable(),
		description = 'Toggle Switch',
		options = [false, true],
		fields,
		compact = false,
		disabled = false,
		onchange,
		child,
		...extra
	} = $props()

	/**
	 * Toggles the value of the switch
	 * @param {number}  direction - The direction to toggle the switch
	 */
	function toggle(direction = 1) {
		let nextIndex
		const index = options.indexOf(value)
		if (index === -1) {
			nextIndex = direction === -1 ? options.length - 1 : 0
		} else {
			nextIndex = (index + direction + options.length) % options.length
		}

		value = options[nextIndex]
		onchange(value)
	}

	/**
	 *
	 * @param event
	 */
	function handleClick(event) {
		const index = event.target.closest('[data-path]').dataset.path
		value = options[index]
		onchange(value)
	}
	const keyMapping = {
		next: ['ArrowRight', 'ArrowDown', ' ', 'Enter'],
		prev: ['ArrowLeft', 'ArrowUp']
	}

	let childSnippet = $derived(child ? child : defaultChild)
</script>

{#snippet defaultChild(proxy)}
	<Item {proxy} />
{/snippet}

{#if !Array.isArray(options) || options.length < 2}
	<div data-error>Items should be an array with at least two items.</div>
{:else}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class={classes}
		data-switch-root
		data-switch-off={options.length === 2 && equals(value, options[0])}
		data-switch-on={options.length === 2 && equals(value, options[1])}
		data-switch-compact={compact}
		aria-label={description}
		aria-orientation="horizontal"
		aria-disabled={disabled}
		tabindex="0"
		role="listbox"
		use:keyboard={keyMapping}
		onnext={() => toggle()}
		onprev={() => toggle(-1)}
		onclick={handleClick}
	>
		{#each options as item, index (index)}
			{@const proxy = new Proxy(item, fields)}
			<div
				data-switch-item
				class="relative"
				role="option"
				aria-selected={equals(item, value)}
				data-path={index}
			>
				{#if equals(item, value)}
					<div data-switch-mark class="absolute bottom-0 left-0 right-0 top-0"></div>
				{/if}

				{@render childSnippet?.(proxy)}
			</div>
		{/each}
	</div>
{/if}
