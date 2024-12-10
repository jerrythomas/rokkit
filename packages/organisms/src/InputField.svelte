<script>
	import { pick, omit } from 'ramda'
	import { Icon } from '@rokkit/atoms'
	import Input from './input/Input.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} name
	 * @property {any} [value]
	 * @property {string} [label]
	 * @property {string} [description]
	 * @property {string} [icon]
	 * @property {string} [type]
	 * @property {boolean} [required]
	 * @property {string} [status]
	 * @property {boolean} [disabled]
	 * @property {string} [message]
	 * @property {any} [using]
	 * @property {boolean} [nolabel]
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		class: className = '',
		name,
		value = $bindable(null),
		label = name,
		description = null,
		icon = null,
		type = 'text',
		required = false,
		status = 'default',
		disabled = false,
		message = null,
		using = $bindable({}),
		nolabel = false,
		...rest
	} = $props()

	// let usingComponents = $derived({ ...componentTypes, ...$registry, ...using })
	let pass = $derived(status === 'pass')
	let fail = $derived(status === 'fail')
	let warn = $derived(status === 'warn')
	let rootProps = $derived(pick(['id'], rest))
	let props = $derived({
		required,
		readOnly: disabled,
		...omit(['id'], rest),
		name
	})
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
		<Input id={name} bind:value {type} {...props} using={usingComponents} on:change />
		{#if type === 'checkbox'}
			<label for={name} class:required>{label}</label>
		{/if}
	</field>
	{#if message}
		<message class={status}>{message}</message>
	{/if}
</input-field>
