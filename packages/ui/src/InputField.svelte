<script>
	import { getContext } from 'svelte'
	import { pick, omit } from 'ramda'
	import Icon from './Icon.svelte'
	import Input from './input/Input.svelte'
	import { componentTypes } from './types'

	const registry = getContext('registry')

	let {
		class: className,
		name,
		value,
		type,
		required,
		status,
		disabled,
		message,
		using,
		nolabel,
		icon,
		label,
		description,
		...restProps
	} = $props()

	using = { ...componentTypes, ...registry, ...using }
	let pass = status === 'pass'
	let fail = status === 'fail'
	let warn = status === 'warn'
	let rootProps = pick(['id'], restProps)
	let properties = {
		required,
		readOnly: disabled,
		...omit(['id'], restProps),
		name
	}
</script>

<input-field
	{...rootProps}
	class="flex flex-col input-{type} {className} "
	class:disabled
	class:pass
	class:fail
	class:warn
	class:empty={!value}
>
	{#if label && !nolabel && !['switch', 'checkbox'].includes(type)}
		<label for={name} class:required>
			{label}
		</label>
	{/if}
	<field class="flex w-full flex-row items-center" aria-label={description ?? label ?? name}>
		{#if icon}
			<Icon name={icon} />
		{/if}
		{#if type === 'switch'}
			<label for={name} class:required>{label}</label>
		{/if}
		<Input id={name} bind:value {type} {...properties} {using} on:change />
		{#if type === 'checkbox'}
			<label for={name} class:required>{label}</label>
		{/if}
	</field>
	{#if message}
		<message class={status}>{message}</message>
	{/if}
</input-field>
