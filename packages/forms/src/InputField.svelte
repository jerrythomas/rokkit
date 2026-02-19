<script>
	import { pick, omit, isNil } from 'ramda'
	import Input from './Input.svelte'

	let {
		class: className,
		name,
		value = $bindable(),
		type,
		required,
		status,
		disabled,
		message,
		nolabel,
		icon,
		label,
		description,
		onchange,
		...restProps
	} = $props()

	let rootProps = $derived(pick(['id'], restProps))
	let properties = $derived({
		required,
		readOnly: disabled,
		...omit(['id'], restProps),
		name
	})
</script>

<div
	data-field-root
	{...rootProps}
	class={className}
	data-field-state={status}
	data-field-type={type}
	data-field-required={required}
	data-field-disabled={disabled}
	data-field-empty={isNil(value)}
	data-has-icon={!isNil(icon)}
>
	<div data-field aria-label={description ?? label ?? name}>
		{#if label && !nolabel}
			<label for={name}>{label}</label>
		{/if}
		<Input id={name} bind:value {type} {...properties} {onchange} {icon} />
	</div>
	{#if description}
		<div data-description>{description}</div>
	{/if}
	{#if message}
		<div data-message>{message}</div>
	{/if}
</div>
