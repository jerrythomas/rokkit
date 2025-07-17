<script>
	import { pick, omit, isNil } from 'ramda'
	import { Icon } from '@rokkit/ui'
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

	let rootProps = pick(['id'], restProps)
	let properties = {
		required,
		readOnly: disabled,
		...omit(['id'], restProps),
		name
	}
</script>

<div
	data-field-root
	{...rootProps}
	class={className}
	data-field-disabled={disabled}
	data-field-state={status}
	data-field-empty={isNil(value)}
	data-field-required={required}
	data-field-type={type}
>
	{#if label && !nolabel && !['switch', 'checkbox'].includes(type)}
		<label for={name}>{label}</label>
	{/if}
	<div data-field aria-label={description ?? label ?? name}>
		{#if icon}
			<Icon name={icon} />
		{/if}
		{#if type === 'switch'}
			<label for={name}>{label}</label>
		{/if}
		<Input id={name} bind:value {type} {...properties} {onchange} />
		{#if type === 'checkbox'}
			<label for={name}>{label}</label>
		{/if}
	</div>
	{#if description}
		<div data-description>{description}</div>
	{/if}
	{#if message}
		<div data-message>{message}</div>
	{/if}
</div>
