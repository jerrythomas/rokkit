<script>
	import { equals } from 'ramda'
	import { noop } from '@rokkit/core'
	import { keyboard } from '@rokkit/actions'
	import { defaultMapping } from '@rokkit/molecules/constants'

	/**
	 * @typedef {Object} Props
	 * @property {string}      [class]
	 * @property {any}         value
	 * @property {Array<any>}  [options]
	 * @property {FieldMapper} [mapping]
	 * @property {boolean}     [compact]
	 * @property {boolean}     [disabled]
	 */

	/** @type {Props} */
	let {
		class: classes = '',
		value = $bindable(),
		options = [false, true],
		mapping = defaultMapping,
		compact = false,
		disabled = false,
		onchange = noop
	} = $props()

	let cursor = $state([])

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

	function handleClick(event) {
		const index = event.target.closest('[data-path]').dataset.path
		value = options[index]
		onchange(value)
	}
	const keyMapping = {
		next: ['ArrowRight', 'ArrowDown', ' ', 'Enter'],
		prev: ['ArrowLeft', 'ArrowUp']
	}
	let useComponent = $derived(!options.every((item) => [false, true].includes(item)))
</script>

{#if !Array.isArray(options) || options.length < 2}
	<rk-error>Items should be an array with at least two items.</rk-error>
{:else}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<rk-switch
		class={classes}
		class:is-off={options.length === 2 && equals(value, options[0])}
		class:is-on={options.length === 2 && equals(value, options[1])}
		class:compact
		aria-label="Toggle Switch"
		aria-orientation="horizontal"
		aria-disabled={disabled}
		tabindex="0"
		role="listbox"
		use:keyboard={keyMapping}
		onnext={() => toggle()}
		onprev={() => toggle(-1)}
		onclick={handleClick}
	>
		{#each options as item, index (item)}
			{@const Template = useComponent ? mapping.getComponent(item) : null}
			<rk-item class="relative" role="option" aria-selected={equals(item, value)} data-path={index}>
				{#if equals(item, value)}
					<rk-indicator class="absolute bottom-0 left-0 right-0 top-0"></rk-indicator>
				{/if}
				{#if Template}
					<Template value={item} {mapping} />
				{/if}
			</rk-item>
		{/each}
	</rk-switch>
{/if}
