<script>
	import { FieldMapper, noop, defaultStateIcons } from '@rokkit/core'
	import { equals } from 'ramda'

	/**
	 * @typedef {Object} Props
	 * @property {any}           value
	 * @property {FieldMapper}   mapping
	 * @property {Array<Object>} options
	 * @property {Function}      onchange
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		class: classes = '',
		value = $bindable(),
		mapping = new FieldMapper(),
		options = [],
		icons = defaultStateIcons['selector'],
		onchange = noop,
		...rest
	} = $props()

	const handleChange = (event) => {
		value = options[indexValue]
		onchange(options[indexValue])
	}

	let indexValue = $state(options.findIndex((item) => equals(item, value)))
</script>

<rk-select class={classes}>
	<select
		name="sources"
		id="sources"
		class="custom-select"
		bind:value={indexValue}
		{...rest}
		onchange={handleChange}
	>
		{#each options as option, index (index)}
			<option value={index}>
				{mapping.get('text', option)}
			</option>
		{/each}
	</select>
	<span class="pointer-events-none absolute right-2 top-0 flex min-h-full items-center">
		<i class={icons['opened']}></i>
	</span>
</rk-select>

<style lang="postcss">
	rk-select {
		position: relative;
		display: inline-block;
	}
	rk-select > select {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
	}
</style>
