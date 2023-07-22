<script>
	import {
		defaultFields,
		defaultStateIcons,
		getId,
		getText
	} from '@rokkit/core'

	let className = ''
	export { className as class }
	export let value
	export let name
	export let id = null
	export let fields = defaultFields
	export let native = false
	export let options = []
	export let readOnly = false
	export let textAfter = true
	export let stateIcons = defaultStateIcons.radio

	$: fields = { ...defaultFields, ...fields }
	$: flexDirection = textAfter ? 'flex-row' : 'flex-row-reverse'
</script>

<radio
	{id}
	class="flex flex-col cursor-pointer select-none {className}"
	class:disbled={readOnly}
>
	{#each options as item}
		{@const itemValue = getId(item, fields)}
		{@const label = getText(item, fields)}
		{@const state = itemValue === value ? 'on' : 'off'}

		<label class="flex {flexDirection} items-center gap-2">
			<input
				hidden={!native}
				type="radio"
				{name}
				bind:group={value}
				value={itemValue}
				{readOnly}
			/>
			{#if !native}
				<icon class={stateIcons[state]} />
			{/if}
			<p>{label}</p>
		</label>
	{/each}
</radio>
