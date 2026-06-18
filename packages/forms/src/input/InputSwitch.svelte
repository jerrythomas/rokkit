<script lang="ts">
	import { Switch, type SwitchProps } from '@rokkit/ui'

	type Props = SwitchProps & {
		name?: string
	}

	let { name, value = $bindable(), options, fields, onchange, ...restProps }: Props = $props()
</script>

<input {name} type="hidden" bind:value />
<Switch {options} {fields} bind:value {onchange} {...restProps} />
