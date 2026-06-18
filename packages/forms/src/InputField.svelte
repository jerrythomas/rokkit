<script lang="ts">
	import Input from './Input.svelte'
	import type { Component } from 'svelte'

	type FieldMessage = { state?: string; text?: string }

	type Props = {
		class?: string
		name?: string
		value?: unknown
		type?: string
		required?: boolean
		status?: string
		disabled?: boolean
		dirty?: boolean
		message?: FieldMessage | string
		nolabel?: boolean
		icon?: string
		label?: string
		description?: string
		onchange?: (value: unknown) => void
		onblur?: () => void
		id?: string
		renderers?: Record<string, Component<Record<string, unknown>>>
		/**
		 * Field layout — controls how the label and input are arranged.
		 *
		 * - `stacked` (default) — label above input. Best for form pages
		 *   with full-width inputs and long labels.
		 * - `inline` — label and input on the same row (label takes a
		 *   fixed leading column). Best for compact control panels —
		 *   playground knob rows, settings dialogs, tweak editors.
		 */
		variant?: 'stacked' | 'inline'
	} & Record<string, unknown>

	let {
		class: className,
		name,
		value = $bindable(),
		type,
		required,
		status,
		disabled,
		dirty,
		message,
		nolabel,
		icon,
		label,
		description,
		onchange,
		id,
		renderers,
		variant = 'stacked',
		...restProps
	}: Props = $props()

	let rootProps = $derived(id !== null && id !== undefined ? { id } : {})
	let properties = $derived({
		required,
		readOnly: disabled,
		...restProps,
		name
	})

	let messageState = $derived(typeof message === 'object' ? message?.state : undefined)
	let messageText = $derived(typeof message === 'object' ? message?.text : message)
</script>

<div
	data-field-root
	{...rootProps}
	class={className}
	data-field-state={status ?? messageState}
	data-field-type={type}
	data-field-required={required}
	data-field-disabled={disabled}
	data-field-dirty={dirty || undefined}
	data-field-empty={value === null || value === undefined}
	data-has-icon={icon !== null && icon !== undefined}
	data-field-layout={variant}
>
	<div data-field aria-label={description ?? label ?? name}>
		{#if label && !nolabel}
			<label for={name}>{label}</label>
		{/if}
		<Input id={name} bind:value {type} {...properties} {onchange} {icon} {renderers} />
	</div>
	{#if description}
		<div data-description>{description}</div>
	{/if}
	{#if message}
		<div data-message data-message-state={messageState ?? 'info'}>
			{messageText}
		</div>
	{/if}
</div>
