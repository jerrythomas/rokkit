<script lang="ts">
	import { Toggle, type ToggleProps } from '@rokkit/ui'

	type Props = Pick<ToggleProps, 'value' | 'options' | 'fields' | 'disabled' | 'size' | 'showLabels' | 'onchange'>

	let {
		value = $bindable(),
		options = [],
		fields,
		disabled = false,
		size,
		showLabels,
		onchange,
		..._rest
	}: Props = $props()
</script>

<Toggle {options} {fields} bind:value {onchange} {disabled} {size} {showLabels} />
