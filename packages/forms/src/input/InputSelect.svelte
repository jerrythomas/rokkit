<script>
	import { noop, defaultStateIcons } from '@rokkit/core'
	import { Proxy as RokProxy } from '@rokkit/states'
	import { equals } from 'ramda'

	/**
	 * @typedef {Object} InputSelectProps
	 * @property {any}           value
	 * @property {Object}        fields
	 * @property {Array<Object>} options
	 * @property {Function}      onchange
	 * @property {Function}      onfocus
	 * @property {Function}      onblur
	 */

	/** @type {InputSelectProps & { [key: string]: any }} */
	let {
		class: classes = '',
		value = $bindable(),
		fields,
		options = [],
		icons = defaultStateIcons['selector'],
		onchange = noop,
		onfocus,
		onblur,
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
		{onfocus}
		{onblur}
	>
		{#each options as option, index (index)}
			{@const proxy = new RokProxy(option, fields)}
			<option value={index}>
				{proxy.get('text')}
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
