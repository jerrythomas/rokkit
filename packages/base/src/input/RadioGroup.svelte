<script>
	import { defaultStateIcons, defaultOptions } from '../constants'

	let className = ''
	export { className as class }
	export let id = null
	export let name
	export let fields
	export let items = []
	export let value
	export let status = 'default'
	export let disabled = false
	export let stateIcons = defaultStateIcons.radio

	$: fields = { ...defaultOptions, ...fields }
	$: pass = status === 'pass'
	$: fail = status === 'fail'
</script>

<radio
	{id}
	class="flex flex-col cursor-pointer select-none {className}"
	class:disabled
	class:pass
	class:fail
>
	{#each items as item}
		{@const state = item[fields.value] === value ? 'on' : 'off'}
		<label class="flex flex-row items-center gap-2">
			<input
				hidden
				type="radio"
				{name}
				bind:group={value}
				value={item[fields.value]}
				readOnly={disabled}
			/>
			<icon class={stateIcons[state]} />
			<p>{item[fields.label]}</p>
		</label>
	{/each}
</radio>
