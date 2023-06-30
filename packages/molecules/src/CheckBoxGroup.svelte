<script>
	import { defaultStateIcons, defaultOptions } from 'rokkit/utils'

	let className = ''
	export { className as class }
	export let id = null
	export let name
	export let fields
	export let value = []
	export let items = []
	export let status = 'default'
	export let disabled = false

	export let stateIcons = defaultStateIcons.checkbox

	$: fields = { ...defaultOptions, ...fields }
	$: pass = status === 'pass'
	$: fail = status === 'fail'
	$: warn = status === 'warn'
</script>

<checkbox-group
	{id}
	class="flex flex-col select-none cursor-pointer {className}"
	class:disabled
	class:pass
	class:fail
	class:warn
>
	{#each items as item}
		{@const state = item[fields.checked] ? 'checked' : 'unchecked'}
		<label class="flex flex-row items-center gap-1 leading-loose">
			<input
				hidden
				{name}
				type="checkbox"
				bind:checked={item[fields.checked]}
				bind:group={value}
				value={item[fields.value]}
				on:change
			/>
			<icon class={stateIcons[state]} />
			<p>{item[fields.label]}</p>
		</label>
	{/each}
</checkbox-group>
