<script>
	import { getContext } from 'svelte'
	import { pick, omit } from 'ramda'
	import { Icon } from '@rokkit/atoms'
	import Input from './input/Input.svelte'
	import { componentTypes } from './types'

	const registry = getContext('registry')

	let className = ''
	export { className as class }
	export let name
	/** @type {any} */
	export let value = null
	/** @type {string} */
	export let label = name
	/** @type {string} */
	export let description = null
	/** @type {string} */
	export let icon = null
	export let type = 'text'
	export let required = false
	export let status = 'default'
	export let disabled = false
	/** @type {string} */
	export let message = null
	export let using = {}
	export let nolabel = false

	$: using = { ...componentTypes, ...$registry, ...using }
	$: pass = status === 'pass'
	$: fail = status === 'fail'
	$: warn = status === 'warn'
	$: rootProps = pick(['id'], $$restProps)
	$: props = {
		required,
		readOnly: disabled,
		...omit(['id'], $$restProps),
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
	<field class="w-full flex flex-row items-center" aria-label={description ?? label ?? name}>
		{#if icon}
			<Icon name={icon} />
		{/if}
		{#if type === 'switch'}
			<label for={name} class:required>{label}</label>
		{/if}
		<Input id={name} bind:value {type} {...props} {using} on:change />
		{#if type === 'checkbox'}
			<label for={name} class:required>{label}</label>
		{/if}
	</field>
	{#if message}
		<message class={status}>{message}</message>
	{/if}
</input-field>
