<script>
	import { defaultFields, getValue, getText } from '@rokkit/core'

	let className = ''
	export { className as class }
	export let value
	export let fields = defaultFields
	export let options = []
	export let readonly = false
	export let textAfter = true

	$: fields = { ...defaultFields, ...fields }
	$: flexDirection = textAfter ? 'flex-row' : 'flex-row-reverse'
</script>

<radio-group class={className} class:disabled={readonly}>
	{#each options as item}
		{@const itemValue = getValue(item, fields)}
		{@const label = getText(item, fields)}

		<label class="flex {flexDirection} items-center gap-2">
			<input
				type="radio"
				{...$$restProps}
				bind:group={value}
				value={itemValue}
				readOnly={readonly}
				on:change
				on:focus
				on:blur
			/>
			<p>{label}</p>
		</label>
	{/each}
</radio-group>
