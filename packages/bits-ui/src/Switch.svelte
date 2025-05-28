<script>
	import { Switch } from 'bits-ui'
	let {
		id = undefined,
		name = undefined,
		value = $bindable(false),
		class: classNames = '',
		required = false,
		disabled = false
	} = $props()

	/**
	 * Updates the value
	 * @param {boolean} currentValue
	 */
	function handleChange(currentValue) {
		value = currentValue
	}
</script>

<Switch.Root
	{id}
	{name}
	class={classNames}
	checked={value}
	{required}
	{disabled}
	onCheckedChange={handleChange}
>
	<Switch.Thumb />
</Switch.Root>
