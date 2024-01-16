<script>
	import { defaultFields, defaultStateIcons, getValue, getText } from '@rokkit/core'

	let className = ''
	export { className as class }
	export let value
	export let name
	export let id = null
	export let fields = defaultFields
	export let options = []
	export let readOnly = false
	export let textAfter = true
	export let stateIcons = defaultStateIcons.radio

	$: fields = { ...defaultFields, ...fields }
	$: flexDirection = textAfter ? 'flex-row' : 'flex-row-reverse'
</script>

<radio-group
	{id}
	class="flex flex-col cursor-pointer select-none {className}"
	class:disabled={readOnly}
>
	{#each options as item}
		{@const itemValue = getValue(item, fields)}
		{@const label = getText(item, fields)}
		{@const state = itemValue === value ? 'on' : 'off'}

		<label class="flex {flexDirection} items-center gap-2">
			<input hidden type="radio" {name} bind:group={value} value={itemValue} {readOnly} />
			<icon class={stateIcons[state]} />
			<p>{label}</p>
		</label>
	{/each}
</radio-group>
