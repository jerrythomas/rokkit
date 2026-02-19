<script>
	// import { onMount } from 'svelte'
	// import { $state, $derived } from 'svelte'

	/**
	 * @typedef {Object} Props
	 * @property {any[]} options
	 * @property {any}   value
	 */

	/** @type Props */
	let { options, value = $bindable() } = $props()

	// const optionRefs = new Map<number, HTMLLabelElement>()

	// const $indicatorStyle = $derived(() => {
	// 	const el = optionRefs.get(value)
	// 	if (!el) return ''
	// 	const { offsetLeft, offsetWidth } = el
	// 	return `transform: translateX(${offsetLeft}px); width: ${offsetWidth}px;`
	// })

	// onMount(() => {
	// 	setTimeout(() => {
	// 		optionRefs.get(value)?.offsetLeft
	// 	})
	// })
</script>

<div class="relative inline-flex rounded-md bg-gray-200 p-1" data-pickone-root role="radiogroup">
	<!-- Indicator -->
	<div
		class="absolute h-full rounded-md bg-white shadow transition-all duration-300"
		data-pickone-current
		aria-hidden="true"
	></div>

	{#each options as option, index (index)}
		<div
			class="relative z-10 cursor-pointer text-sm font-medium text-gray-700"
			data-pickone-option
			aria-checked={option === value}
			role="radio"
		>
			<label class="bg-red flex size-full px-4 py-2">
				<input
					type="radio"
					name="pickone"
					value={option}
					class="peer hidden"
					checked={option === value}
					onchange={() => (value = option)}
				/>
				<span class="transition peer-checked:font-semibold peer-checked:text-black">
					{option}
				</span>
			</label>
		</div>
	{/each}
</div>
